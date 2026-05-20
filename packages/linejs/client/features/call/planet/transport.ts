/**
 * PLANET transport — full state-machine implementation.
 *
 * Flow:
 *   1. acquireRoute (caller already did)
 *   2. connect(route): generate ephemeral keypair, derive session keys
 *      via 2-stage HKDF, open UDP socket to cscf
 *   3. invite(to): send SETUP_REQ (planet_msg with cc_msg.setup_req,
 *      rmt_nonce=0 since we don't yet know cscf's loc_nonce)
 *   4. First reply: decrypt, parse planet_msg_hdr,
 *      extract cscf's loc_nonce → use as session.rmtNonce going forward
 *      (libandromeda 0xcaa524: `str x8, [x19, #0xa0]`)
 *   5. Subsequent sends: include the captured rmt_nonce
 *   6. close(): send REL_REQ
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
	aesCtrDecrypt,
	aesCtrEncrypt,
	buildCtrIv,
	decodeMpKey,
	deriveCallKeys,
	type EphemeralKeypair,
	generateEphemeralKeypair,
	hmacTag,
	newSessionId,
	tagEquals,
	type TransportKeys,
} from "./crypto.ts";
import {
	CC_MSG,
	type CcSetupReq,
	decodeFields,
	extractRmtNonceFromReply,
	packCcSetupReq,
	packPlanetCcMsg,
	packPlanetMsg,
	type PlanetMsgHdr,
	WireType,
	wrapCcMsg,
} from "./schema.ts";

export interface PlanetTransportOpts {
	localMid: string;
	deviceInfo?: string;
	timeoutMs?: number;
}

interface CallRouteParsed {
	cscfHost: string;
	cscfPort: number;
	cscfHost6?: string;
	peerPub: Uint8Array;
	toMid: string;
	fromToken: string;
	iZone?: string;
	rZone?: string;
	stid?: string;
	stnpk?: string;
}

function parseRoute(r: LINETypes.CallRoute): CallRouteParsed {
	const commParam = JSON.parse(r.commParam || "{}");
	const mpkeyB64 = commParam.mpkey;
	if (!mpkeyB64) throw new Error("CallRoute.commParam.mpkey missing");
	return {
		cscfHost: r.voipAddress.split(",")[0],
		cscfPort: r.voipUdpPort,
		cscfHost6: r.voipAddress6?.split(",")[0],
		peerPub: decodeMpKey(mpkeyB64),
		toMid: r.toMid,
		fromToken: r.fromToken,
		iZone: r.fromZone,
		rZone: r.toZone,
		stid: r.stid,
		stnpk: r.stnpk,
	};
}

const HEADER_LEN = 6;

export class PlanetTransport implements CallTransport {
	#opts: PlanetTransportOpts;
	#sock?: DgramSocket;
	#route?: CallRouteParsed;
	#local?: EphemeralKeypair;
	#sendKeys?: TransportKeys;
	#recvKeys?: TransportKeys;
	#sessId?: Uint8Array;
	#callUuid?: string;
	#callUuid16?: Uint8Array;

	// Per-msg sequence + protocol state
	#nextSeq = 0x01d0;
	#tranSeq = 1;
	#msgIdCounter = 1;

	// loc_nonce we generate, rmt_nonce we learn from cscf's first reply
	#locNonce = 0n;
	#rmtNonce = 0n;
	#nonceLearned = false;

	#pending: Array<(env: Uint8Array | Error) => void> = [];

	constructor(opts: PlanetTransportOpts) {
		this.#opts = opts;
	}

	async connect(opts: { route: LINETypes.CallRoute }): Promise<void> {
		this.#route = parseRoute(opts.route);
		this.#local = generateEphemeralKeypair();
		this.#sessId = newSessionId();
		this.#callUuid16 = crypto.getRandomValues(new Uint8Array(16));
		this.#callUuid = crypto.randomUUID();

		// Random per-session nonces — sendLabel/recvLabel are 2-byte session counters
		// (libandromeda's transport.@0x730 — we use 1 for forward, 2 for reverse)
		const keys = deriveCallKeys({
			mpkey: this.#route.peerPub,
			local: this.#local,
			sessionId: this.#sessId,
			sendLabel: 1,
			recvLabel: 2,
		});
		this.#sendKeys = keys.send;
		this.#recvKeys = keys.recv;

		// loc_nonce is a random u64 we choose
		const buf = new Uint8Array(8);
		crypto.getRandomValues(buf);
		// Library convention: high byte 0x6a (matches LINE's observed values)
		buf[7] = 0x6a;
		this.#locNonce = new DataView(buf.buffer).getBigUint64(0, false);

		const dgram = await import("node:dgram");
		const isIPv6 = !!this.#route.cscfHost6;
		const sock = dgram.createSocket(isIPv6 ? "udp6" : "udp4");
		this.#sock = sock;
		await new Promise<void>((res) =>
			sock.bind(
				{ address: isIPv6 ? "::" : "0.0.0.0", port: 0 },
				() => res(),
			)
		);
		sock.on("message", (buf) => this.#onWire(new Uint8Array(buf)));
	}

	#onWire(wire: Uint8Array) {
		try {
			if (wire.length < HEADER_LEN + 16) return;
			const { fixed } = parseFrameHeader(wire);
			const body = wire.subarray(HEADER_LEN);
			const pt = this.#decrypt(body, fixed.sequence);
			if (!pt) return;

			// Parse outer planet_msg to find hdr → extract loc_nonce on first reply
			if (!this.#nonceLearned) {
				try {
					const outer = decodeFields(pt);
					const hdrField = outer.find((f) =>
						f.tag === 1 && f.wireType === WireType.LengthDelim
					);
					if (hdrField) {
						const hdrBytes = new Uint8Array(hdrField.value as Uint8Array);
						this.#rmtNonce = extractRmtNonceFromReply(hdrBytes);
						this.#nonceLearned = true;
					}
				} catch (_e) { /* keep trying on next msg */ }
			}

			const w = this.#pending.shift();
			if (w) w(pt);
		} catch (_e) {
			// Probably SRTP media or malformed — ignore
		}
	}

	#decrypt(body: Uint8Array, sequence: number): Uint8Array | null {
		if (!this.#recvKeys || body.length < 16) return null;
		const tag = body.subarray(body.length - 16);
		const ct = body.subarray(0, body.length - 16);
		const expected = hmacTag(this.#recvKeys.macKey, ct);
		if (!tagEquals(tag, expected)) return null;
		const iv = buildCtrIv(this.#recvKeys.ivNonce, sequence);
		return aesCtrDecrypt(this.#recvKeys.encKey, iv, ct);
	}

	#encrypt(plaintext: Uint8Array, sequence: number): Uint8Array {
		if (!this.#sendKeys) throw new Error("not connected");
		const iv = buildCtrIv(this.#sendKeys.ivNonce, sequence);
		const ct = aesCtrEncrypt(this.#sendKeys.encKey, iv, plaintext);
		const tag = hmacTag(this.#sendKeys.macKey, ct);
		const out = new Uint8Array(ct.length + tag.length);
		out.set(ct, 0);
		out.set(tag, ct.length);
		return out;
	}

	#planetHdr(): PlanetMsgHdr {
		if (!this.#sessId) throw new Error("connect first");
		const tranId = new Uint8Array(16);
		crypto.getRandomValues(tranId);
		return {
			userId: this.#opts.localMid,
			msgId: this.#msgIdCounter++,
			sessId: this.#sessId,
			tranId,
			tranSeq: this.#tranSeq++,
			locNonce: this.#locNonce,
			rmtNonce: this.#rmtNonce,
		};
	}

	async #sendEnvelope(body: { kind: "sc" | "cc" | "mc"; data: Uint8Array }): Promise<void> {
		if (!this.#sock || !this.#route) throw new Error("not connected");
		const planetMsg = packPlanetMsg(this.#planetHdr(), body);
		const seq = this.#nextSeq++;
		const enc = this.#encrypt(planetMsg, seq);
		const totalLen = HEADER_LEN + enc.length;
		const chunkLogical = (((totalLen - 4) << 5) | 0xd) & 0xffff;
		const fixed: PlanetFixedHdr = {
			type: 0,
			flagA: false,
			length: enc.length & 0x7ff,
			flagB: false,
			sequence: seq & 0x7fff,
		};
		const hdr = buildFrameHeader(chunkLogical, fixed);
		const datagram = new Uint8Array(hdr.length + enc.length);
		datagram.set(hdr, 0);
		datagram.set(enc, hdr.length);
		const host = this.#route.cscfHost6 || this.#route.cscfHost;
		await new Promise<void>((res, rj) =>
			this.#sock!.send(
				Buffer.from(datagram),
				this.#route!.cscfPort,
				host,
				(e) => (e ? rj(e) : res()),
			)
		);
	}

	#waitForReply(timeoutMs: number): Promise<Uint8Array> {
		return new Promise((res, rj) => {
			const t = setTimeout(
				() => rj(new Error("PLANET reply timeout")),
				timeoutMs,
			);
			this.#pending.push((env) => {
				clearTimeout(t);
				if (env instanceof Error) rj(env);
				else res(env);
			});
		});
	}

	async invite(opts: { to: string }): Promise<Uint8Array> {
		if (!this.#route || !this.#local) throw new Error("connect first");
		const ourPubB64 = btoa(String.fromCharCode(...this.#local.publicKey));
		const setup: CcSetupReq = {
			initiator: this.#opts.localMid,
			responder: opts.to,
			iZone: this.#route.iZone,
			rZone: this.#route.rZone,
			devId: this.#opts.deviceInfo ?? "linejs",
			offer: new TextEncoder().encode("AUDIO"),
			credential: new TextEncoder().encode(this.#route.fromToken),
			fakeCall: false,
			svcKey: ourPubB64,
			stid: this.#route.stid,
		};
		const setupBytes = packCcSetupReq(setup);
		const ccBody = wrapCcMsg(CC_MSG.SETUP_REQ, setupBytes);
		const cid = this.#callUuid!;
		const ccMsg = packPlanetCcMsg(
			{ cid, srcChanId: 1n, dstChanId: 0n },
			ccBody,
		);
		await this.#sendEnvelope({ kind: "cc", data: ccMsg });
		const reply = await this.#waitForReply(this.#opts.timeoutMs ?? 10000);
		return reply;
	}

	async close(): Promise<void> {
		try {
			if (this.#route && this.#sock) {
				const relBody = packCcSetupReq({
					initiator: this.#opts.localMid,
					responder: this.#route.toMid,
				});
				const ccBody = wrapCcMsg(CC_MSG.REL_REQ, relBody);
				const ccMsg = packPlanetCcMsg(
					{ cid: this.#callUuid ?? "rel", srcChanId: 1n, dstChanId: 0n },
					ccBody,
				);
				await this.#sendEnvelope({ kind: "cc", data: ccMsg });
			}
		} catch { /* */ }
		await new Promise<void>((res) => this.#sock?.close(() => res()));
	}

	send(_packet: Uint8Array): void | Promise<void> {
		throw new Error("PlanetTransport.send: signaling only");
	}

	async *receive(): AsyncIterable<Uint8Array> {
		return;
	}
}
