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
import { makeChunkHdr, parseFrameHeader } from "./framing.ts";
import {
	aesCtrDecrypt,
	aesCtrEncrypt,
	buildDirectionLabel,
	buildPlanetCtrIv,
	decodeMpKey,
	derivePlanetMediaKeyingVariants,
	derivePlanetMediaStreamKeying,
	ecdh,
	type EphemeralKeypair,
	generateEphemeralKeypair,
	hmacTag,
	newSessionId,
	planetHkdfStage1,
	planetHkdfStage2,
	type PlanetMediaKeyVariantName,
	sha256,
	tagEquals,
	type TransportKeys,
} from "./crypto.ts";
import {
	CC_MSG,
	type CcConnReq,
	type CcParticipateReq,
	type CcSetupReq,
	decodeCcConnReq,
	decodeCcInfoReq,
	decodeCcParticipateRsp,
	decodeCcRelReq,
	decodeCcSetupRsp,
	type DecodedField,
	decodeFields,
	decodeMcDataReq,
	decodeNativeSetupOffer,
	decodePlanetAddr,
	decodePlanetMsg,
	encodeVarint,
	extractRmtNonceFromReply,
	MC_MSG,
	type NativeSetupOffer,
	packBepiChannelOpen,
	packCcConnRsp,
	packCcInfoReq,
	packCcInfoRsp,
	packCcParticipateReq,
	packCcRelReq,
	packCcSetupReq,
	packKeepaliveReq,
	packMcChangeRsp,
	packMcCheckRpt,
	packMcDataReq,
	packMcDataRsp,
	packMcDataSessionPayload,
	packMcJoinRsp,
	packNativeGroupParticipateOffer,
	packNativeSetupOffer,
	packPlanetCcMsg,
	packPlanetFeatureRegister,
	packPlanetMcMsg,
	packPlanetMsg,
	packPlanetScMsgKaReq,
	packPlanetUeInfo,
	packPlanetUserAgent,
	packStrmSpec,
	type PlanetAddr,
	type PlanetMsgHdr,
	type PlanetSetupOfferMaterial,
	type PlanetUserAgent,
	WireType,
	wrapCcMsg,
	wrapMcMsg,
} from "./schema.ts";
import {
	buildRtp,
	deriveSrtpContext,
	parseRtp,
	type SrtpCryptoContext,
	srtpDecrypt,
	srtpEncrypt,
} from "../srtp.ts";

export interface PlanetTransportOpts {
	localMid: string;
	deviceInfo?: string;
	userAgent?: PlanetUserAgent;
	deviceId?: string;
	transportKeypair?: EphemeralKeypair;
	setupOffer?: Uint8Array;
	credential?: Uint8Array;
	serviceKey?: string;
	capabilities?: number[];
	features?: Uint8Array[];
	timeoutMs?: number;
	keepaliveIntervalMs?: number;
	mediaKeyMode?: PlanetMediaKeyMode;
	rtpTimestampStep?: number;
	preferIpv6?: boolean;
	groupDataSessionAfterProvisional?: boolean;
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
	debug?: (event: Record<string, unknown>) => void;
}

export type PlanetMediaKeyMode =
	| "current"
	| "reverse-stage"
	| "sender-material"
	| "sender-material-reverse-stage"
	| "audio-current"
	| "audio-reverse-stage"
	| "audio-sender-material"
	| "audio-sender-material-reverse-stage"
	| "secret-receiver"
	| "secret-sender"
	| "audio-secret-receiver"
	| "audio-secret-sender"
	| "auto";

type MediaKdfMode = Extract<
	PlanetMediaKeyMode,
	| "current"
	| "reverse-stage"
	| "sender-material"
	| "sender-material-reverse-stage"
>;

export interface PlanetInviteResult {
	plaintext: Uint8Array;
	message: ReturnType<typeof decodePlanetMsg>;
	setupRsp?: ReturnType<typeof decodeCcSetupRsp>;
}

export interface PlanetIncomingMessage {
	plaintext: Uint8Array;
	message?: ReturnType<typeof decodePlanetMsg>;
}

export interface PlanetAnswerResult {
	plaintext: Uint8Array;
	message: ReturnType<typeof decodePlanetMsg>;
	connReq: CcConnReq;
	peerAnswerOffer?: NativeSetupOffer;
	peerOffer?: NativeSetupOffer;
	connRspSent: boolean;
	mediaReady: boolean;
}

export interface PlanetGroupJoinResult {
	plaintext: Uint8Array;
	message: ReturnType<typeof decodePlanetMsg>;
	participateRsp?: ReturnType<typeof decodeCcParticipateRsp>;
	peerAnswerOffer?: NativeSetupOffer;
	mediaReady: boolean;
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
	groupToken?: string;
	orionIp?: string;
	mixIp?: string;
	mixPort?: number;
	mediaHost?: string;
	mediaPort?: number;
}

interface MediaKeySelection {
	mode: MediaKdfMode;
	send: PlanetMediaKeyVariantName;
	recv: PlanetMediaKeyVariantName;
}

interface MediaKeyCandidate {
	mode: Exclude<PlanetMediaKeyMode, "auto">;
	send: string;
	recv: string;
	sendContext: SrtpCryptoContext;
	recvContext: SrtpCryptoContext;
}

const MEDIA_KEY_SELECTIONS: Record<
	MediaKdfMode,
	MediaKeySelection
> = {
	current: {
		mode: "current",
		send: "local-peer/peer",
		recv: "peer-local/local",
	},
	"reverse-stage": {
		mode: "reverse-stage",
		send: "peer-local/local",
		recv: "local-peer/peer",
	},
	"sender-material": {
		mode: "sender-material",
		send: "local-peer/local",
		recv: "peer-local/peer",
	},
	"sender-material-reverse-stage": {
		mode: "sender-material-reverse-stage",
		send: "peer-local/peer",
		recv: "local-peer/local",
	},
};

function audioMediaKeyMode(mode: MediaKdfMode): Exclude<
	PlanetMediaKeyMode,
	"auto"
> {
	return `audio-${mode}` as Exclude<PlanetMediaKeyMode, "auto">;
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

function parseGroupRoute(r: LINETypes.GroupCallRoute): CallRouteParsed {
	const commParam = JSON.parse(r.commParam || "{}");
	const mpkeyB64 = commParam.mpkey;
	if (!mpkeyB64) throw new Error("GroupCallRoute.commParam.mpkey missing");
	return {
		cscfHost: r.voipAddress.split(",")[0],
		cscfPort: r.voipUdpPort,
		cscfHost6: r.voipAddress6?.split(",")[0],
		peerPub: decodeMpKey(mpkeyB64),
		toMid: r.hostMid ?? "",
		fromToken: r.token,
		iZone: r.fromZone,
		rZone: r.polarisZone,
		stnpk: r.stnpk,
		groupToken: r.token,
		orionIp: r.orionAddress,
		mixIp: r.polarisAddress,
		mixPort: r.polarisUdpPort,
		mediaHost: r.voipAddress.split(",")[0],
		mediaPort: r.voipUdpPort,
	};
}

function isGroupRoute(
	r: LINETypes.CallRoute | LINETypes.GroupCallRoute,
): r is LINETypes.GroupCallRoute {
	return "token" in r && !("toMid" in r);
}

const HEADER_LEN = 6;
const BOOTSTRAP_PREFIX_LEN = 51;
const BOOTSTRAP_SEC_HEADER_LEN = 5;
const BOOTSTRAP_CIPHER_OFFSET = HEADER_LEN + BOOTSTRAP_PREFIX_LEN +
	BOOTSTRAP_SEC_HEADER_LEN;
const CASSINI_MSG_ID_CC_BASE = 0x2140;
const CASSINI_MSG_ID_SETUP_REQ = 0x2141;
const CASSINI_MSG_ID_REL_REQ = 0x2145;
const CASSINI_MSG_ID_GROUP_PARTICIPATE_REQ = 0x214e;
const CASSINI_MSG_ID_MC_JOIN_RSP = 0x3285;
const CASSINI_MSG_ID_MC_CHANGE_RSP = 0x3286;
const CASSINI_MSG_ID_MC_CHECK_RPT = 0x3287;
const CASSINI_MSG_ID_MC_DATA_REQ = 0x3189;
const CASSINI_MSG_ID_MC_DATA_RSP = 0x3289;
const CASSINI_MSG_ID_KEEPALIVE_REQ = 0x1101;
const CASSINI_MSG_ID_BEPI_OPEN = 0x1102;
const REGULAR_TAIL_CONTROL_BASE = 0x18;
const REGULAR_TAIL_RAW_BASE = 0x48;
const PINHOLE_PROBE_COUNT = 16;
const PINHOLE_KIND = 16;
const PINHOLE_MTU = 300;
const PINHOLE_REPORT_MTU = 500;
const PINHOLE_PAYLOAD_BYTES = 500;
const GROUP_AUDIO_RTP_EXTENSION = new Uint8Array([
	0x01,
	0x02,
	0xc0,
	0x40,
	0x40,
	0x00,
	0x00,
	0x00,
]);
const GROUP_AUDIO_RTP_EXTENSIONS = [
	new Uint8Array([0x01, 0x02, 0xc0, 0x40, 0x7f, 0x00, 0x00, 0x00]),
	new Uint8Array([0x01, 0x02, 0xc0, 0x40, 0x53, 0x00, 0x00, 0x00]),
	new Uint8Array([0x01, 0x02, 0xc0, 0x54, 0x39, 0x00, 0x00, 0x00]),
	new Uint8Array([0x01, 0x02, 0xc0, 0x54, 0x47, 0x00, 0x00, 0x00]),
	new Uint8Array([0x01, 0x02, 0xc0, 0x50, 0x49, 0x00, 0x00, 0x00]),
	new Uint8Array([0x01, 0x02, 0xc0, 0x40, 0x50, 0x00, 0x00, 0x00]),
	new Uint8Array([0x01, 0x02, 0xc0, 0x40, 0x4f, 0x00, 0x00, 0x00]),
	new Uint8Array([0x01, 0x02, 0xc0, 0x40, 0x50, 0x00, 0x00, 0x00]),
	new Uint8Array([0x01, 0x02, 0xc0, 0x40, 0x52, 0x00, 0x00, 0x00]),
];
const GROUP_DATA_RTP_PAYLOADS = [
	new Uint8Array([
		0x80,
		0x00,
		0x00,
		0x40,
		0x00,
		0x05,
		0x02,
		0x05,
		0x00,
		0x00,
		0x00,
	]),
	new Uint8Array([
		0x80,
		0x00,
		0x00,
		0x40,
		0x00,
		0x05,
		0x02,
		0x05,
		0x00,
		0x00,
		0x00,
	]),
	new Uint8Array([
		0x80,
		0x00,
		0x00,
		0x40,
		0x00,
		0x04,
		0x02,
		0x03,
		0x1b,
		0x00,
	]),
	new Uint8Array([
		0x80,
		0x00,
		0x00,
		0x40,
		0x00,
		0x04,
		0x02,
		0x03,
		0x1b,
		0x00,
	]),
	new Uint8Array([
		0x80,
		0x00,
		0x00,
		0x40,
		0x00,
		0x04,
		0x02,
		0x03,
		0x39,
		0x00,
	]),
	new Uint8Array([
		0x80,
		0x00,
		0x00,
		0x40,
		0x00,
		0x04,
		0x02,
		0x03,
		0x39,
		0x00,
	]),
	new Uint8Array([
		0x80,
		0x00,
		0x00,
		0x40,
		0x00,
		0x05,
		0x02,
		0x03,
		0x40,
		0x57,
		0x00,
	]),
	new Uint8Array([
		0x80,
		0x00,
		0x00,
		0x40,
		0x00,
		0x05,
		0x02,
		0x03,
		0x40,
		0x57,
		0x00,
	]),
	new Uint8Array([
		0x80,
		0x00,
		0x00,
		0x40,
		0x00,
		0x05,
		0x02,
		0x03,
		0x40,
		0x75,
		0x00,
	]),
	new Uint8Array([
		0x80,
		0x00,
		0x00,
		0x03,
		0x00,
		0x02,
		0x40,
		0xc8,
		0x01,
		0x01,
	]),
];
const GROUP_DATA_RTP_TIMESTAMP_STEPS = [0, 8, 20, 10, 20, 10, 20, 10, 20, 10];
const GROUP_RTCP_SENDER_SSRC = 0x1a92;
const PINHOLE_ID_HIGH_BIT = 1n << 47n;
const PINHOLE_ID_MASK = (1n << 48n) - 1n;
let lastPinholeProbeId = 0n;

function readObservedSequence(wire: Uint8Array): number {
	if (wire.length < HEADER_LEN) throw new Error("PLANET wire too short");
	return ((wire[2] << 8) | wire[3]) & 0xffff;
}

function readCipherSequence(wire: Uint8Array, cipherOffset: number): number {
	// Native PLANET stores the CTR sequence in clear header bytes 2..3 for
	// bootstrap and regular packets alike. The remaining two fixed-header bytes
	// encode the payload length/class.
	if (cipherOffset !== BOOTSTRAP_CIPHER_OFFSET && cipherOffset !== HEADER_LEN) {
		throw new Error("readCipherSequence: unknown cipher offset");
	}
	return readObservedSequence(wire);
}

function looksBootstrapFrame(wire: Uint8Array): boolean {
	return wire.length >= BOOTSTRAP_CIPHER_OFFSET + 16 &&
		wire[4] === 0x06 && wire[5] === 0x02;
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

function packVarintField(tag: number, value: bigint | number): Uint8Array {
	return concatBytes([
		encodeVarint((tag << 3) | WireType.Varint),
		encodeVarint(value),
	]);
}

function packBytesField(tag: number, value: Uint8Array): Uint8Array {
	return concatBytes([
		encodeVarint((tag << 3) | WireType.LengthDelim),
		encodeVarint(value.length),
		value,
	]);
}

function randomBytes(byteLength: number): Uint8Array {
	const out = new Uint8Array(byteLength);
	crypto.getRandomValues(out);
	return out;
}

function bytesToHex(bytes: Uint8Array, maxBytes: number): string {
	const view = bytes.subarray(0, Math.min(bytes.length, maxBytes));
	return Array.from(view, (b) => b.toString(16).padStart(2, "0")).join("");
}

function nextPinholeProbeId(): bigint {
	const nowNs = BigInt(
		Math.floor((performance.timeOrigin + performance.now()) * 1_000_000),
	);
	let value = (nowNs & PINHOLE_ID_MASK) | PINHOLE_ID_HIGH_BIT;
	if (value <= lastPinholeProbeId) {
		value = ((lastPinholeProbeId + 1n) & PINHOLE_ID_MASK) |
			PINHOLE_ID_HIGH_BIT;
	}
	lastPinholeProbeId = value;
	return value;
}

function packPinholeProbe(): Uint8Array {
	const inner = concatBytes([
		packVarintField(1, PINHOLE_KIND),
		packVarintField(2, nextPinholeProbeId()),
		packVarintField(3, PINHOLE_MTU),
		packBytesField(4, randomBytes(PINHOLE_PAYLOAD_BYTES)),
	]);
	return packBytesField(3, inner);
}

function packPinholeProbeReport(): Uint8Array {
	return packBytesField(
		1,
		concatBytes([
			packVarintField(1, PINHOLE_REPORT_MTU),
			packVarintField(2, PINHOLE_KIND),
			packVarintField(3, PINHOLE_MTU),
		]),
	);
}

function ccMsgId(bodyTag: number): number {
	if (bodyTag === CC_MSG.CONN_RSP) return 0x2244;
	if (bodyTag === CC_MSG.REL_REQ) return CASSINI_MSG_ID_REL_REQ;
	if (bodyTag === CC_MSG.INFO_REQ) return 0x2147;
	if (bodyTag === CC_MSG.INFO_RSP) return 0x2247;
	return CASSINI_MSG_ID_CC_BASE + bodyTag;
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

function regularTail16(plaintextLen: number, raw: boolean): number {
	const base = raw ? REGULAR_TAIL_RAW_BASE : REGULAR_TAIL_CONTROL_BASE;
	return (((base | ((plaintextLen >>> 8) & 0x07)) << 8) |
		(plaintextLen & 0xff)) & 0xffff;
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

function defaultOneToOneStrmSpec(): Uint8Array {
	const state = { paused: false, code: 0 };
	return packStrmSpec({
		strms: [
			{
				ssrc: 102,
				bitrate: { target: 32 },
				state,
				ptime: 40,
				retx: { periOn: true, periIntvMs: 40, periLossThre: [0, 0, 20] },
				fecLossThre: [],
			},
			{
				ssrc: 112,
				bitrate: { min: 100, max: 1200, target: 800 },
				state,
				retx: { periOn: false },
				fecLossThre: [0, 1, 10],
			},
			{
				ssrc: 122,
				bitrate: { max: 2000 },
				state,
				retx: { periOn: false },
				fecLossThre: [],
			},
		],
		fbIntv: 200,
		tp: 1,
		fbOn: true,
		txStrms: [
			{
				ssrc: 202,
				state,
				retx: { reqdOn: true, reqdRttThre: 300 },
			},
			{
				ssrc: 212,
				state,
				retx: { reqdOn: false },
			},
		],
		link: {
			bwInitKbps: 886,
			bwMaxKbps: 3000,
			probeRate: 0.2,
			probeBrMaxKbps: 200,
		},
	});
}

function defaultOneToOneDataSessionPayload(): Uint8Array {
	return packMcDataSessionPayload(defaultOneToOneStrmSpec());
}

function defaultSetupFeatures(): Uint8Array[] {
	return [
		packPlanetFeatureRegister(16, true, 0),
		packPlanetFeatureRegister(17, false, 0),
		packPlanetFeatureRegister(0, false, 0),
	];
}

function defaultGroupParticipateFeatures(): Uint8Array[] {
	return [
		packPlanetFeatureRegister(16, true, 0),
		packPlanetFeatureRegister(17, false, 0),
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

function randomNativeGroupCcChanId(): number {
	return randomBitLength(28, 28);
}

function randomNativeGroupMediaChanId(): number {
	return randomBitLength(31, 31);
}

function randomInitialFrameSeq(): number {
	return randomIntInclusive(1, 1023);
}

function addU32(value: number, delta: number): number {
	return (value + delta) >>> 0;
}

function putU16(out: Uint8Array, off: number, value: number): void {
	out[off] = (value >>> 8) & 0xff;
	out[off + 1] = value & 0xff;
}

function putU32(out: Uint8Array, off: number, value: number): void {
	out[off] = (value >>> 24) & 0xff;
	out[off + 1] = (value >>> 16) & 0xff;
	out[off + 2] = (value >>> 8) & 0xff;
	out[off + 3] = value & 0xff;
}

function randomSsrcBase(): number {
	let base = randomU32() & 0xffff_ff00;
	if (base === 0) base = 0x100;
	return base >>> 0;
}

function buildGroupRtcpFeedback(opts: {
	senderSsrc: number;
	rxAudioSsrc: number;
	rxDataSsrc: number;
}): Uint8Array {
	const out = new Uint8Array(48);
	out[0] = 0x8b; // RTCP RTPFB, FMT=11
	out[1] = 0xcd; // PT=205, logged as RTP-like payload type 77
	putU16(out, 2, 11);
	putU32(out, 4, opts.senderSsrc);
	putU32(out, 8, opts.senderSsrc);
	out.set([0x00, 0x00, 0x01, 0x66, 0x00, 0x01, 0x00, 0xc8], 12);
	putU32(out, 20, opts.rxDataSsrc);
	out.set([0x00, 0x01, 0x00, 0x02, 0x02, 0x73, 0x00, 0x00], 24);
	putU32(out, 32, opts.rxAudioSsrc);
	putU32(out, 36, 0);
	putU32(out, 40, opts.rxAudioSsrc);
	putU32(out, 44, 0);
	return out;
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

function tryDecodeNativeSetupOffer(
	bytes: Uint8Array | undefined,
): NativeSetupOffer | undefined {
	if (!bytes) return undefined;
	try {
		return decodeNativeSetupOffer(bytes);
	} catch {
		return undefined;
	}
}

function fieldShape(fields: DecodedField[]): Array<{
	tag: number;
	wt: number;
	len?: number;
	scalar?: number | string;
}> {
	return fields.map((f) => ({
		tag: f.tag,
		wt: f.wireType,
		len: f.value instanceof Uint8Array ? f.value.length : undefined,
		scalar: typeof f.value === "bigint"
			? f.value <= BigInt(Number.MAX_SAFE_INTEGER)
				? Number(f.value)
				: f.value.toString()
			: undefined,
	}));
}

function fieldNumber(fields: DecodedField[], tag: number): number | undefined {
	const v = fields.find((f) => f.tag === tag)?.value;
	return typeof v === "bigint" ? Number(v) : undefined;
}

function fieldText(fields: DecodedField[], tag: number): string | undefined {
	const v = fields.find((f) => f.tag === tag)?.value;
	if (!(v instanceof Uint8Array)) return undefined;
	const s = new TextDecoder().decode(v);
	return /^[\x20-\x7e]{0,80}$/.test(s) ? s : undefined;
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

function defaultGroupParticipateCredential(
	route: CallRouteParsed,
	participant: string,
	roomId: string,
	cid: string,
): Uint8Array {
	if (!route.groupToken) throw new Error("GroupCallRoute.token missing");
	return sha256(
		concatBytes([
			new TextEncoder().encode(participant),
			new TextEncoder().encode("::"),
			new TextEncoder().encode(roomId),
			new TextEncoder().encode("::"),
			new TextEncoder().encode(route.groupToken),
			new TextEncoder().encode("::"),
			new TextEncoder().encode(cid),
		]),
	);
}

function isRtpLike(wire: Uint8Array): boolean {
	return wire.length >= 12 && (wire[0] & 0xc0) === 0x80;
}

function firstPort(ports: string | undefined): number | undefined {
	if (!ports) return undefined;
	const hit = ports.match(/\d+/);
	if (!hit) return undefined;
	const port = Number(hit[0]);
	return Number.isInteger(port) && port > 0 && port <= 65535 ? port : undefined;
}

function addrEndpoint(
	addr: PlanetAddr | undefined,
): { host: string; port: number } | undefined {
	if (!addr?.ip) return undefined;
	if (
		addr.trpt !== undefined && addr.trpt !== 0 && addr.trpt !== 1
	) return undefined;
	const port = typeof addr.port === "number"
		? addr.port
		: firstPort(addr.ports);
	if (
		typeof port !== "number" || !Number.isInteger(port) || port <= 0 ||
		port > 65535
	) return undefined;
	return { host: addr.ip, port };
}

function bridgeInfoAddr(bytes: Uint8Array | undefined): PlanetAddr | undefined {
	if (!bytes) return undefined;
	try {
		const addr = decodeFields(bytes).find((f) =>
			f.tag === 1 && f.value instanceof Uint8Array
		)?.value as Uint8Array | undefined;
		return addr ? decodePlanetAddr(addr) : undefined;
	} catch {
		return undefined;
	}
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
	#callUuid?: string;
	#callUuid16?: Uint8Array;
	#localMediaOffer?: PlanetLocalMediaOffer;
	#localMediaChanId = 1n;
	#srtpSend?: SrtpCryptoContext;
	#srtpRecv?: SrtpCryptoContext;
	#groupDataSrtpSend?: SrtpCryptoContext;
	#dataSrtpRecv?: SrtpCryptoContext;
	#mediaKeyMode?: PlanetMediaKeyMode;
	#mediaKeyCandidates: MediaKeyCandidate[] = [];
	#rtp?: {
		host: string;
		port: number;
		payloadType: number;
		ssrc: number;
		seq: number;
		timestamp: number;
	};
	#groupDataRtp?: {
		ssrc: number;
		seq: number;
		timestamp: number;
		index: number;
	};
	#rtpQueue: Uint8Array[] = [];
	#rtpWaiters: Array<(packet: Uint8Array | null) => void> = [];
	#keepaliveTimer?: ReturnType<typeof setTimeout>;
	#srcChanId = 1n;
	#setupSent = false;
	#groupJoined = false;
	#groupDataSessionSent = false;
	#groupAudioSsrc?: number;
	#groupAudioExtensionIndex = 0;
	#groupRxAudioSsrc?: number;
	#groupDataSsrc?: number;
	#groupRxDataSsrc?: number;
	#groupRtcpSsrc?: number;
	#groupRtcpSent = false;
	#remoteCcChanId = 0n;
	#remoteMediaChanId = 0n;
	#targetMid?: string;
	#closed = true;
	#autoConnRspDuplicates = false;
	#connRspDuplicateInFlight = false;

	// Per-msg sequence + protocol state
	#nextSeq = 0x01d0;
	#tranSeq = 1;
	#msgIdCounter = 1;

	// loc_nonce we generate, rmt_nonce we learn from cscf's first reply
	#locNonce = 0n;
	#rmtNonce = 0n;
	#nonceLearned = false;

	#pending: Array<(env: PlanetIncomingMessage | Error) => void> = [];
	#queued: PlanetIncomingMessage[] = [];

	constructor(opts: PlanetTransportOpts) {
		this.#opts = opts;
	}

	#debug(event: Record<string, unknown>) {
		try {
			this.#opts.debug?.(event);
		} catch { /* debug hooks must never affect transport */ }
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

	async connect(
		opts: { route: LINETypes.CallRoute | LINETypes.GroupCallRoute },
	): Promise<void> {
		this.#route = isGroupRoute(opts.route)
			? parseGroupRoute(opts.route)
			: parseRoute(opts.route);
		this.#local = this.#opts.transportKeypair
			? {
				privateKey: copyBytes(this.#opts.transportKeypair.privateKey),
				publicKey: copyBytes(this.#opts.transportKeypair.publicKey),
			}
			: generateEphemeralKeypair();
		this.#sessId = new Uint8Array(0);
		this.#bootstrapSeed = newSessionId();
		this.#sendLabel = crypto.getRandomValues(new Uint16Array(1))[0];
		this.#callUuid16 = crypto.getRandomValues(new Uint8Array(16));
		this.#callUuid = crypto.randomUUID();
		this.#msgIdCounter = randomVarint2();
		this.#tranSeq = randomNativeTranSeq();
		if (this.#route.groupToken) {
			this.#srcChanId = BigInt(randomNativeGroupCcChanId());
			this.#localMediaChanId = BigInt(randomNativeGroupMediaChanId());
		} else {
			this.#srcChanId = BigInt(randomNativeLargeId());
			this.#localMediaChanId = this.#srcChanId;
		}
		this.#nextSeq = randomInitialFrameSeq();
		this.#setupSent = false;
		this.#groupJoined = false;
		this.#groupDataSessionSent = false;
		this.#groupAudioSsrc = undefined;
		this.#groupAudioExtensionIndex = 0;
		this.#groupRxAudioSsrc = undefined;
		this.#groupDataSsrc = undefined;
		this.#groupRxDataSsrc = undefined;
		this.#groupRtcpSsrc = undefined;
		this.#groupRtcpSent = false;
		this.#remoteCcChanId = 0n;
		this.#remoteMediaChanId = 0n;
		this.#targetMid = undefined;
		this.#autoConnRspDuplicates = false;
		this.#connRspDuplicateInFlight = false;
		this.#localMediaOffer = undefined;
		this.#srtpSend = undefined;
		this.#srtpRecv = undefined;
		this.#groupDataSrtpSend = undefined;
		this.#dataSrtpRecv = undefined;
		this.#mediaKeyMode = undefined;
		this.#mediaKeyCandidates = [];
		this.#rtp = undefined;
		this.#groupDataRtp = undefined;
		this.#rtpQueue = [];
		this.#queued = [];
		this.#clearKeepalive();
		this.#closed = false;

		// Native bootstrap uses a local seed/label for the first outbound SETUP.
		// The first inbound packet carries its own seed/label, so receive keys
		// are derived lazily from that packet before HMAC verification.
		this.#sendKeys = this.#deriveSendKeys(
			this.#bootstrapSeed,
			this.#sendLabel,
		);
		this.#recvKeys = undefined;

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
			sock.on("message", (buf, rinfo) =>
				this.#onWire(new Uint8Array(buf), {
					host: rinfo.address,
					port: rinfo.port,
				}));
		}
	}

	#onWire(wire: Uint8Array, source?: { host: string; port: number }) {
		try {
			this.#debug({
				type: "recv",
				bytes: wire.length,
				rtpLike: isRtpLike(wire),
				sourceFamily: source?.host.includes(":")
					? "ipv6"
					: source
					? "ipv4"
					: "",
				sourcePort: source?.port,
			});
			if (this.#srtpRecv && isRtpLike(wire)) {
				this.#debug({
					type: "rtp_recv",
					bytes: wire.length,
					payloadType: wire[1] & 0x7f,
					marker: (wire[1] & 0x80) !== 0,
					seq: wire.length >= 4 ? ((wire[2] << 8) | wire[3]) : undefined,
					ssrc: wire.length >= 12
						? (((wire[8] << 24) | (wire[9] << 16) | (wire[10] << 8) |
							wire[11]) >>> 0)
						: undefined,
				});
				this.#updateRtpEndpointFromSource(source);
				this.#enqueueRtp(wire);
				return;
			}
			if (wire.length < HEADER_LEN + 16) {
				this.#debug({ type: "recv_ignored", reason: "short" });
				return;
			}
			parseFrameHeader(wire);
			const pt = this.#decryptWire(wire);
			if (!pt) {
				this.#debug({ type: "decrypt_fail" });
				return;
			}
			this.#debug({ type: "decrypt_ok", plainBytes: pt.length });
			const incoming: PlanetIncomingMessage = { plaintext: pt };
			let outer: DecodedField[];
			try {
				outer = decodeFields(pt);
			} catch (e) {
				this.#debug({
					type: "raw_plain",
					plainBytes: pt.length,
					head: bytesToHex(pt, 48),
					decodeError: e instanceof Error ? e.message : String(e),
				});
				const w = this.#pending.shift();
				if (w) w(incoming);
				else this.#queued.push(incoming);
				return;
			}
			this.#debug({ type: "plain_shape", outer: fieldShape(outer) });
			if (
				outer.length === 1 &&
				outer[0]?.value instanceof Uint8Array &&
				outer[0].tag !== 1 &&
				outer[0].tag !== 3
			) {
				this.#debug({
					type: "raw_plain",
					plainBytes: pt.length,
					tag: outer[0].tag,
					bodyLen: outer[0].value.length,
					head: bytesToHex(pt, 48),
				});
			}

			// Parse outer planet_msg to find hdr → extract loc_nonce on first reply
			if (!this.#nonceLearned) {
				try {
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
				incoming.message = msg;
				const ccBytes = outer.find((f) =>
					f.tag === 3 && f.value instanceof Uint8Array
				)?.value as Uint8Array | undefined;
				if (ccBytes) {
					const ccFields = decodeFields(ccBytes);
					const bodyBytes = ccFields.find((f) =>
						f.tag === 2 && f.value instanceof Uint8Array
					)?.value as Uint8Array | undefined;
					this.#debug({
						type: "cc_shape",
						cc: fieldShape(ccFields),
						body: bodyBytes ? fieldShape(decodeFields(bodyBytes)) : [],
					});
				}
				if (msg.mc?.bodyBytes) {
					const mcFields = decodeFields(msg.mc.bodyBytes);
					this.#debug({
						type: "mc_shape",
						mc: msg.mc.bodyName ?? "",
						mcTag: msg.mc.bodyTag ?? 0,
						body: fieldShape(mcFields),
					});
					if (msg.mc.bodyTag === MC_MSG.DATA_RSP) {
						this.#debug({
							type: "mc_data_rsp",
							result: fieldNumber(mcFields, 1),
							relCode: fieldNumber(mcFields, 2),
							relPhrase: fieldText(mcFields, 3),
							relPhraseLen: (mcFields.find((f) => f.tag === 3)?.value as
								| Uint8Array
								| undefined)?.length,
						});
					}
					if (msg.mc.bodyTag === MC_MSG.DATA_REQ) {
						void this.#sendMcDataRsp(
							incoming as PlanetIncomingMessage & {
								message: ReturnType<typeof decodePlanetMsg>;
							},
						).catch(() => {});
					}
					if (msg.mc.bodyTag === MC_MSG.JOIN_REQ) {
						void this.#sendMcJoinRsp(
							incoming as PlanetIncomingMessage & {
								message: ReturnType<typeof decodePlanetMsg>;
							},
						).catch(() => {});
					}
					if (msg.mc.bodyTag === MC_MSG.CHANGE_REQ) {
						void this.#sendMcChangeRsp(
							incoming as PlanetIncomingMessage & {
								message: ReturnType<typeof decodePlanetMsg>;
							},
						).catch(() => {});
					}
				}
				this.#debug({
					type: "planet_msg",
					cc: msg.cc?.bodyName ?? "",
					ccTag: msg.cc?.bodyTag ?? 0,
					mc: msg.mc?.bodyName ?? "",
					mcTag: msg.mc?.bodyTag ?? 0,
				});
				if (msg.hdr?.sessId?.length) this.#sessId = msg.hdr.sessId;
				if (msg.hdr?.locNonce !== undefined && !this.#nonceLearned) {
					this.#rmtNonce = msg.hdr.locNonce;
					this.#nonceLearned = true;
				}
				if (msg.cc?.bodyTag === CC_MSG.INFO_REQ && msg.cc.bodyBytes) {
					void this.#sendInfoRsp(
						incoming as PlanetIncomingMessage & {
							message: ReturnType<typeof decodePlanetMsg>;
						},
					).catch(() => {});
				}
				if (msg.cc?.bodyTag === CC_MSG.REL_REQ && msg.cc.bodyBytes) {
					try {
						const relReq = decodeCcRelReq(msg.cc.bodyBytes);
						this.#debug({
							type: "rel_req",
							relCode: relReq.relCode,
							relPhrase: relReq.relPhrase,
							relPhraseLen: relReq.relPhrase?.length,
							releaser: relReq.releaser,
							releaserLen: relReq.releaser?.length,
							commMediaFlags: relReq.commMediaFlags,
							userRelCode: relReq.userRelCode,
							userRelCodeLen: relReq.userRelCode?.length,
							roomDestroy: relReq.roomDestroy,
						});
					} catch {
						// Keep processing even if a newer REL shape appears.
					}
				}
				if (msg.cc?.bodyTag === CC_MSG.CONN_REQ && msg.cc.bodyBytes) {
					void this.#sendDuplicateConnRsp(
						incoming as PlanetIncomingMessage & {
							message: ReturnType<typeof decodePlanetMsg>;
						},
					).catch(() => {});
				}
			} catch {
				// Keep the raw reply flowing even if a newer message type is unknown.
			}

			const w = this.#pending.shift();
			if (w) w(incoming);
			else this.#queued.push(incoming);
		} catch (_e) {
			this.#debug({ type: "recv_error" });
			// Probably SRTP media or malformed — ignore
		}
	}

	#enqueueRtp(packet: Uint8Array) {
		const waiter = this.#rtpWaiters.shift();
		if (waiter) waiter(packet);
		else this.#rtpQueue.push(packet);
	}

	#updateRtpEndpointFromSource(
		source: { host: string; port: number } | undefined,
	) {
		if (!source || !this.#rtp) return;
		if (this.#rtp.host === source.host && this.#rtp.port === source.port) {
			return;
		}
		if (this.#groupJoined) {
			this.#debug({
				type: "media_endpoint_learn_skipped",
				reason: "group_fixed_route",
				family: source.host.includes(":") ? "ipv6" : "ipv4",
				sourcePort: source.port,
				currentPort: this.#rtp.port,
			});
			return;
		}
		this.#rtp.host = source.host;
		this.#rtp.port = source.port;
		this.#debug({
			type: "media_endpoint_learned",
			family: source.host.includes(":") ? "ipv6" : "ipv4",
			port: source.port,
		});
	}

	#takeRtp(): Promise<Uint8Array | null> {
		const queued = this.#rtpQueue.shift();
		if (queued) return Promise.resolve(queued);
		return new Promise((resolve) => this.#rtpWaiters.push(resolve));
	}

	async #decryptMediaRtp(
		wire: Uint8Array,
	): Promise<{ rtp: Uint8Array; mode: string; switched: boolean }> {
		if (!this.#srtpRecv) {
			throw new Error("PlanetTransport.receive: media not established");
		}
		try {
			return {
				rtp: await srtpDecrypt(this.#srtpRecv, wire),
				mode: String(this.#mediaKeyMode ?? "current"),
				switched: false,
			};
		} catch (e) {
			if (this.#mediaKeyMode !== "auto") throw e;
		}
		for (const candidate of this.#mediaKeyCandidates) {
			if (candidate.recvContext === this.#srtpRecv) continue;
			try {
				const rtp = await srtpDecrypt(candidate.recvContext, wire);
				this.#srtpSend = candidate.sendContext;
				this.#srtpRecv = candidate.recvContext;
				this.#debug({
					type: "media_key_selected",
					mode: candidate.mode,
					send: candidate.send,
					recv: candidate.recv,
				});
				return { rtp, mode: candidate.mode, switched: true };
			} catch { /* try next candidate */ }
		}
		throw new Error("SRTP auth tag mismatch");
	}

	#decryptWire(wire: Uint8Array): Uint8Array | null {
		if (wire.length < HEADER_LEN + 16) return null;
		if (looksBootstrapFrame(wire)) {
			const bootstrap = this.#decryptBootstrapWire(wire);
			if (bootstrap) return bootstrap;
			return this.#recvKeys
				? this.#decryptWithKeys(wire, this.#recvKeys, HEADER_LEN)
				: null;
		}
		const regular = this.#recvKeys
			? this.#decryptWithKeys(wire, this.#recvKeys, HEADER_LEN)
			: null;
		if (regular) return regular;
		return this.#decryptBootstrapWire(wire);
	}

	#deriveSendKeys(seed: Uint8Array, label: number): TransportKeys {
		if (!this.#local || !this.#route) throw new Error("connect first");
		const secret = ecdh(this.#local.privateKey, this.#route.peerPub);
		const stage1 = planetHkdfStage1(
			secret,
			this.#route.peerPub,
			this.#local.publicKey,
		);
		return planetHkdfStage2(stage1, seed, buildDirectionLabel(label));
	}

	#deriveRecvKeys(seed: Uint8Array, label: number): TransportKeys {
		if (!this.#local || !this.#route) throw new Error("connect first");
		const secret = ecdh(this.#local.privateKey, this.#route.peerPub);
		const stage1 = planetHkdfStage1(
			secret,
			this.#local.publicKey,
			this.#route.peerPub,
		);
		return planetHkdfStage2(stage1, seed, buildDirectionLabel(label));
	}

	#decryptBootstrapWire(wire: Uint8Array): Uint8Array | null {
		if (wire.length < BOOTSTRAP_CIPHER_OFFSET + 16) return null;
		const label = ((wire[HEADER_LEN] << 8) | wire[HEADER_LEN + 1]) & 0xffff;
		const seed = copyBytes(
			wire.subarray(HEADER_LEN + 2, HEADER_LEN + 18),
		);
		const keys = this.#deriveRecvKeys(seed, label);
		const plaintext = this.#decryptWithKeys(
			wire,
			keys,
			BOOTSTRAP_CIPHER_OFFSET,
		);
		if (!plaintext) return null;
		this.#recvKeys = keys;
		return plaintext;
	}

	#decryptWithKeys(
		wire: Uint8Array,
		keys: TransportKeys,
		cipherOffset: number,
	): Uint8Array | null {
		if (wire.length < cipherOffset + 16) return null;
		const seq = readCipherSequence(wire, cipherOffset);
		const tag = wire.subarray(wire.length - 16);
		const macInput = wire.subarray(0, wire.length - 16);
		const ct = wire.subarray(cipherOffset, wire.length - 16);
		const expected = hmacTag(keys.macKey, macInput);
		if (!tagEquals(tag, expected)) return null;
		return aesCtrDecrypt(
			keys.encKey,
			buildPlanetCtrIv(keys.ctrBase, seq),
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

	#planetHdr(msgId = this.#msgIdCounter++): PlanetMsgHdr {
		if (!this.#sessId) throw new Error("connect first");
		const tranId = new Uint8Array(16);
		crypto.getRandomValues(tranId);
		return {
			userId: this.#opts.localMid,
			msgId,
			sessId: this.#sessId,
			tranId,
			tranSeq: this.#tranSeq++,
			locNonce: this.#locNonce,
			rmtNonce: this.#rmtNonce,
		};
	}

	async #sendEnvelope(
		body: { kind: "sc" | "cc" | "mc"; data: Uint8Array },
		opts: { bootstrap?: boolean; msgId?: number } = {},
	): Promise<void> {
		const hdr = this.#planetHdr(opts.msgId);
		const planetMsg = packPlanetMsg(hdr, body);
		this.#debug({
			type: "send_planet_msg",
			kind: body.kind,
			msgId: hdr.msgId,
			sessIdBytes: hdr.sessId.length,
			tranIdBytes: hdr.tranId.length,
			tranSeqBits: hdr.tranSeq.toString(2).length,
			locNonceBits: hdr.locNonce.toString(2).length,
			rmtNoncePresent: hdr.rmtNonce !== 0n,
		});
		await this.#sendTransportPlaintext(planetMsg, {
			bootstrap: opts.bootstrap,
			raw: false,
		});
	}

	async #sendTransportPlaintext(
		plaintext: Uint8Array,
		opts: { bootstrap?: boolean; raw?: boolean } = {},
	): Promise<void> {
		if ((!this.#sock && !this.#opts.wireSend) || !this.#route) {
			throw new Error("not connected");
		}
		const seq = this.#nextSeq++;
		const prefix = opts.bootstrap ? this.#bootstrapPrefix() : new Uint8Array(0);
		const sec = opts.bootstrap
			? buildBootstrapSecHeader(plaintext.length)
			: new Uint8Array(0);
		const ct = this.#encrypt(plaintext, seq & 0xffff);
		const tagLen = 16;
		const bodyLen = prefix.length + sec.length + ct.length + tagLen;
		const totalLen = HEADER_LEN + bodyLen;
		const chunkLogical = (((totalLen - 4) << 5) |
			(opts.bootstrap ? 0x1d : 0x0d)) & 0xffff;
		const hdr = opts.bootstrap
			? buildObservedFrameHeader(chunkLogical, seq & 0xffff, 0x0602)
			: buildObservedFrameHeader(
				chunkLogical,
				seq & 0xffff,
				regularTail16(plaintext.length, !!opts.raw),
			);
		const macInput = concatBytes([hdr, prefix, sec, ct]);
		const tag = hmacTag(this.#sendKeys!.macKey, macInput);
		const datagram = concatBytes([macInput, tag]);
		const host = this.#opts.preferIpv6 && this.#route.cscfHost6
			? this.#route.cscfHost6
			: this.#route.cscfHost;
		this.#debug({
			type: "send",
			bootstrap: !!opts.bootstrap,
			raw: !!opts.raw,
			seq,
			bytes: datagram.length,
			plainBytes: plaintext.length,
			bodyBytes: bodyLen,
			family: host.includes(":") ? "ipv6" : "ipv4",
		});
		if (this.#opts.wireSend) {
			const reply = await this.#opts.wireSend(datagram, {
				host,
				port: this.#route.cscfPort,
				bootstrap: !!opts.bootstrap,
				seq,
				plainLen: plaintext.length,
				bodyLen,
				plaintext,
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

	async #sendPinholeProbes(): Promise<void> {
		for (let i = 0; i < PINHOLE_PROBE_COUNT; i++) {
			await this.#sendTransportPlaintext(packPinholeProbe(), { raw: true });
		}
		await this.#sendTransportPlaintext(packPinholeProbeReport(), { raw: true });
	}

	#waitForIncoming(timeoutMs: number): Promise<PlanetIncomingMessage> {
		const queued = this.#queued.shift();
		if (queued) return Promise.resolve(queued);
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

	async #waitForCc(
		bodyTag: number,
		timeoutMs: number,
	): Promise<
		PlanetIncomingMessage & {
			message: ReturnType<typeof decodePlanetMsg>;
		}
	> {
		const deadline = Date.now() + timeoutMs;
		while (true) {
			const remaining = Math.max(1, deadline - Date.now());
			const incoming = await this.#waitForIncoming(remaining);
			if (
				incoming.message?.cc?.bodyTag === bodyTag &&
				incoming.message.cc.bodyBytes
			) {
				return incoming as PlanetIncomingMessage & {
					message: ReturnType<typeof decodePlanetMsg>;
				};
			}
			if (Date.now() >= deadline) throw new Error("PLANET reply timeout");
		}
	}

	async #sendSetup(opts: { to: string }): Promise<void> {
		if (!this.#route || !this.#local) throw new Error("connect first");
		this.#targetMid = opts.to;
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
		await this.#sendEnvelope(
			{ kind: "cc", data: ccMsg },
			{ bootstrap: true, msgId: CASSINI_MSG_ID_SETUP_REQ },
		);
		this.#setupSent = true;
	}

	async inviteDetailed(opts: { to: string }): Promise<PlanetInviteResult> {
		await this.#sendSetup(opts);
		const reply = await this.#waitForCc(
			CC_MSG.SETUP_RSP,
			this.#opts.timeoutMs ?? 10000,
		);
		const setupBytes = reply.message.cc?.bodyBytes;
		if (!setupBytes) throw new Error("PLANET setup_rsp missing body");
		const setupRsp = decodeCcSetupRsp(setupBytes);
		await this.#sendPinholeProbes();
		await this.#sendKeepalive();
		this.#startKeepalive(setupRsp.aliveRptInterval);
		return {
			plaintext: reply.plaintext,
			message: reply.message,
			setupRsp,
		};
	}

	async invite(opts: { to: string }): Promise<Uint8Array> {
		return (await this.inviteDetailed(opts)).plaintext;
	}

	async #sendParticipate(opts: { roomId: string }): Promise<void> {
		if (!this.#route || !this.#local) throw new Error("connect first");
		const route = this.#route;
		const cid = this.#callUuid!;
		const localMediaOffer = defaultLocalMediaOffer();
		this.#localMediaOffer = localMediaOffer;
		const offer = this.#opts.setupOffer ??
			packNativeGroupParticipateOffer({
				mediaSecret: localMediaOffer.material.mediaSecret,
			});
		const participate: CcParticipateReq = {
			participant: this.#opts.localMid,
			roomId: opts.roomId,
			pZone: route.iZone,
			xZone: route.rZone,
			orionIp: route.orionIp,
			mixIp: route.mixIp,
			ua: packPlanetUserAgent(
				this.#opts.userAgent ?? defaultAndroidUserAgent(this.#opts.deviceInfo),
			),
			devId: this.#opts.deviceId ?? randomBase64(32),
			commTypeFlags: 1,
			capas: this.#opts.capabilities ?? [1, 2, 3, 6, 4, 5],
			offer,
			credential: this.#opts.credential ??
				defaultGroupParticipateCredential(
					route,
					this.#opts.localMid,
					opts.roomId,
					cid,
				),
			svcKey: this.#opts.serviceKey ?? "groupcall.audio",
			netType: 1,
			mChanId: this.#localMediaChanId,
			mixPort: route.mixPort,
			features: this.#opts.features ?? defaultGroupParticipateFeatures(),
			roomAttrs: [1],
			recvRtp: 2,
			maxChanCnt: 30,
			unavailToSec: 0,
			pdtpOndemandStreams: [
				concatBytes([packVarintField(1, 4), packVarintField(2, 2)]),
			],
			ueExtraInfo: packVarintField(1, 1),
			pathCheck: false,
		};
		const participateBytes = packCcParticipateReq(participate);
		this.#debug({
			type: "participate_req",
			bodyBytes: participateBytes.length,
			fields: fieldShape(decodeFields(participateBytes)),
			svcKeyBytes: participate.svcKey?.length,
			offerBytes: participate.offer?.length,
			credentialBytes: participate.credential?.length,
			srcChanIdBits: this.#srcChanId.toString(2).length,
			mChanIdBits: this.#localMediaChanId.toString(2).length,
		});
		const ccBody = wrapCcMsg(
			CC_MSG.PARTICIPATE_REQ,
			participateBytes,
		);
		const ccMsg = packPlanetCcMsg(
			{ cid, srcChanId: this.#srcChanId, dstChanId: 0n },
			ccBody,
		);
		await this.#sendEnvelope(
			{ kind: "cc", data: ccMsg },
			{ bootstrap: true, msgId: CASSINI_MSG_ID_GROUP_PARTICIPATE_REQ },
		);
		this.#setupSent = true;
		this.#groupJoined = true;
	}

	async #sendGroupDataSessionOpen(dstChanId: bigint): Promise<void> {
		if (!this.#route) throw new Error("connect first");
		if (this.#groupDataSessionSent) return;
		const cid = this.#callUuid!;
		const base = randomSsrcBase();
		const rxAudioSsrc = addU32(base, 0x79);
		const txAudioSsrc = addU32(base, 0x7d);
		const rxVideoSsrc = addU32(base, 0xd9);
		const txVideoSsrc = addU32(base, 0xdd);
		const rxDataSsrc = addU32(base, 0xa9);
		const txDataSsrc = addU32(base, 0xad);
		this.#groupAudioSsrc = txAudioSsrc;
		this.#groupRxAudioSsrc = rxAudioSsrc;
		this.#groupDataSsrc = txDataSsrc;
		this.#groupRxDataSsrc = rxDataSsrc;
		const state = { paused: false, code: 0 };
		const strmSpec = packStrmSpec({
			strms: [
				{
					ssrc: rxAudioSsrc,
					bitrate: { target: 32 },
					state,
					ptime: 40,
					retx: { periOn: true, periIntvMs: 40, periLossThre: [0, 0, 20] },
					fecLossThre: [],
				},
				{
					ssrc: rxVideoSsrc,
					bitrate: { min: 100, max: 1200, target: 800 },
					state,
					retx: { periOn: false },
					fecLossThre: [0, 1, 10],
				},
				{
					ssrc: rxDataSsrc,
					bitrate: { max: 2000 },
					state,
					retx: { periOn: false },
					fecLossThre: [],
				},
			],
			fbIntv: 200,
			tp: 1,
			fbOn: true,
			txStrms: [
				{
					ssrc: txAudioSsrc,
					state,
					retx: { reqdOn: true, reqdRttThre: 300 },
				},
				{
					ssrc: txVideoSsrc,
					state,
					retx: { reqdOn: false },
				},
			],
			link: {
				bwInitKbps: 1200,
				bwMaxKbps: 3000,
				probeRate: 0.2,
				probeBrMaxKbps: 200,
			},
		});
		const data = packMcDataSessionPayload(strmSpec);
		const dataReq = packMcDataReq({
			srcType: 0,
			dstType: 0,
			dispatchId: 2,
			data,
		});
		const mcBody = wrapMcMsg(MC_MSG.DATA_REQ, dataReq);
		const mcMsg = packPlanetMcMsg(
			{ cid, srcChanId: this.#localMediaChanId, dstChanId },
			mcBody,
		);
		this.#debug({
			type: "group_data_session_req",
			bodyBytes: dataReq.length,
			dataBytes: data.length,
			strmSpecBytes: strmSpec.length,
			audioSsrc: txAudioSsrc,
			dataSsrc: txDataSsrc,
			dstChanIdBits: dstChanId.toString(2).length,
		});
		await this.#sendEnvelope(
			{ kind: "mc", data: mcMsg },
			{ msgId: CASSINI_MSG_ID_MC_DATA_REQ },
		);
		this.#groupDataSessionSent = true;
	}

	async joinGroupDetailed(
		opts: { roomId: string },
	): Promise<PlanetGroupJoinResult> {
		await this.#sendParticipate(opts);
		const deadline = Date.now() + (this.#opts.timeoutMs ?? 10000);
		let reply:
			| (PlanetIncomingMessage & {
				message: ReturnType<typeof decodePlanetMsg>;
			})
			| undefined;
		let participateRsp: ReturnType<typeof decodeCcParticipateRsp> | undefined;
		while (true) {
			const remaining = Math.max(1, deadline - Date.now());
			reply = await this.#waitForCc(CC_MSG.PARTICIPATE_RSP, remaining);
			const bodyBytes = reply.message.cc?.bodyBytes;
			if (!bodyBytes) throw new Error("PLANET participate_rsp missing body");
			participateRsp = decodeCcParticipateRsp(bodyBytes);
			this.#debug({
				type: "participate_rsp",
				bodyBytes: bodyBytes.length,
				fields: fieldShape(decodeFields(bodyBytes)),
				result: participateRsp.result,
				relCode: participateRsp.relCode,
				answerBytes: participateRsp.answer?.length,
				contentsBytes: participateRsp.contents?.length,
			});
			const remoteChanId = reply.message.cc?.hdr?.srcChanId;
			if (
				this.#opts.groupDataSessionAfterProvisional &&
				!this.#groupDataSessionSent && remoteChanId !== undefined &&
				participateRsp.relCode === undefined &&
				(participateRsp.result === undefined || participateRsp.result === 0)
			) {
				await this.#sendGroupDataSessionOpen(remoteChanId);
			}
			if (
				participateRsp.result !== undefined ||
				participateRsp.relCode !== undefined ||
				participateRsp.answer ||
				participateRsp.contents
			) {
				break;
			}
			if (Date.now() >= deadline) throw new Error("PLANET reply timeout");
		}
		this.#remoteCcChanId = reply.message.cc?.hdr?.srcChanId ?? 0n;
		this.#remoteMediaChanId = participateRsp.mChanId ?? 0n;
		const mcDstChanId = this.#remoteMediaChanId || this.#remoteCcChanId;
		if (!this.#groupDataSessionSent && mcDstChanId !== 0n) {
			await this.#sendGroupDataSessionOpen(mcDstChanId);
		}
		const peerAnswerOffer = tryDecodeNativeSetupOffer(participateRsp.answer);
		const bridgeAddr = bridgeInfoAddr(participateRsp.bridgeInfo);
		if (bridgeAddr) {
			this.#debug({
				type: "group_bridge_addr",
				host: bridgeAddr.ip,
				port: bridgeAddr.port ?? bridgeAddr.ports,
				trpt: bridgeAddr.trpt,
			});
		}
		const mediaReady = await this.#configureMedia(peerAnswerOffer, {
			answer: participateRsp.answer,
			mChanId: participateRsp.mChanId,
			netType: 1,
			unavailToSec: 120,
			oCapas: [],
			features: [],
		});
		await this.#sendPinholeProbes();
		await this.#sendKeepalive();
		this.#startKeepalive(participateRsp.aliveRptInterval);
		return {
			plaintext: reply.plaintext,
			message: reply.message,
			participateRsp,
			peerAnswerOffer,
			mediaReady,
		};
	}

	async joinGroup(opts: { roomId: string }): Promise<Uint8Array> {
		return (await this.joinGroupDetailed(opts)).plaintext;
	}

	async waitForAnswerDetailed(opts: {
		timeoutMs?: number;
		autoConnRsp?: boolean;
	} = {}): Promise<PlanetAnswerResult> {
		const reply = await this.#waitForCc(
			CC_MSG.CONN_REQ,
			opts.timeoutMs ?? 60000,
		);
		const connReqBytes = reply.message.cc?.bodyBytes;
		if (!connReqBytes) throw new Error("PLANET conn_req missing body");
		const connReq = decodeCcConnReq(connReqBytes);
		const peerAnswerOffer = tryDecodeNativeSetupOffer(connReq.answer);
		const peerOffer = tryDecodeNativeSetupOffer(connReq.offer);
		const mediaReady = await this.#configureMedia(
			peerAnswerOffer ?? peerOffer,
			connReq,
		);
		this.#remoteCcChanId = reply.message.cc?.hdr?.srcChanId ??
			this.#remoteCcChanId;
		this.#remoteMediaChanId = connReq.mChanId ?? this.#remoteMediaChanId;
		let connRspSent = false;
		if (opts.autoConnRsp ?? true) {
			await this.#sendConnRsp(reply, connReq);
			await this.#sendExchangeAppStrDataInfoReq(reply, connReq);
			this.#autoConnRspDuplicates = true;
			connRspSent = true;
		}
		return {
			plaintext: reply.plaintext,
			message: reply.message,
			connReq,
			peerAnswerOffer,
			peerOffer,
			connRspSent,
			mediaReady,
		};
	}

	waitForAnswer(_opts?: { to: string }): Promise<PlanetAnswerResult> {
		return this.waitForAnswerDetailed();
	}

	async #configureMedia(
		peerOffer: NativeSetupOffer | undefined,
		connReq: CcConnReq,
	): Promise<boolean> {
		if (!peerOffer) return false;
		const local = this.#localMediaOffer;
		const route = this.#route;
		if (!local || !route) return false;
		this.#mediaKeyCandidates = [];
		if (
			peerOffer.mediaPubKey && peerOffer.mediaKeyId !== undefined &&
			peerOffer.mediaNonce
		) {
			const keyInput = {
				local: {
					privateKey: local.keypair.privateKey,
					publicKey: local.material.mediaPubKey,
					mediaKeyId: local.material.mediaKeyId,
					mediaNonce: local.material.mediaNonce,
				},
				peer: {
					publicKey: peerOffer.mediaPubKey,
					mediaKeyId: peerOffer.mediaKeyId,
					mediaNonce: peerOffer.mediaNonce,
				},
			};
			const variants = derivePlanetMediaKeyingVariants(keyInput);
			for (const selection of Object.values(MEDIA_KEY_SELECTIONS)) {
				const sendKeying = variants.variants[selection.send];
				const recvKeying = variants.variants[selection.recv];
				this.#mediaKeyCandidates.push({
					...selection,
					sendContext: await deriveSrtpContext(sendKeying),
					recvContext: await deriveSrtpContext(recvKeying),
				}, {
					mode: audioMediaKeyMode(selection.mode),
					send: `AUDIO/${selection.send}`,
					recv: `AUDIO/${selection.recv}`,
					sendContext: await deriveSrtpContext(
						derivePlanetMediaStreamKeying(sendKeying, "AUDIO"),
					),
					recvContext: await deriveSrtpContext(
						derivePlanetMediaStreamKeying(recvKeying, "AUDIO"),
					),
				});
			}
		}
		if (
			local.material.mediaSecret.length === 30 &&
			peerOffer.mediaSecret?.length === 30
		) {
			this.#mediaKeyCandidates.push(
				{
					mode: "secret-receiver",
					send: "peer-secret",
					recv: "local-secret",
					sendContext: await deriveSrtpContext(peerOffer.mediaSecret),
					recvContext: await deriveSrtpContext(local.material.mediaSecret),
				},
				{
					mode: "secret-sender",
					send: "local-secret",
					recv: "peer-secret",
					sendContext: await deriveSrtpContext(local.material.mediaSecret),
					recvContext: await deriveSrtpContext(peerOffer.mediaSecret),
				},
				{
					mode: "audio-secret-receiver",
					send: "AUDIO/peer-secret",
					recv: "AUDIO/local-secret",
					sendContext: await deriveSrtpContext(
						derivePlanetMediaStreamKeying(peerOffer.mediaSecret, "AUDIO"),
					),
					recvContext: await deriveSrtpContext(
						derivePlanetMediaStreamKeying(local.material.mediaSecret, "AUDIO"),
					),
				},
				{
					mode: "audio-secret-sender",
					send: "AUDIO/local-secret",
					recv: "AUDIO/peer-secret",
					sendContext: await deriveSrtpContext(
						derivePlanetMediaStreamKeying(local.material.mediaSecret, "AUDIO"),
					),
					recvContext: await deriveSrtpContext(
						derivePlanetMediaStreamKeying(peerOffer.mediaSecret, "AUDIO"),
					),
				},
			);
		}
		if (this.#mediaKeyCandidates.length === 0) return false;
		const requestedMode = this.#opts.mediaKeyMode ??
			(this.#groupJoined ? "audio-secret-sender" : "current");
		const initialMode = requestedMode === "auto" ? "current" : requestedMode;
		const initial = this.#mediaKeyCandidates.find((c) =>
			c.mode === initialMode
		);
		if (!initial) return false;
		this.#srtpSend = initial.sendContext;
		this.#srtpRecv = initial.recvContext;
		this.#groupDataSrtpSend = undefined;
		this.#groupDataRtp = undefined;
		this.#dataSrtpRecv = undefined;
		if (this.#groupJoined && local.material.mediaSecret.length === 30) {
			this.#groupDataSrtpSend = await deriveSrtpContext(
				derivePlanetMediaStreamKeying(local.material.mediaSecret, "DATA"),
			);
		}
		if (
			!this.#groupJoined &&
			local.material.mediaSecret.length === 30 &&
			peerOffer.mediaSecret?.length === 30
		) {
			this.#dataSrtpRecv = await deriveSrtpContext(
				derivePlanetMediaStreamKeying(peerOffer.mediaSecret, "DATA"),
			);
		}
		this.#mediaKeyMode = requestedMode;
		const fallbackHost = route.mediaHost ??
			(this.#opts.preferIpv6 && route.cscfHost6
				? route.cscfHost6
				: route.cscfHost);
		const fallbackPort = route.mediaPort ?? route.cscfPort;
		const mAddrEndpoint = addrEndpoint(connReq.mAddr);
		const publicEndpoint = addrEndpoint(connReq.uePublicAddr);
		const endpoint = mAddrEndpoint ?? publicEndpoint ??
			{ host: fallbackHost, port: fallbackPort };
		const endpointSource = mAddrEndpoint
			? "mAddr"
			: publicEndpoint
			? "uePublicAddr"
			: "route";
		const audio =
			peerOffer.media.find((m) =>
				m.name === "A" && m.enabled !== 0 && m.rtpId !== undefined
			) ?? peerOffer.media.find((m) =>
				m.kind === 1 && m.enabled !== 0 && m.rtpId !== undefined
			);
		if (this.#groupJoined) {
			this.#groupRtcpSsrc = GROUP_RTCP_SENDER_SSRC;
		}
		this.#rtp = {
			host: endpoint.host,
			port: endpoint.port,
			payloadType: audio?.rtpId ?? 96,
			ssrc: (this.#groupJoined ? this.#groupAudioSsrc : undefined) ??
				audio?.rtcpId ?? audio?.rtpPort ?? randomU32(),
			seq: randomIntInclusive(0, 0xffff),
			timestamp: 0,
		};
		if (this.#groupDataSrtpSend) {
			this.#groupDataRtp = {
				ssrc: this.#groupDataSsrc ?? addU32(this.#rtp.ssrc, 0x30),
				seq: 2,
				timestamp: randomIntInclusive(0x7000, 0x8000),
				index: 0,
			};
		}
		this.#debug({
			type: "media_configured",
			endpoint: endpointSource,
			family: endpoint.host.includes(":") ? "ipv6" : "ipv4",
			port: endpoint.port,
			payloadType: this.#rtp.payloadType,
			ssrc: this.#rtp.ssrc,
			rtcpSsrc: this.#groupRtcpSsrc,
			rtcpId: audio?.rtcpId,
			rtpPort: audio?.rtpPort,
			groupDataSsrc: this.#groupDataRtp?.ssrc,
			mediaKeyMode: requestedMode,
			activeMediaKeyMode: initial.mode,
		});
		return true;
	}

	async #sendConnRsp(
		request: PlanetIncomingMessage & {
			message: ReturnType<typeof decodePlanetMsg>;
		},
		connReq: CcConnReq,
	): Promise<void> {
		const ccBody = wrapCcMsg(
			CC_MSG.CONN_RSP,
			packCcConnRsp({
				result: 0,
				mChanId: this.#localMediaChanId,
				netType: connReq.netType ?? 1,
				unavailToSec: connReq.unavailToSec ?? 120,
				ua: packPlanetUserAgent(
					this.#opts.userAgent ??
						defaultAndroidUserAgent(this.#opts.deviceInfo),
				),
				svcId: connReq.svcId,
				tgtSvcId: connReq.tgtSvcId,
				interDomain: connReq.interDomain,
			}),
		);
		const ccMsg = packPlanetCcMsg(
			{
				cid: request.message.cc?.hdr?.cid ?? this.#callUuid ?? "conn-rsp",
				srcChanId: this.#srcChanId,
				dstChanId: request.message.cc?.hdr?.srcChanId ?? 0n,
			},
			ccBody,
		);
		await this.#sendEnvelope(
			{ kind: "cc", data: ccMsg },
			{ msgId: ccMsgId(CC_MSG.CONN_RSP) },
		);
	}

	async #sendExchangeAppStrDataInfoReq(
		request: PlanetIncomingMessage & {
			message: ReturnType<typeof decodePlanetMsg>;
		},
		connReq: CcConnReq,
	): Promise<void> {
		const targetMid = this.#targetMid;
		if (!targetMid) {
			this.#debug({ type: "info_req_skipped", reason: "missing_target" });
			return;
		}
		const body = new TextEncoder().encode('{"csv":1}\0');
		const ccBody = wrapCcMsg(
			CC_MSG.INFO_REQ,
			packCcInfoReq({
				bodyType: "exchange_app_str_data",
				body,
				targets: [],
				source: this.#opts.localMid,
				tgtUe: [packPlanetUeInfo({ userId: targetMid })],
				svcId: connReq.svcId,
				tgtSvcId: connReq.tgtSvcId,
				interDomain: connReq.interDomain,
			}),
		);
		const ccMsg = packPlanetCcMsg(
			{
				cid: request.message.cc?.hdr?.cid ?? this.#callUuid ?? "info-req",
				srcChanId: this.#srcChanId,
				dstChanId: request.message.cc?.hdr?.srcChanId ??
					this.#remoteCcChanId,
			},
			ccBody,
		);
		await this.#sendEnvelope(
			{ kind: "cc", data: ccMsg },
			{ msgId: ccMsgId(CC_MSG.INFO_REQ) },
		);
		this.#debug({ type: "info_req_exchange_app_str_data" });
	}

	async #sendMcDataRsp(
		request: PlanetIncomingMessage & {
			message: ReturnType<typeof decodePlanetMsg>;
		},
	): Promise<void> {
		const bodyBytes = request.message.mc?.bodyBytes;
		if (!bodyBytes) return;
		const dataReq = decodeMcDataReq(bodyBytes);
		const dataRsp = packMcDataRsp({
			result: 0,
			relCode: 0,
			dispatchId: dataReq.dispatchId,
			data: defaultOneToOneDataSessionPayload(),
		});
		const mcBody = wrapMcMsg(MC_MSG.DATA_RSP, dataRsp);
		const mcMsg = packPlanetMcMsg(
			{
				cid: request.message.mc?.hdr?.cid ?? this.#callUuid ?? "mc-data-rsp",
				srcChanId: this.#localMediaChanId,
				dstChanId: request.message.mc?.hdr?.srcChanId ??
					this.#remoteMediaChanId,
			},
			mcBody,
		);
		this.#debug({
			type: "mc_data_rsp_sent",
			bodyBytes: dataRsp.length,
			dispatchId: dataReq.dispatchId,
			dstChanIdBits:
				(request.message.mc?.hdr?.srcChanId ?? this.#remoteMediaChanId)
					.toString(2).length,
		});
		await this.#sendEnvelope(
			{ kind: "mc", data: mcMsg },
			{ msgId: CASSINI_MSG_ID_MC_DATA_RSP },
		);
	}

	async #sendMcJoinRsp(
		request: PlanetIncomingMessage & {
			message: ReturnType<typeof decodePlanetMsg>;
		},
	): Promise<void> {
		const rsp = packMcJoinRsp({
			result: 0,
			data: defaultOneToOneStrmSpec(),
		});
		const mcBody = wrapMcMsg(MC_MSG.JOIN_RSP, rsp);
		const mcMsg = packPlanetMcMsg(
			{
				cid: request.message.mc?.hdr?.cid ?? this.#callUuid ?? "mc-join-rsp",
				srcChanId: this.#localMediaChanId,
				dstChanId: request.message.mc?.hdr?.srcChanId ??
					this.#remoteMediaChanId,
			},
			mcBody,
		);
		this.#debug({ type: "mc_join_rsp_sent" });
		await this.#sendEnvelope(
			{ kind: "mc", data: mcMsg },
			{ msgId: CASSINI_MSG_ID_MC_JOIN_RSP },
		);
		void this.#sendBepiChannelOpen().catch(() => {});
		void this.#sendMcCheckRpt(request).catch(() => {});
	}

	async #sendMcChangeRsp(
		request: PlanetIncomingMessage & {
			message: ReturnType<typeof decodePlanetMsg>;
		},
	): Promise<void> {
		const rsp = packMcChangeRsp({
			result: 0,
			data: defaultOneToOneStrmSpec(),
		});
		const mcBody = wrapMcMsg(MC_MSG.CHANGE_RSP, rsp);
		const mcMsg = packPlanetMcMsg(
			{
				cid: request.message.mc?.hdr?.cid ?? this.#callUuid ?? "mc-change-rsp",
				srcChanId: this.#localMediaChanId,
				dstChanId: request.message.mc?.hdr?.srcChanId ??
					this.#remoteMediaChanId,
			},
			mcBody,
		);
		this.#debug({ type: "mc_change_rsp_sent" });
		await this.#sendEnvelope(
			{ kind: "mc", data: mcMsg },
			{ msgId: CASSINI_MSG_ID_MC_CHANGE_RSP },
		);
	}

	async #sendMcCheckRpt(
		request: PlanetIncomingMessage & {
			message: ReturnType<typeof decodePlanetMsg>;
		},
	): Promise<void> {
		const rpt = packMcCheckRpt(defaultOneToOneStrmSpec());
		const mcBody = wrapMcMsg(MC_MSG.CHECK_RPT, rpt);
		const mcMsg = packPlanetMcMsg(
			{
				cid: request.message.mc?.hdr?.cid ?? this.#callUuid ?? "mc-check-rpt",
				srcChanId: this.#localMediaChanId,
				dstChanId: request.message.mc?.hdr?.srcChanId ??
					this.#remoteMediaChanId,
			},
			mcBody,
		);
		this.#debug({ type: "mc_check_rpt_sent" });
		await this.#sendEnvelope(
			{ kind: "mc", data: mcMsg },
			{ msgId: CASSINI_MSG_ID_MC_CHECK_RPT },
		);
	}

	async #sendBepiChannelOpen(): Promise<void> {
		const token = BigInt(
			"0x" +
				Array.from(crypto.getRandomValues(new Uint8Array(8)))
					.map((b) => b.toString(16).padStart(2, "0"))
					.join(""),
		);
		const data = packBepiChannelOpen(token);
		this.#debug({ type: "bepi_channel_open_sent" });
		await this.#sendEnvelope(
			{ kind: "sc", data },
			{ msgId: CASSINI_MSG_ID_BEPI_OPEN },
		);
	}

	async #sendDuplicateConnRsp(
		request: PlanetIncomingMessage & {
			message: ReturnType<typeof decodePlanetMsg>;
		},
	): Promise<void> {
		if (!this.#autoConnRspDuplicates || this.#connRspDuplicateInFlight) {
			return;
		}
		const bodyBytes = request.message.cc?.bodyBytes;
		if (!bodyBytes) return;
		this.#connRspDuplicateInFlight = true;
		try {
			const connReq = decodeCcConnReq(bodyBytes);
			if (!this.#srtpSend || !this.#rtp) {
				const peerAnswerOffer = tryDecodeNativeSetupOffer(connReq.answer);
				const peerOffer = tryDecodeNativeSetupOffer(connReq.offer);
				await this.#configureMedia(peerAnswerOffer ?? peerOffer, connReq);
			}
			await this.#sendConnRsp(request, connReq);
			this.#debug({ type: "conn_rsp_duplicate" });
		} finally {
			this.#connRspDuplicateInFlight = false;
		}
	}

	async #sendInfoRsp(
		request: PlanetIncomingMessage & {
			message: ReturnType<typeof decodePlanetMsg>;
		},
	): Promise<void> {
		const bodyBytes = request.message.cc?.bodyBytes;
		if (!bodyBytes) return;
		let infoReq: ReturnType<typeof decodeCcInfoReq>;
		try {
			infoReq = decodeCcInfoReq(bodyBytes);
		} catch {
			return;
		}
		const ccBody = wrapCcMsg(
			CC_MSG.INFO_RSP,
			packCcInfoRsp({
				result: 0,
				bodyType: infoReq.bodyType,
				body: infoReq.body,
				svcId: infoReq.svcId,
				tgtSvcId: infoReq.tgtSvcId,
				interDomain: infoReq.interDomain,
			}),
		);
		const ccMsg = packPlanetCcMsg(
			{
				cid: request.message.cc?.hdr?.cid ?? this.#callUuid ?? "info-rsp",
				srcChanId: this.#srcChanId,
				dstChanId: request.message.cc?.hdr?.srcChanId ?? 0n,
			},
			ccBody,
		);
		await this.#sendEnvelope(
			{ kind: "cc", data: ccMsg },
			{ msgId: ccMsgId(CC_MSG.INFO_RSP) },
		);
	}

	#clearKeepalive() {
		if (this.#keepaliveTimer !== undefined) {
			clearTimeout(this.#keepaliveTimer);
			this.#keepaliveTimer = undefined;
		}
	}

	#startKeepalive(aliveRptIntervalSec: number | undefined) {
		this.#clearKeepalive();
		const configured = this.#opts.keepaliveIntervalMs;
		const intervalMs = configured ??
			(aliveRptIntervalSec && aliveRptIntervalSec > 0
				? aliveRptIntervalSec * 1000
				: undefined);
		if (!intervalMs || intervalMs <= 0) return;
		const delayMs = Math.max(10, Math.floor(intervalMs));
		const tick = () => {
			if (this.#closed) return;
			void this.#sendKeepalive().catch(() => {}).finally(() => {
				if (!this.#closed) this.#keepaliveTimer = setTimeout(tick, delayMs);
			});
		};
		this.#keepaliveTimer = setTimeout(tick, delayMs);
	}

	async #sendKeepalive(): Promise<void> {
		const inner = packKeepaliveReq(BigInt(Date.now()), false);
		await this.#sendEnvelope(
			{
				kind: "sc",
				data: packPlanetScMsgKaReq(inner),
			},
			{ msgId: CASSINI_MSG_ID_KEEPALIVE_REQ },
		);
	}

	async close(): Promise<void> {
		this.#closed = true;
		this.#clearKeepalive();
		try {
			if (
				this.#setupSent && this.#route && (this.#sock || this.#opts.wireSend)
			) {
				const relBody = this.#groupJoined
					? packCcRelReq({
						relCode: 1,
						releaser: "participant",
						commMediaFlags: 1,
						dataSvcs: [0],
						roomDestroy: false,
					})
					: packCcRelReq({
						relCode: 2,
						releaser: "initiator",
						commMediaFlags: 1,
					});
				const ccBody = wrapCcMsg(CC_MSG.REL_REQ, relBody);
				const ccMsg = packPlanetCcMsg(
					{
						cid: this.#callUuid ?? "rel",
						srcChanId: this.#srcChanId,
						dstChanId: this.#remoteCcChanId,
					},
					ccBody,
				);
				await this.#sendEnvelope(
					{ kind: "cc", data: ccMsg },
					{ msgId: CASSINI_MSG_ID_REL_REQ },
				);
			}
		} catch { /* */ }
		if (this.#sock) {
			await new Promise<void>((res) => this.#sock!.close(() => res()));
			this.#sock = undefined;
		}
		for (const waiter of this.#rtpWaiters.splice(0)) waiter(null);
	}

	async send(
		opusPacket: Uint8Array,
		opts: { timestampStep?: number } = {},
	): Promise<void> {
		if (!this.#srtpSend || !this.#rtp) {
			throw new Error("PlanetTransport.send: media not established");
		}
		const timestampStep = opts.timestampStep ??
			this.#opts.rtpTimestampStep ?? 960;
		const extensionData = this.#nextAudioRtpExtension();
		const timestamp = this.#nextAudioRtpTimestamp(timestampStep);
		const seq = this.#rtp.seq++ & 0xffff;
		const rtp = buildRtp({
			payloadType: this.#rtp.payloadType,
			marker: this.#groupJoined && this.#groupAudioExtensionIndex === 3,
			seq,
			timestamp,
			ssrc: this.#rtp.ssrc,
			payload: opusPacket,
			extensionProfile: 0x0240,
			extensionData,
		});
		const wire = await srtpEncrypt(this.#srtpSend, rtp);
		this.#debug({
			type: "media_send",
			bytes: wire.length,
			payloadBytes: opusPacket.length,
			payloadType: this.#rtp.payloadType,
			marker: (rtp[1] & 0x80) !== 0,
			ssrc: this.#rtp.ssrc,
			seq,
			rtpFirstByte: rtp[0],
			rtpExtensionBytes: extensionData?.length ?? 0,
			rtpExtensionIndex: this.#groupAudioExtensionIndex,
			timestamp,
			timestampStep,
			family: this.#rtp.host.includes(":") ? "ipv6" : "ipv4",
			port: this.#rtp.port,
		});
		if (this.#opts.wireSend) {
			await this.#opts.wireSend(wire, {
				host: this.#rtp.host,
				port: this.#rtp.port,
				bootstrap: false,
				seq: this.#rtp.seq,
				plainLen: opusPacket.length,
				bodyLen: wire.length,
				plaintext: opusPacket,
			});
			await this.#sendGroupDataRtpControl();
			await this.#sendGroupRtcpFeedback();
			return;
		}
		if (!this.#sock) throw new Error("PlanetTransport.send: socket closed");
		await new Promise<void>((res, rj) =>
			this.#sock!.send(
				Buffer.from(wire),
				this.#rtp!.port,
				this.#rtp!.host,
				(e) => (e ? rj(e) : res()),
			)
		);
		await this.#sendGroupDataRtpControl();
		await this.#sendGroupRtcpFeedback();
	}

	#nextAudioRtpTimestamp(timestampStep: number): number {
		if (
			this.#groupJoined && this.#rtp?.timestamp === 0 && timestampStep === 1920
		) {
			this.#rtp.timestamp = 960;
			return 960;
		}
		return (this.#rtp!.timestamp += timestampStep) >>> 0;
	}

	#nextAudioRtpExtension(): Uint8Array | undefined {
		if (!this.#groupJoined) return undefined;
		const extension = GROUP_AUDIO_RTP_EXTENSIONS[
			Math.min(
				this.#groupAudioExtensionIndex,
				GROUP_AUDIO_RTP_EXTENSIONS.length - 1,
			)
		] ?? GROUP_AUDIO_RTP_EXTENSION;
		this.#groupAudioExtensionIndex++;
		return extension;
	}

	async #sendGroupDataRtpControl(): Promise<void> {
		if (!this.#groupDataSrtpSend || !this.#groupDataRtp || !this.#rtp) {
			return;
		}
		if (this.#groupAudioExtensionIndex < 6) return;
		if (this.#groupDataRtp.index >= GROUP_DATA_RTP_PAYLOADS.length) return;
		const payload = GROUP_DATA_RTP_PAYLOADS[this.#groupDataRtp.index];
		const timestampStep =
			GROUP_DATA_RTP_TIMESTAMP_STEPS[this.#groupDataRtp.index] ?? 10;
		this.#groupDataRtp.index++;
		const rtp = buildRtp({
			payloadType: 101,
			marker: true,
			seq: this.#groupDataRtp.seq++ & 0xffff,
			timestamp: (this.#groupDataRtp.timestamp += timestampStep) >>> 0,
			ssrc: this.#groupDataRtp.ssrc,
			payload,
			extensionProfile: 0x0240,
		});
		const wire = await srtpEncrypt(this.#groupDataSrtpSend, rtp);
		this.#debug({
			type: "group_data_rtp_send",
			bytes: wire.length,
			payloadBytes: payload.length,
			payloadType: 101,
			ssrc: this.#groupDataRtp.ssrc,
			seq: (this.#groupDataRtp.seq - 1) & 0xffff,
			rtpFirstByte: rtp[0],
			rtpExtensionBytes: 0,
			timestampStep,
			port: this.#rtp.port,
		});
		if (this.#opts.wireSend) {
			await this.#opts.wireSend(wire, {
				host: this.#rtp.host,
				port: this.#rtp.port,
				bootstrap: false,
				seq: this.#groupDataRtp.seq,
				plainLen: payload.length,
				bodyLen: wire.length,
				plaintext: payload,
			});
			return;
		}
		if (!this.#sock) throw new Error("PlanetTransport.send: socket closed");
		await new Promise<void>((res, rj) =>
			this.#sock!.send(
				Buffer.from(wire),
				this.#rtp!.port,
				this.#rtp!.host,
				(e) => (e ? rj(e) : res()),
			)
		);
	}

	async #sendGroupRtcpFeedback(): Promise<void> {
		if (
			this.#groupRtcpSent || !this.#groupJoined || !this.#rtp ||
			!this.#groupRtcpSsrc || !this.#groupRxAudioSsrc ||
			!this.#groupRxDataSsrc
		) {
			return;
		}
		if (this.#groupAudioExtensionIndex < 8) return;
		this.#groupRtcpSent = true;
		const wire = buildGroupRtcpFeedback({
			senderSsrc: this.#groupRtcpSsrc,
			rxAudioSsrc: this.#groupRxAudioSsrc,
			rxDataSsrc: this.#groupRxDataSsrc,
		});
		this.#debug({
			type: "group_rtcp_feedback_send",
			bytes: wire.length,
			payloadType: wire[1] & 0x7f,
			senderSsrc: this.#groupRtcpSsrc,
			rxAudioSsrc: this.#groupRxAudioSsrc,
			rxDataSsrc: this.#groupRxDataSsrc,
			port: this.#rtp.port,
		});
		if (this.#opts.wireSend) {
			await this.#opts.wireSend(wire, {
				host: this.#rtp.host,
				port: this.#rtp.port,
				bootstrap: false,
				seq: 0,
				plainLen: wire.length,
				bodyLen: wire.length,
				plaintext: wire,
			});
			return;
		}
		if (!this.#sock) throw new Error("PlanetTransport.send: socket closed");
		await new Promise<void>((res, rj) =>
			this.#sock!.send(
				Buffer.from(wire),
				this.#rtp!.port,
				this.#rtp!.host,
				(e) => (e ? rj(e) : res()),
			)
		);
	}

	async *receive(): AsyncIterable<Uint8Array> {
		if (!this.#srtpRecv) {
			throw new Error("PlanetTransport.receive: media not established");
		}
		while (true) {
			const wire = await this.#takeRtp();
			if (!wire) return;
			try {
				const decrypted = await this.#decryptMediaRtp(wire);
				const parsed = parseRtp(decrypted.rtp);
				this.#debug({
					type: "media_recv",
					bytes: wire.length,
					payloadBytes: parsed.payload.length,
					payloadType: parsed.payloadType,
					ssrc: parsed.ssrc,
					mediaKeyMode: decrypted.mode,
					mediaKeySwitched: decrypted.switched,
				});
				yield parsed.payload;
			} catch (e) {
				this.#debug({
					type: "media_decrypt_fail",
					bytes: wire.length,
					rtpPayloadType: wire.length > 1 ? wire[1] & 0x7f : undefined,
					rtpSecondByte: wire.length > 1 ? wire[1] : undefined,
					reason: e instanceof Error ? e.message : String(e),
				});
				// Drop unauthenticated media.
			}
		}
	}
}
