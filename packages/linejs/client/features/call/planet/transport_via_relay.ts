/**
 * PLANET transport variant that routes traffic through a UDP relay
 * (e.g., a Frida script running inside LINE on a rooted phone), so that
 * packets to cscf arrive with the phone's source IP — bypassing the
 * source-IP binding cscf enforces for new sessions.
 *
 * Wire framing on the PC↔relay link:
 *   PC →  relay: [4-byte BE cscf ip][2-byte BE cscf port][payload]
 *   relay → PC: [4-byte BE cscf ip][2-byte BE cscf port][payload]
 *
 * The PlanetTransport on PC just connects to the relay's (host, port) and
 * embeds the real cscf target inside each datagram.
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

export interface RelayOpts {
	relayHost: string;     // e.g., the phone's LAN IP "192.168.1.21"
	relayPort: number;     // e.g., 19999
	localMid: string;
	timeoutMs?: number;
}

interface CallRouteParsed {
	cscfHost: string;
	cscfPort: number;
	peerPub: Uint8Array;
	toMid: string;
	fromToken: string;
	iZone?: string;
	rZone?: string;
	stid?: string;
}

function parseRoute(r: LINETypes.CallRoute): CallRouteParsed {
	const commParam = JSON.parse(r.commParam || "{}");
	if (!commParam.mpkey) throw new Error("CallRoute.commParam.mpkey missing");
	return {
		cscfHost: r.voipAddress.split(",")[0],
		cscfPort: r.voipUdpPort,
		peerPub: decodeMpKey(commParam.mpkey),
		toMid: r.toMid,
		fromToken: r.fromToken,
		iZone: r.fromZone,
		rZone: r.toZone,
		stid: r.stid,
	};
}

const HDR_LEN = 6;

export class PlanetTransportViaRelay implements CallTransport {
	#opts: RelayOpts;
	#sock?: DgramSocket;
	#route?: CallRouteParsed;
	#local?: EphemeralKeypair;
	#sendKeys?: TransportKeys;
	#recvKeys?: TransportKeys;
	#sessId?: Uint8Array;
	#callUuid?: string;
	#callUuid16?: Uint8Array;
	#nextSeq = 0x01d0;
	#tranSeq = 1;
	#msgIdCounter = 1;
	#locNonce = 0n;
	#rmtNonce = 0n;
	#nonceLearned = false;
	#pending: Array<(env: Uint8Array | Error) => void> = [];

	constructor(opts: RelayOpts) { this.#opts = opts; }

	async connect(opts: { route: LINETypes.CallRoute }): Promise<void> {
		this.#route = parseRoute(opts.route);
		this.#local = generateEphemeralKeypair();
		this.#sessId = newSessionId();
		this.#callUuid16 = crypto.getRandomValues(new Uint8Array(16));
		this.#callUuid = crypto.randomUUID();

		const keys = deriveCallKeys({
			mpkey: this.#route.peerPub,
			local: this.#local,
			sessionId: this.#sessId,
			sendLabel: 1,
			recvLabel: 2,
		});
		this.#sendKeys = keys.send;
		this.#recvKeys = keys.recv;

		const buf = new Uint8Array(8);
		crypto.getRandomValues(buf);
		buf[7] = 0x6a;
		this.#locNonce = new DataView(buf.buffer).getBigUint64(0, false);

		const dgram = await import("node:dgram");
		const sock = dgram.createSocket("udp4");
		this.#sock = sock;
		await new Promise<void>((res) =>
			sock.bind({ address: "0.0.0.0", port: 0 }, () => res())
		);
		sock.on("message", (buf, _rinfo) => this.#onRelayPacket(new Uint8Array(buf)));
	}

	#onRelayPacket(wire: Uint8Array) {
		// wire = [4 ip][2 port][payload]
		if (wire.length < HDR_LEN + 16 + 6) return;
		const innerPayload = wire.subarray(6);
		try {
			const { fixed } = parseFrameHeader(innerPayload);
			const body = innerPayload.subarray(HDR_LEN);
			const pt = this.#decrypt(body, fixed.sequence);
			if (!pt) return;
			if (!this.#nonceLearned) {
				try {
					const outer = decodeFields(pt);
					const hdr = outer.find((f) => f.tag === 1 && f.wireType === WireType.LengthDelim);
					if (hdr) {
						this.#rmtNonce = extractRmtNonceFromReply(new Uint8Array(hdr.value as Uint8Array));
						this.#nonceLearned = true;
					}
				} catch { /* */ }
			}
			const w = this.#pending.shift();
			if (w) w(pt);
		} catch { /* drop */ }
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
		const iv = buildCtrIv(this.#sendKeys!.ivNonce, sequence);
		const ct = aesCtrEncrypt(this.#sendKeys!.encKey, iv, plaintext);
		const tag = hmacTag(this.#sendKeys!.macKey, ct);
		const out = new Uint8Array(ct.length + tag.length);
		out.set(ct, 0); out.set(tag, ct.length);
		return out;
	}

	#planetHdr(): PlanetMsgHdr {
		const tranId = new Uint8Array(16);
		crypto.getRandomValues(tranId);
		return {
			userId: this.#opts.localMid,
			msgId: this.#msgIdCounter++,
			sessId: this.#sessId!,
			tranId,
			tranSeq: this.#tranSeq++,
			locNonce: this.#locNonce,
			rmtNonce: this.#rmtNonce,
		};
	}

	async #send(body: { kind: "sc" | "cc" | "mc"; data: Uint8Array }): Promise<void> {
		const planetMsg = packPlanetMsg(this.#planetHdr(), body);
		const seq = this.#nextSeq++;
		const enc = this.#encrypt(planetMsg, seq);
		const totalLen = HDR_LEN + enc.length;
		const chunkLogical = (((totalLen - 4) << 5) | 0xd) & 0xffff;
		const fixed: PlanetFixedHdr = {
			type: 0, flagA: false, length: enc.length & 0x7ff, flagB: false,
			sequence: seq & 0x7fff,
		};
		const hdr = buildFrameHeader(chunkLogical, fixed);

		// Wrap in relay framing: [4 cscf_ip][2 cscf_port][payload]
		const ipParts = this.#route!.cscfHost.split(".").map(Number);
		const wrapped = new Uint8Array(6 + hdr.length + enc.length);
		wrapped[0] = ipParts[0]; wrapped[1] = ipParts[1];
		wrapped[2] = ipParts[2]; wrapped[3] = ipParts[3];
		wrapped[4] = (this.#route!.cscfPort >>> 8) & 0xff;
		wrapped[5] = this.#route!.cscfPort & 0xff;
		wrapped.set(hdr, 6);
		wrapped.set(enc, 6 + hdr.length);

		await new Promise<void>((res, rj) =>
			this.#sock!.send(
				Buffer.from(wrapped),
				this.#opts.relayPort,
				this.#opts.relayHost,
				(e) => e ? rj(e) : res(),
			)
		);
	}

	async invite(opts: { to: string }): Promise<Uint8Array> {
		const ourPubB64 = btoa(String.fromCharCode(...this.#local!.publicKey));
		const setup: CcSetupReq = {
			initiator: this.#opts.localMid,
			responder: opts.to,
			iZone: this.#route!.iZone,
			rZone: this.#route!.rZone,
			devId: "ANDROID",
			offer: new TextEncoder().encode("AUDIO"),
			credential: new TextEncoder().encode(this.#route!.fromToken),
			fakeCall: false,
			svcKey: ourPubB64,
			stid: this.#route!.stid,
		};
		const setupBytes = packCcSetupReq(setup);
		const ccBody = wrapCcMsg(CC_MSG.SETUP_REQ, setupBytes);
		const ccMsg = packPlanetCcMsg(
			{ cid: this.#callUuid!, srcChanId: 1n, dstChanId: 0n },
			ccBody,
		);
		await this.#send({ kind: "cc", data: ccMsg });
		return await new Promise<Uint8Array>((res, rj) => {
			const t = setTimeout(() => rj(new Error("relay timeout")),
				this.#opts.timeoutMs ?? 10000);
			this.#pending.push((env) => {
				clearTimeout(t);
				if (env instanceof Error) rj(env); else res(env);
			});
		});
	}

	async close(): Promise<void> {
		await new Promise<void>((res) => this.#sock?.close(() => res()));
	}

	send(): void { throw new Error("relay: signaling only"); }
	async *receive(): AsyncIterable<Uint8Array> { return; }
}
