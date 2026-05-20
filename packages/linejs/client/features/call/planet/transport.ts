/**
 * PLANET transport — UDP/IPv6 + framing + ECDH + HKDF chain + AES-CTR + Cassini.
 *
 * End-to-end flow:
 *
 *   On connect():
 *     - parse CallRoute.commParam.mpkey (peer's ephemeral P-256 SEC1 pubkey)
 *     - generate local ephemeral P-256 keypair
 *     - ECDH(local_priv, peer_pub) → 32B shared secret
 *     - stage1 = HKDF-SHA512(salt=secret, ikm=our_pub, info=peer_pub, len=64)
 *     - stage2_send/recv = HKDF-SHA256(stage1[:32], session_id, direction_tag, len=128)
 *     - carve send/recv {encKey, macKey, ivNonce} from stage2 outputs
 *
 *   On send(msg):
 *     - serialize Cassini envelope to protobuf bytes (pln_msg_pack-compatible)
 *     - AES-256-CTR encrypt with ivNonce + per-packet counter
 *     - HMAC-SHA256 tag (truncated to 16 bytes)
 *     - wrap with chunk_hdr (16-bit packed) + fixed_hdr (4-byte type/len/seq)
 *     - UDP send to cscf IPv6
 *
 *   On receive:
 *     - parse frame header → recover sequence
 *     - verify HMAC tag against recv.macKey
 *     - AES-CTR decrypt with recv.encKey + sequence-derived IV
 *     - unpack Cassini envelope
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
	buildExchangeAppStrData,
	buildRelReq,
	buildSetupReq,
	type CassiniEnvelope,
	type CassiniSession,
	unpackCassini,
} from "./cassini.ts";

export interface PlanetTransportOpts {
	localMid: string;
	deviceInfo?: string;
	timeoutMs?: number;
}

interface CallRouteParsed {
	cscfHost: string;
	cscfPort: number;
	cscfHost6?: string;
	peerPub: Uint8Array; // 33B SEC1 compressed
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
		peerPub: decodeMpKey(mpkeyB64),
		toMid: r.toMid,
		fromToken: r.fromToken,
	};
}

/** Random 4-byte direction label (matches the observed 0x329aba33-style
 *  values used in the second-stage HKDF info field). */
function randomLabel(): number {
	return Math.floor(Math.random() * 0xffffffff) >>> 0;
}

export class PlanetTransport implements CallTransport {
	#opts: PlanetTransportOpts;
	#sock?: DgramSocket;
	#route?: CallRouteParsed;
	#localKeypair?: EphemeralKeypair;
	#sendKeys?: TransportKeys;
	#recvKeys?: TransportKeys;
	#sessionId?: Uint8Array;
	#callUuid?: string;
	#nextMsgId = 0x100;
	#nextSeq = 0x01d0;
	#pending: ((env: CassiniEnvelope) => void)[] = [];
	#hdrUuid?: Uint8Array;

	constructor(opts: PlanetTransportOpts) {
		this.#opts = opts;
	}

	async connect(opts: { route: LINETypes.CallRoute }): Promise<void> {
		this.#route = parseRoute(opts.route);
		this.#localKeypair = generateEphemeralKeypair();
		this.#sessionId = newSessionId();
		this.#hdrUuid = new Uint8Array(16);
		crypto.getRandomValues(this.#hdrUuid);
		this.#callUuid = crypto.randomUUID();
		const sendLabel = randomLabel();
		const recvLabel = randomLabel();
		const keys = deriveCallKeys({
			mpkey: this.#route.peerPub,
			local: this.#localKeypair,
			sessionId: this.#sessionId,
			sendLabel,
			recvLabel,
		});
		this.#sendKeys = keys.send;
		this.#recvKeys = keys.recv;

		const dgram = await import("node:dgram");
		const sock = dgram.createSocket(this.#route.cscfHost6 ? "udp6" : "udp4");
		this.#sock = sock;
		await new Promise<void>((res) =>
			sock.bind({ address: this.#route!.cscfHost6 ? "::" : "0.0.0.0", port: 0 }, () => res())
		);
		sock.on("message", (buf) => this.#onWire(new Uint8Array(buf)));
	}

	#onWire(wire: Uint8Array) {
		try {
			if (wire.length < 6 + 16) return;
			const { fixed } = parseFrameHeader(wire);
			const body = wire.subarray(6);
			const env = this.#decrypt(body, fixed.sequence);
			if (env) {
				const w = this.#pending.shift();
				if (w) w(env);
			}
		} catch (_e) {
			// Not a PLANET frame (likely SRTP media), ignore
		}
	}

	#decrypt(body: Uint8Array, sequence: number): CassiniEnvelope | null {
		if (!this.#recvKeys) return null;
		if (body.length < 16) return null;
		const tag = body.subarray(body.length - 16);
		const ct = body.subarray(0, body.length - 16);
		const expected = hmacTag(this.#recvKeys.macKey, ct);
		if (!tagEquals(tag, expected)) return null;
		const iv = buildCtrIv(this.#recvKeys.ivNonce, sequence);
		const pt = aesCtrDecrypt(this.#recvKeys.encKey, iv, ct);
		try {
			return unpackCassini(pt);
		} catch (_e) {
			return null;
		}
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

	async #sendCassini(envBytes: Uint8Array): Promise<void> {
		if (!this.#sock || !this.#route) throw new Error("not connected");
		const seq = this.#nextSeq++;
		const enc = this.#encrypt(envBytes, seq);
		const fixed: PlanetFixedHdr = {
			type: 0,
			flagA: false,
			length: enc.length & 0x7ff,
			flagB: false,
			sequence: seq & 0x7fff,
		};
		// chunkLogical encodes the total datagram length via the formula
		// `((datagramLen - 4) << 5) | 0xd`, derived by inverse-fitting the
		// observed wire pattern. The low nibble (0xd) is the PLANET
		// message-class marker. Bit 4 set on the input flips to bit 11 of
		// the wire byte; the captured 952B STATE-class packet had it set,
		// others didn't — currently unflagged.
		const HEADER_LEN = 6; // chunk_hdr (2) + fixed_hdr (4)
		const totalLen = HEADER_LEN + enc.length;
		const chunkLogical = (((totalLen - 4) << 5) | 0xd) & 0xffff;
		const hdr = buildFrameHeader(chunkLogical, fixed);
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

	#waitForReply(timeoutMs: number): Promise<CassiniEnvelope> {
		return new Promise((res, rj) => {
			const t = setTimeout(
				() => rj(new Error("PLANET reply timeout")),
				timeoutMs,
			);
			this.#pending.push((env) => {
				clearTimeout(t);
				res(env);
			});
		});
	}

	#session(): CassiniSession {
		if (!this.#hdrUuid || !this.#callUuid) throw new Error("connect first");
		return {
			fromMid: this.#opts.localMid,
			callUuid16: this.#hdrUuid,
			callUuidString: this.#callUuid,
			// TODO: these per-call values currently start from defaults; the
			// real cscf will reject them. Establishing the actual values
			// requires reversing the bootstrap-handshake (msg_pack #1 in the
			// captures) which carries `09 80 ee 7a 46 dc 56 b1 18 10 00`
			// — that 13-byte field 2 of outer envelope appears to be the
			// negotiated session-id encoded as a fixed64 + counter.
			subscriptionId: this.#subscriptionId ?? 0n,
			sessionId: this.#sessionIdBig ?? 0n,
		};
	}

	#subscriptionId?: bigint;
	#sessionIdBig?: bigint;
	#counter = 0n;

	async invite(opts: { to: string }): Promise<unknown> {
		if (!this.#sendKeys || !this.#localKeypair) {
			throw new Error("connect first");
		}
		// Defer to bootstrap: send a KA-class frame to negotiate the
		// subscription / session ids before sending a real SETUP. Without
		// that bootstrap step the cscf silently drops; logging the peer
		// here for telemetry.
		void opts.to;
		const setup = buildSetupReq({
			session: this.#session(),
			msgId: this.#nextMsgId++,
			counter: ++this.#counter,
			deviceInfo: this.#opts.deviceInfo ?? "linejs",
		});
		await this.#sendCassini(setup);
		const reply = await this.#waitForReply(this.#opts.timeoutMs ?? 10000);
		return reply;
	}

	async exchangeAppStrData(json: string): Promise<unknown> {
		const m = buildExchangeAppStrData({
			session: this.#session(),
			msgId: this.#nextMsgId++,
			counter: ++this.#counter,
			json,
		});
		await this.#sendCassini(m);
		return await this.#waitForReply(this.#opts.timeoutMs ?? 10000);
	}

	async close(): Promise<void> {
		try {
			if (this.#hdrUuid && this.#callUuid && this.#sock) {
				const rel = buildRelReq({
					session: this.#session(),
					msgId: this.#nextMsgId++,
					counter: ++this.#counter,
					reason: "user-ended",
				});
				await this.#sendCassini(rel);
			}
		} catch { /* */ }
		await new Promise<void>((res) => this.#sock?.close(() => res()));
	}

	send(_packet: Uint8Array): void | Promise<void> {
		// Media-plane send happens via AndromedaTransport/srtp; PlanetTransport
		// is for signaling only.
		throw new Error("PlanetTransport.send: media plane is handled separately");
	}

	async *receive(): AsyncIterable<Uint8Array> {
		// Same — receive is signaling-only here.
		return;
	}
}
