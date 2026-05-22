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
	makeChunkHdr,
	parseFrameHeader,
	type PlanetFixedHdr,
} from "./framing.ts";
import {
	aesCtrDecrypt,
	aesCtrEncrypt,
	buildDirectionLabel,
	buildPlanetCtrIv,
	decodeMpKey,
	deriveCallKeys,
	type EphemeralKeypair,
	generateEphemeralKeypair,
	hmacTag,
	newSessionId,
	sha256,
	tagEquals,
	type TransportKeys,
} from "./crypto.ts";
import {
	CC_MSG,
	type CcSetupReq,
	decodeCcSetupRsp,
	decodeFields,
	decodePlanetMsg,
	extractRmtNonceFromReply,
	packCcRelReq,
	packCcSetupReq,
	packNativeSetupOffer,
	packPlanetCcMsg,
	packPlanetFeatureRegister,
	packPlanetMsg,
	packPlanetUserAgent,
	type PlanetMsgHdr,
	type PlanetSetupOfferMaterial,
	type PlanetUserAgent,
	WireType,
	wrapCcMsg,
} from "./schema.ts";

export interface PlanetTransportOpts {
	localMid: string;
	deviceInfo?: string;
	userAgent?: PlanetUserAgent;
	deviceId?: string;
	setupOffer?: Uint8Array;
	credential?: Uint8Array;
	serviceKey?: string;
	capabilities?: number[];
	features?: Uint8Array[];
	timeoutMs?: number;
	preferIpv6?: boolean;
	wireSend?: (
		packet: Uint8Array,
		endpoint: {
			host: string;
			port: number;
			bootstrap: boolean;
			seq: number;
			plainLen: number;
			bodyLen: number;
			plaintext: Uint8Array;
		},
	) => Promise<Uint8Array | void> | Uint8Array | void;
}

export interface PlanetInviteResult {
	plaintext: Uint8Array;
	message: ReturnType<typeof decodePlanetMsg>;
	setupRsp?: ReturnType<typeof decodeCcSetupRsp>;
}

export interface PlanetLocalMediaOffer {
	keypair: EphemeralKeypair;
	material: PlanetSetupOfferMaterial;
	offer: Uint8Array;
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

function readObservedSequence(wire: Uint8Array): number {
	if (wire.length < HEADER_LEN) throw new Error("PLANET wire too short");
	return ((wire[2] << 8) | wire[3]) & 0xffff;
}

function concatBytes(parts: Uint8Array[]): Uint8Array {
	const len = parts.reduce((n, p) => n + p.length, 0);
	const out = new Uint8Array(len);
	let off = 0;
	for (const p of parts) {
		out.set(p, off);
		off += p.length;
	}
	return out;
}

function buildObservedFrameHeader(
	chunkLogical: number,
	sequence: number,
	tail16: number,
): Uint8Array {
	const chunk = makeChunkHdr(chunkLogical);
	return new Uint8Array([
		chunk & 0xff,
		(chunk >>> 8) & 0xff,
		(sequence >>> 8) & 0xff,
		sequence & 0xff,
		(tail16 >>> 8) & 0xff,
		tail16 & 0xff,
	]);
}

function buildBootstrapSecHeader(plaintextLen: number): Uint8Array {
	// Native first SETUP packet inserts this 5-byte cleartext record
	// between the bootstrap prefix and AES output. Captures with 873/874 byte
	// plaintexts produced 00 00 00 2b 69/6a respectively.
	return new Uint8Array([
		0,
		0,
		0,
		0x28 | ((plaintextLen >>> 8) & 0x07),
		plaintextLen & 0xff,
	]);
}

function randomBase64(byteLength: number): string {
	const bytes = crypto.getRandomValues(new Uint8Array(byteLength));
	return btoa(String.fromCharCode(...bytes));
}

function defaultAndroidUserAgent(deviceInfo?: string): PlanetUserAgent {
	return {
		osName: "Android",
		osVersion: "36",
		deviceName: "Pixel 6a",
		appVersion: "12.1.13-63078245f",
		engineVersion: "8.2.0-694e2367",
		appReleaseInfo: deviceInfo ?? "ANDROID\t26.6.2\tAndroid OS\t16",
		manufacturer: "google",
	};
}

function defaultSetupFeatures(): Uint8Array[] {
	return [
		packPlanetFeatureRegister(16, true, 0),
		packPlanetFeatureRegister(17, false, 0),
		packPlanetFeatureRegister(0, false, 0),
	];
}

function randomU32(): number {
	return crypto.getRandomValues(new Uint32Array(1))[0];
}

function randomIntInclusive(min: number, max: number): number {
	return min + (randomU32() % (max - min + 1));
}

function randomBitLength(minBits: number, maxBits: number): number {
	const bits = randomIntInclusive(minBits, maxBits);
	const base = 1 << (bits - 1);
	return (base | (randomU32() & (base - 1))) >>> 0;
}

function randomVarint2(): number {
	return (0x2000 | (randomU32() & 0x1fff)) >>> 0;
}

function randomNativeTranSeq(): number {
	return randomBitLength(26, 30);
}

function randomNativeLargeId(): number {
	return randomBitLength(29, 30);
}

function randomInitialFrameSeq(): number {
	return randomIntInclusive(1, 1023);
}

function copyBytes(bytes: Uint8Array): Uint8Array {
	return new Uint8Array(bytes);
}

function cloneMediaOfferMaterial(
	material: PlanetSetupOfferMaterial,
): PlanetSetupOfferMaterial {
	return {
		mediaPubKey: copyBytes(material.mediaPubKey),
		mediaKeyId: material.mediaKeyId,
		mediaNonce: copyBytes(material.mediaNonce),
		mediaSecret: copyBytes(material.mediaSecret),
	};
}

function defaultLocalMediaOffer(): PlanetLocalMediaOffer {
	const media = generateEphemeralKeypair();
	const material: PlanetSetupOfferMaterial = {
		mediaPubKey: media.publicKey,
		mediaKeyId: randomNativeLargeId(),
		mediaNonce: crypto.getRandomValues(new Uint8Array(16)),
		mediaSecret: crypto.getRandomValues(new Uint8Array(30)),
	};
	return {
		keypair: {
			publicKey: copyBytes(media.publicKey),
			privateKey: copyBytes(media.privateKey),
		},
		material: cloneMediaOfferMaterial(material),
		offer: packNativeSetupOffer(material),
	};
}

function defaultSetupCredential(
	route: CallRouteParsed,
	initiator: string,
	responder: string,
	cid: string,
): Uint8Array {
	return sha256(
		concatBytes([
			new TextEncoder().encode(initiator),
			new TextEncoder().encode("::"),
			new TextEncoder().encode(responder),
			new TextEncoder().encode("::"),
			new TextEncoder().encode(route.fromToken),
			new TextEncoder().encode("::"),
			new TextEncoder().encode(cid),
		]),
	);
}

export class PlanetTransport implements CallTransport {
	#opts: PlanetTransportOpts;
	#sock?: DgramSocket;
	#route?: CallRouteParsed;
	#local?: EphemeralKeypair;
	#sendKeys?: TransportKeys;
	#recvKeys?: TransportKeys;
	#sessId?: Uint8Array;
	#bootstrapSeed?: Uint8Array;
	#sendLabel = 0;
	#recvLabel = 0;
	#callUuid?: string;
	#callUuid16?: Uint8Array;
	#localMediaOffer?: PlanetLocalMediaOffer;
	#srcChanId = 1n;
	#setupSent = false;

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

	get localMediaOffer(): PlanetLocalMediaOffer | undefined {
		const local = this.#localMediaOffer;
		if (!local) return undefined;
		return {
			keypair: {
				publicKey: copyBytes(local.keypair.publicKey),
				privateKey: copyBytes(local.keypair.privateKey),
			},
			material: cloneMediaOfferMaterial(local.material),
			offer: copyBytes(local.offer),
		};
	}

	async connect(opts: { route: LINETypes.CallRoute }): Promise<void> {
		this.#route = parseRoute(opts.route);
		this.#local = generateEphemeralKeypair();
		this.#sessId = new Uint8Array(0);
		this.#bootstrapSeed = newSessionId();
		this.#sendLabel = crypto.getRandomValues(new Uint16Array(1))[0];
		this.#recvLabel = crypto.getRandomValues(new Uint16Array(1))[0];
		this.#callUuid16 = crypto.getRandomValues(new Uint8Array(16));
		this.#callUuid = crypto.randomUUID();
		this.#msgIdCounter = randomVarint2();
		this.#tranSeq = randomNativeTranSeq();
		this.#srcChanId = BigInt(randomNativeLargeId());
		this.#nextSeq = randomInitialFrameSeq();
		this.#setupSent = false;
		this.#localMediaOffer = undefined;

		// Native bootstrap uses a 16-byte seed and two random 2-byte labels.
		const keys = deriveCallKeys({
			mpkey: this.#route.peerPub,
			local: this.#local,
			bootstrapSeed: this.#bootstrapSeed,
			sendLabel: this.#sendLabel,
			recvLabel: this.#recvLabel,
		});
		this.#sendKeys = keys.send;
		this.#recvKeys = keys.recv;

		this.#locNonce = BigInt(randomNativeLargeId());

		if (!this.#opts.wireSend) {
			const dgram = await import("node:dgram");
			const isIPv6 = !!this.#opts.preferIpv6 && !!this.#route.cscfHost6;
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
	}

	#onWire(wire: Uint8Array) {
		try {
			if (wire.length < HEADER_LEN + 16) return;
			parseFrameHeader(wire);
			const pt = this.#decryptWire(wire);
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
			try {
				const msg = decodePlanetMsg(pt);
				if (msg.hdr?.sessId?.length) this.#sessId = msg.hdr.sessId;
				if (msg.hdr?.locNonce !== undefined && !this.#nonceLearned) {
					this.#rmtNonce = msg.hdr.locNonce;
					this.#nonceLearned = true;
				}
			} catch {
				// Keep the raw reply flowing even if a newer message type is unknown.
			}

			const w = this.#pending.shift();
			if (w) w(pt);
		} catch (_e) {
			// Probably SRTP media or malformed — ignore
		}
	}

	#decryptWire(wire: Uint8Array): Uint8Array | null {
		if (!this.#recvKeys || wire.length < HEADER_LEN + 16) return null;
		const seq = readObservedSequence(wire);
		const tag = wire.subarray(wire.length - 16);
		const macInput = wire.subarray(0, wire.length - 16);
		const ct = wire.subarray(HEADER_LEN, wire.length - 16);
		const expected = hmacTag(this.#recvKeys.macKey, macInput);
		if (!tagEquals(tag, expected)) return null;
		return aesCtrDecrypt(
			this.#recvKeys.encKey,
			buildPlanetCtrIv(this.#recvKeys.ctrBase, seq),
			ct,
		);
	}

	#encrypt(plaintext: Uint8Array, seq: number): Uint8Array {
		if (!this.#sendKeys) throw new Error("not connected");
		return aesCtrEncrypt(
			this.#sendKeys.encKey,
			buildPlanetCtrIv(this.#sendKeys.ctrBase, seq),
			plaintext,
		);
	}

	#bootstrapPrefix(): Uint8Array {
		if (!this.#local || !this.#bootstrapSeed) throw new Error("connect first");
		const label = buildDirectionLabel(this.#sendLabel);
		const out = new Uint8Array(
			label.length + this.#bootstrapSeed.length + this.#local.publicKey.length,
		);
		out.set(label, 0);
		out.set(this.#bootstrapSeed, label.length);
		out.set(this.#local.publicKey, label.length + this.#bootstrapSeed.length);
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

	async #sendEnvelope(
		body: { kind: "sc" | "cc" | "mc"; data: Uint8Array },
		opts: { bootstrap?: boolean } = {},
	): Promise<void> {
		if ((!this.#sock && !this.#opts.wireSend) || !this.#route) {
			throw new Error("not connected");
		}
		const planetMsg = packPlanetMsg(this.#planetHdr(), body);
		const seq = this.#nextSeq++;
		const prefix = opts.bootstrap ? this.#bootstrapPrefix() : new Uint8Array(0);
		const sec = opts.bootstrap
			? buildBootstrapSecHeader(planetMsg.length)
			: new Uint8Array(0);
		const ct = this.#encrypt(planetMsg, seq & 0xffff);
		const tagLen = 16;
		const bodyLen = prefix.length + sec.length + ct.length + tagLen;
		const totalLen = HEADER_LEN + bodyLen;
		const chunkLogical = (((totalLen - 4) << 5) |
			(opts.bootstrap ? 0x1d : 0x0d)) & 0xffff;
		const hdr = opts.bootstrap
			? buildObservedFrameHeader(chunkLogical, seq & 0xffff, 0x0602)
			: buildFrameHeader(
				chunkLogical,
				{
					type: 0,
					flagA: false,
					length: bodyLen & 0x7ff,
					flagB: false,
					sequence: seq & 0x7fff,
				} satisfies PlanetFixedHdr,
			);
		const macInput = concatBytes([hdr, prefix, sec, ct]);
		const tag = hmacTag(this.#sendKeys!.macKey, macInput);
		const datagram = concatBytes([macInput, tag]);
		const host = this.#opts.preferIpv6 && this.#route.cscfHost6
			? this.#route.cscfHost6
			: this.#route.cscfHost;
		if (this.#opts.wireSend) {
			const reply = await this.#opts.wireSend(datagram, {
				host,
				port: this.#route.cscfPort,
				bootstrap: !!opts.bootstrap,
				seq,
				plainLen: planetMsg.length,
				bodyLen,
				plaintext: planetMsg,
			});
			if (reply?.length) this.#onWire(reply);
			return;
		}
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

	async #sendSetup(opts: { to: string }): Promise<void> {
		if (!this.#route || !this.#local) throw new Error("connect first");
		const cid = this.#callUuid!;
		const localMediaOffer = this.#opts.setupOffer
			? undefined
			: defaultLocalMediaOffer();
		if (localMediaOffer) this.#localMediaOffer = localMediaOffer;
		const setup: CcSetupReq = {
			initiator: this.#opts.localMid,
			responder: opts.to,
			iZone: this.#route.iZone,
			rZone: this.#route.rZone,
			ua: packPlanetUserAgent(
				this.#opts.userAgent ?? defaultAndroidUserAgent(this.#opts.deviceInfo),
			),
			devId: this.#opts.deviceId ?? randomBase64(32),
			commTypeFlags: 1,
			capas: this.#opts.capabilities ?? [1, 2, 3, 6, 7],
			// Native LINE sends a 311-byte structured media/security offer here.
			offer: this.#opts.setupOffer ?? localMediaOffer!.offer,
			// Native credential is SHA-256(initiator::responder::fromToken::cid).
			credential: this.#opts.credential ??
				defaultSetupCredential(
					this.#route,
					this.#opts.localMid,
					opts.to,
					cid,
				),
			fakeCall: false,
			svcKey: this.#opts.serviceKey ?? "freecall.audio",
			netType: 1,
			stid: this.#route.stid,
			features: this.#opts.features ?? defaultSetupFeatures(),
			reqRec: false,
			pathCheck: false,
		};
		const setupBytes = packCcSetupReq(setup);
		const ccBody = wrapCcMsg(CC_MSG.SETUP_REQ, setupBytes);
		const ccMsg = packPlanetCcMsg(
			{ cid, srcChanId: this.#srcChanId, dstChanId: 0n },
			ccBody,
		);
		await this.#sendEnvelope({ kind: "cc", data: ccMsg }, { bootstrap: true });
		this.#setupSent = true;
	}

	async inviteDetailed(opts: { to: string }): Promise<PlanetInviteResult> {
		await this.#sendSetup(opts);
		const reply = await this.#waitForReply(this.#opts.timeoutMs ?? 10000);
		const message = decodePlanetMsg(reply);
		const setupBytes = message.cc?.bodyTag === CC_MSG.SETUP_RSP
			? message.cc.bodyBytes
			: undefined;
		return {
			plaintext: reply,
			message,
			setupRsp: setupBytes ? decodeCcSetupRsp(setupBytes) : undefined,
		};
	}

	async invite(opts: { to: string }): Promise<Uint8Array> {
		return (await this.inviteDetailed(opts)).plaintext;
	}

	async close(): Promise<void> {
		try {
			if (
				this.#setupSent && this.#route && (this.#sock || this.#opts.wireSend)
			) {
				const relBody = packCcRelReq({
					relCode: 2,
					releaser: "initiator",
					commMediaFlags: 1,
				});
				const ccBody = wrapCcMsg(CC_MSG.REL_REQ, relBody);
				const ccMsg = packPlanetCcMsg(
					{
						cid: this.#callUuid ?? "rel",
						srcChanId: this.#srcChanId,
						dstChanId: 0n,
					},
					ccBody,
				);
				await this.#sendEnvelope({ kind: "cc", data: ccMsg });
			}
		} catch { /* */ }
		if (this.#sock) {
			await new Promise<void>((res) => this.#sock!.close(() => res()));
			this.#sock = undefined;
		}
	}

	send(_packet: Uint8Array): void | Promise<void> {
		throw new Error("PlanetTransport.send: signaling only");
	}

	async *receive(): AsyncIterable<Uint8Array> {
		return;
	}
}
