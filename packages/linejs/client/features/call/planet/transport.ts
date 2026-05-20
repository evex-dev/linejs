/**
 * PLANET transport — UDP + framing + crypto + Cassini.
 *
 * This is the LINE-native replacement for AndromedaTransport's
 * standard-SIP signaling layer. The media plane (RTP/SRTP/Opus) is
 * unchanged and continues to use linejs's existing srtp.ts / opus.ts.
 *
 * Data flow on send:
 *   Cassini message  ─►  AES-256-CTR(HKDF(mpkey)) + HMAC tag
 *                    ─►  prepend fixed header (type, length, sequence)
 *                    ─►  prepend chunk header (16-bit packed)
 *                    ─►  UDP sendto(cscf IPv6)
 *
 * Receive is the inverse.
 */

import { Buffer } from "node:buffer";
import type { Socket as DgramSocket } from "node:dgram";
import type * as LINETypes from "@evex/linejs-types";
import type { CallTransport } from "../session.ts";
import {
	buildFrameHeader,
	parseFrameHeader,
	type PlanetFixedHdr,
} from "./framing.ts";
import {
	buildIv,
	decodeMpKey,
	decryptCtr,
	deriveSessionKeys,
	encryptCtr,
	hmacTag,
	type PlanetSessionKeys,
	tagEquals,
} from "./crypto.ts";
import { buildRelReq, buildSetupReq, CASSINI_MSG, unpackCassini } from "./cassini.ts";

export interface PlanetTransportOpts {
	localMid: string;
	timeoutMs?: number;
}

interface CallRouteParsed {
	cscfHost: string;
	cscfPort: number;
	cscfHost6?: string;
	mpkey: Uint8Array;
	toMid: string;
	fromToken: string;
}

function parseRoute(r: LINETypes.CallRoute): CallRouteParsed {
	const commParam = JSON.parse(r.commParam || "{}");
	const mpkeyB64 = commParam.mpkey;
	if (!mpkeyB64) throw new Error("CallRoute.commParam.mpkey missing");
	return {
		cscfHost: r.voipAddress.split(",")[0],
		cscfPort: r.voipUdpPort,
		cscfHost6: r.voipAddress6?.split(",")[0],
		mpkey: decodeMpKey(mpkeyB64),
		toMid: r.toMid,
		fromToken: r.fromToken,
	};
}

export class PlanetTransport implements CallTransport {
	#opts: PlanetTransportOpts;
	#sock?: DgramSocket;
	#route?: CallRouteParsed;
	#keys?: PlanetSessionKeys;
	#nextSeq = 0x01d0;
	#pending: ((m: Uint8Array) => void)[] = [];

	constructor(opts: PlanetTransportOpts) {
		this.#opts = opts;
	}

	async connect(opts: { route: LINETypes.CallRoute }): Promise<void> {
		this.#route = parseRoute(opts.route);
		this.#keys = deriveSessionKeys(
			this.#route.mpkey,
			this.#opts.localMid,
			this.#route.toMid,
		);
		const dgram = await import("node:dgram");
		const sock = dgram.createSocket(this.#route.cscfHost6 ? "udp6" : "udp4");
		this.#sock = sock;
		await new Promise<void>((res) =>
			sock.bind({ address: "::", port: 0 }, () => res())
		);
		sock.on("message", (buf) => this.#onWire(new Uint8Array(buf)));
	}

	#onWire(wire: Uint8Array) {
		// Try to deframe + decrypt. If it parses as a Cassini message, dispatch.
		try {
			const { fixed } = parseFrameHeader(wire);
			const body = wire.subarray(6);
			const decrypted = this.#decrypt(body, fixed.sequence);
			if (decrypted) {
				const w = this.#pending.shift();
				if (w) w(decrypted);
			}
		} catch (_e) {
			// Not a PLANET frame — likely SRTP, ignore here
		}
	}

	#decrypt(body: Uint8Array, sequence: number): Uint8Array | null {
		if (!this.#keys) return null;
		if (body.length < 16) return null;
		const tag = body.subarray(body.length - 16);
		const ct = body.subarray(0, body.length - 16);
		const expected = hmacTag(this.#keys.macKey, ct);
		if (!tagEquals(tag, expected)) return null;
		const iv = buildIv(this.#keys.ivPrefix, sequence);
		return decryptCtr(this.#keys.encKey, iv, ct);
	}

	#encrypt(plaintext: Uint8Array, sequence: number): Uint8Array {
		if (!this.#keys) throw new Error("not connected");
		const iv = buildIv(this.#keys.ivPrefix, sequence);
		const ct = encryptCtr(this.#keys.encKey, iv, plaintext);
		const tag = hmacTag(this.#keys.macKey, ct);
		const out = new Uint8Array(ct.length + tag.length);
		out.set(ct, 0);
		out.set(tag, ct.length);
		return out;
	}

	async #sendCassini(msg: Uint8Array): Promise<void> {
		if (!this.#sock || !this.#route) throw new Error("not connected");
		const seq = this.#nextSeq++;
		const enc = this.#encrypt(msg, seq);
		const fixed: PlanetFixedHdr = {
			type: 0,
			flagA: false,
			length: enc.length & 0x7ff,
			flagB: false,
			sequence: seq & 0x7fff,
		};
		const hdr = buildFrameHeader(0x10de, fixed); // chunkLogical: best-effort fixed value
		const datagram = new Uint8Array(hdr.length + enc.length);
		datagram.set(hdr, 0);
		datagram.set(enc, hdr.length);
		const host = this.#route.cscfHost6 || this.#route.cscfHost;
		await new Promise<void>((res, rj) => {
			this.#sock!.send(
				Buffer.from(datagram),
				this.#route!.cscfPort,
				host,
				(e) => e ? rj(e) : res(),
			);
		});
	}

	#waitForReply(timeoutMs: number): Promise<Uint8Array> {
		return new Promise<Uint8Array>((res, rj) => {
			const t = setTimeout(() => rj(new Error("PLANET reply timeout")), timeoutMs);
			this.#pending.push((m) => {
				clearTimeout(t);
				res(m);
			});
		});
	}

	async invite(opts: { to: string }): Promise<unknown> {
		if (!this.#route || !this.#keys) throw new Error("connect first");
		const sdpOffer = new TextEncoder().encode(
			"v=0\r\no=- 0 0 IN IP4 0.0.0.0\r\ns=-\r\nc=IN IP4 0.0.0.0\r\n" +
				"t=0 0\r\nm=audio 0 RTP/SAVP 96\r\na=rtpmap:96 opus/48000/2\r\n",
		);
		const setupMsg = buildSetupReq({
			msgId: this.#nextSeq,
			fromMid: this.#opts.localMid,
			toMid: opts.to,
			callType: "AUDIO",
			fromToken: this.#route.fromToken,
			sdpOffer,
		});
		await this.#sendCassini(setupMsg);
		const reply = await this.#waitForReply(this.#opts.timeoutMs ?? 10000);
		const { hdr } = unpackCassini(reply);
		if (hdr.type !== CASSINI_MSG.SETUP_RSP) {
			throw new Error(`PLANET invite: unexpected reply type 0x${hdr.type.toString(16)}`);
		}
		return reply;
	}

	async close(): Promise<void> {
		try {
			const rel = buildRelReq({
				msgId: this.#nextSeq,
				fromMid: this.#opts.localMid,
				reason: "user-ended",
			});
			if (this.#sock) await this.#sendCassini(rel);
		} catch { /* */ }
		await new Promise<void>((res) => this.#sock?.close(() => res()));
	}

	send(_packet: Uint8Array): void | Promise<void> {
		// Media-plane send happens through the SRTP layer in AndromedaTransport;
		// PlanetTransport is signaling-only.
		throw new Error("PlanetTransport.send: use AndromedaTransport for media");
	}

	async *receive(): AsyncIterable<Uint8Array> {
		// Media-plane receive lives in AndromedaTransport; signaling-only here.
		return;
	}
}
