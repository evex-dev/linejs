/**
 * Cassini / PLANET protobuf schema.
 *
 * Reverse-engineered from libandromeda's protobuf-c descriptor objects
 * in .data.rel.ro. Every field tag/type/offset here is byte-verified
 * against the live `pln_msg_pack` hook capture.
 *
 * Layered wire format (outermost to innermost):
 *
 *   planet_msg              { hdr + oneof(sc_msg / cc_msg / mc_msg) }
 *     planet_msg_hdr        7-field call session header
 *
 *     planet_cc_msg         { hdr + body }            (when cc_msg field set)
 *       planet_cc_hdr       { cid, src_chan_id, dst_chan_id }
 *       cc_msg              oneof of 63 cc message types
 *         cc_setup_req      32-field call SETUP
 *         cc_setup_rsp      …
 *         cc_verify_req     …
 *         cc_rel_req        …
 *         (and so on)
 */

import { Buffer } from "node:buffer";

// ─── varint + wire-type encoding ────────────────────────────────────────

export const enum WireType {
	Varint = 0,
	Fixed64 = 1,
	LengthDelim = 2,
	Fixed32 = 5,
}

export function encodeVarint(v: bigint | number): Uint8Array {
	let x = typeof v === "bigint" ? v : BigInt(v);
	const out: number[] = [];
	while (x > 0x7fn) {
		out.push(Number((x & 0x7fn) | 0x80n));
		x >>= 7n;
	}
	out.push(Number(x));
	return new Uint8Array(out);
}

export function decodeVarint(buf: Uint8Array, off: number): [bigint, number] {
	let v = 0n, shift = 0n, i = off;
	while (i < buf.length) {
		const b = BigInt(buf[i]);
		v |= (b & 0x7fn) << shift;
		shift += 7n;
		i++;
		if ((b & 0x80n) === 0n) break;
	}
	return [v, i - off];
}

function fixed64(v: bigint): Uint8Array {
	const o = new Uint8Array(8);
	let x = v < 0n ? v + (1n << 64n) : v;
	for (let i = 0; i < 8; i++) {
		o[i] = Number(x & 0xffn);
		x >>= 8n;
	}
	return o;
}
function readFixed64(buf: Uint8Array, off: number): bigint {
	let v = 0n;
	for (let i = 7; i >= 0; i--) v = (v << 8n) | BigInt(buf[off + i]);
	return v;
}
function fixed32(v: number): Uint8Array {
	const o = new Uint8Array(4);
	o[0] = v & 0xff;
	o[1] = (v >>> 8) & 0xff;
	o[2] = (v >>> 16) & 0xff;
	o[3] = (v >>> 24) & 0xff;
	return o;
}

// ─── encoder primitive: emit (tag, value) → wire bytes ──────────────────

interface Buf {
	bytes: number[];
}
function _emit(b: Buf, ...parts: ArrayLike<number>[]) {
	for (const p of parts) for (let i = 0; i < p.length; i++) b.bytes.push(p[i]);
}
function _key(b: Buf, tag: number, wt: WireType) {
	_emit(b, encodeVarint((tag << 3) | wt));
}

function emitString(b: Buf, tag: number, v: string) {
	const enc = new TextEncoder().encode(v);
	_key(b, tag, WireType.LengthDelim);
	_emit(b, encodeVarint(enc.length), enc);
}
function emitBytes(b: Buf, tag: number, v: Uint8Array) {
	_key(b, tag, WireType.LengthDelim);
	_emit(b, encodeVarint(v.length), v);
}
function emitUint32(b: Buf, tag: number, v: number) {
	_key(b, tag, WireType.Varint);
	_emit(b, encodeVarint(v));
}
function emitUint64(b: Buf, tag: number, v: bigint) {
	_key(b, tag, WireType.Varint);
	_emit(b, encodeVarint(v));
}
function emitSfixed64(b: Buf, tag: number, v: bigint) {
	_key(b, tag, WireType.Fixed64);
	_emit(b, fixed64(v));
}
function emitBool(b: Buf, tag: number, v: boolean) {
	_key(b, tag, WireType.Varint);
	b.bytes.push(v ? 1 : 0);
}
function emitEnum(b: Buf, tag: number, v: number) {
	_key(b, tag, WireType.Varint);
	_emit(b, encodeVarint(v));
}
function emitBoolAsVarint(b: Buf, tag: number, v: boolean) {
	emitUint32(b, tag, v ? 1 : 0);
}
function emitMessage(b: Buf, tag: number, v: Uint8Array) {
	_key(b, tag, WireType.LengthDelim);
	_emit(b, encodeVarint(v.length), v);
}
function finalize(b: Buf): Uint8Array {
	return new Uint8Array(b.bytes);
}

// ─── planet_msg_hdr ─────────────────────────────────────────────────────

export interface PlanetMsgHdr {
	userId: string;
	msgId: number;
	sessId: Uint8Array; // 16-byte session id (constant per call)
	tranId: Uint8Array; // 16-byte per-message random
	tranSeq: number;
	locNonce: bigint; // local random u64
	rmtNonce: bigint; // server-issued u64
}

export function packPlanetMsgHdr(h: PlanetMsgHdr): Uint8Array {
	const b: Buf = { bytes: [] };
	emitString(b, 1, h.userId);
	emitUint32(b, 2, h.msgId);
	if (h.sessId.length > 0) emitBytes(b, 3, h.sessId);
	emitBytes(b, 4, h.tranId);
	emitUint32(b, 5, h.tranSeq);
	emitUint64(b, 6, h.locNonce);
	if (h.rmtNonce !== 0n) emitUint64(b, 7, h.rmtNonce);
	return finalize(b);
}

// ─── planet_cc_hdr ──────────────────────────────────────────────────────

export interface PlanetCcHdr {
	cid: string;
	srcChanId: bigint;
	dstChanId: bigint;
}

export function packPlanetCcHdr(h: PlanetCcHdr): Uint8Array {
	const b: Buf = { bytes: [] };
	emitString(b, 1, h.cid);
	emitUint64(b, 2, h.srcChanId);
	if (h.dstChanId !== 0n) emitUint64(b, 3, h.dstChanId);
	return finalize(b);
}

// ─── planet_user_agent / feature records ───────────────────────────────

export interface PlanetUserAgent {
	osName: string;
	osVersion: string;
	deviceName: string;
	mccMnc?: string;
	appVersion?: string;
	engineVersion?: string;
	appReleaseInfo?: string;
	manufacturer?: string;
	kitWrapperVersion?: string;
}

export function packPlanetUserAgent(ua: PlanetUserAgent): Uint8Array {
	const b: Buf = { bytes: [] };
	emitString(b, 1, ua.osName);
	emitString(b, 2, ua.osVersion);
	emitString(b, 3, ua.deviceName);
	if (ua.mccMnc !== undefined) emitString(b, 4, ua.mccMnc);
	if (ua.appVersion !== undefined) emitString(b, 5, ua.appVersion);
	if (ua.engineVersion !== undefined) emitString(b, 6, ua.engineVersion);
	if (ua.appReleaseInfo !== undefined) emitString(b, 7, ua.appReleaseInfo);
	if (ua.manufacturer !== undefined) emitString(b, 8, ua.manufacturer);
	if (ua.kitWrapperVersion !== undefined) {
		emitString(b, 9, ua.kitWrapperVersion);
	}
	return finalize(b);
}

export function packPlanetFeatureRegister(
	feature: number,
	enabled: boolean,
	state = 0,
): Uint8Array {
	const b: Buf = { bytes: [] };
	emitUint32(b, 1, feature);
	emitBoolAsVarint(b, 2, enabled);
	emitUint32(b, 3, state);
	return finalize(b);
}

// ─── SETUP media offer ─────────────────────────────────────────────────

export interface PlanetSetupOfferMaterial {
	/** 33-byte compressed P-256 public key used by the media key offer. */
	mediaPubKey: Uint8Array;
	/** 32-bit random/session identifier observed in the media key offer. */
	mediaKeyId: number;
	/** 16-byte random nonce in the first security offer. */
	mediaNonce: Uint8Array;
	/** 30-byte random secret/blob in the second security offer. */
	mediaSecret: Uint8Array;
}

function packPortPair(primary: number, secondary: number): Uint8Array {
	const b: Buf = { bytes: [] };
	emitUint32(b, 1, primary);
	emitUint32(b, 2, secondary);
	return finalize(b);
}

function packOfferPath(
	rtpId: number,
	rtpPort: number,
	rtcpId: number,
): Uint8Array {
	const b: Buf = { bytes: [] };
	emitUint32(b, 1, rtpId);
	emitUint32(b, 11, rtpPort);
	emitMessage(b, 12, packPortPair(67, 6801));
	emitUint32(b, 61, rtcpId);
	emitMessage(b, 62, packPortPair(67, 13601));
	return finalize(b);
}

function packOfferCodec(
	name: "A" | "V" | "D",
	opts: {
		enabled: number;
		bitrate: number;
		fps?: number;
		profile?: number;
		kind: number;
	},
): Uint8Array {
	const b: Buf = { bytes: [] };
	emitBytes(b, 1, new TextEncoder().encode(name));
	emitUint32(b, 2, 3);
	emitUint32(b, 3, opts.enabled);
	emitUint32(b, 4, opts.bitrate);
	if (opts.fps !== undefined) emitUint32(b, 5, opts.fps);
	if (opts.profile !== undefined) emitUint32(b, 6, opts.profile);
	emitUint32(b, 50, opts.kind);
	return finalize(b);
}

function packAudioVideoOffer(
	name: "A" | "V",
	codec: Uint8Array,
	path: Uint8Array,
	rtpPort: number,
	rtcpId: number,
): Uint8Array {
	const nested: Buf = { bytes: [] };
	emitUint32(nested, 1, 127);
	emitMessage(nested, 2, path);
	emitUint32(nested, 11, rtpPort);
	emitUint32(nested, 61, rtcpId);

	const b: Buf = { bytes: [] };
	emitMessage(b, 1, codec);
	emitMessage(b, 2, path);
	emitMessage(b, 3, finalize(nested));
	return finalize(b);
}

function packDataOffer(codec: Uint8Array, path: Uint8Array): Uint8Array {
	const dataMode: Buf = { bytes: [] };
	emitUint32(dataMode, 1, 0);
	emitUint32(dataMode, 2, 2);

	const b: Buf = { bytes: [] };
	emitMessage(b, 1, codec);
	emitMessage(b, 2, path);
	emitMessage(b, 51, finalize(dataMode));
	return finalize(b);
}

/** Pack the native 1:1 SETUP offer shape observed in LINE Android 26.6.2.
 *
 * The offer is carried as `cc_setup_req.offer` and is not the string
 * `"AUDIO"`. It advertises audio, video, and data channels plus two security
 * blobs. Dynamic cryptographic material is supplied by the caller so tests can
 * be deterministic.
 */
export function packNativeSetupOffer(
	material: PlanetSetupOfferMaterial,
): Uint8Array {
	if (material.mediaPubKey.length !== 33) {
		throw new Error("packNativeSetupOffer: mediaPubKey must be 33 bytes");
	}
	if (material.mediaNonce.length !== 16) {
		throw new Error("packNativeSetupOffer: mediaNonce must be 16 bytes");
	}
	if (material.mediaSecret.length !== 30) {
		throw new Error("packNativeSetupOffer: mediaSecret must be 30 bytes");
	}
	const audioPath = packOfferPath(96, 101, 201);
	const videoPath = packOfferPath(97, 111, 211);
	const dataPath = packOfferPath(98, 121, 221);
	const audio = packAudioVideoOffer(
		"A",
		packOfferCodec("A", { enabled: 1, bitrate: 32, kind: 1 }),
		audioPath,
		101,
		201,
	);
	const video = packAudioVideoOffer(
		"V",
		packOfferCodec("V", {
			enabled: 0,
			bitrate: 800,
			fps: 24,
			profile: 2,
			kind: 2,
		}),
		videoPath,
		111,
		211,
	);
	const data = packDataOffer(
		packOfferCodec("D", { enabled: 1, bitrate: 2000, kind: 6 }),
		dataPath,
	);

	const secAInner: Buf = { bytes: [] };
	emitBytes(secAInner, 1, material.mediaPubKey);
	emitUint32(secAInner, 2, material.mediaKeyId >>> 0);
	emitBytes(secAInner, 3, material.mediaNonce);
	const secA: Buf = { bytes: [] };
	emitMessage(secA, 3, finalize(secAInner));

	const secBInner: Buf = { bytes: [] };
	emitBytes(secBInner, 1, material.mediaSecret);
	const secB: Buf = { bytes: [] };
	emitMessage(secB, 2, finalize(secBInner));

	const version: Buf = { bytes: [] };
	emitUint32(version, 1, 0);
	emitUint32(version, 2, 3);

	const out: Buf = { bytes: [] };
	emitMessage(out, 1, audio);
	emitMessage(out, 1, video);
	emitMessage(out, 1, data);
	emitMessage(out, 2, finalize(secA));
	emitMessage(out, 2, finalize(secB));
	emitMessage(out, 3, finalize(version));
	return finalize(out);
}

// ─── cc_msg oneof identifiers ───────────────────────────────────────────

export const CC_MSG = {
	SETUP_REQ: 1,
	SETUP_RSP: 2,
	VERIFY_REQ: 3,
	VERIFY_RSP: 4,
	CONN_REQ: 5,
	CONN_RSP: 6,
	REL_REQ: 7,
	REL_RSP: 8,
	HO_REQ: 9,
	HO_RSP: 10,
	SO_REQ: 11,
	SO_RSP: 12,
	MCP_REQ: 13,
	MCP_RSP: 14,
	UPD_REQ: 15,
	UPD_RSP: 16,
	INFO_REQ: 17,
	INFO_RSP: 18,
	CPG_RPT: 19,
	REL_RPT: 20,
	CREL_RPT: 21,
	ALIVE_RPT: 22,
	SO_RPT: 23,
	SOMSD_RPT: 24,
	UNAVAIL_REQ: 25,
	UNAVAIL_RSP: 26,
	BIG_DATA_REQ: 27,
	BIG_DATA_RSP: 28,
	UNAVAIL_RPT: 29,
	PARTICIPATE_REQ: 51,
	PARTICIPATE_RSP: 52,
	PULL_REQ: 53,
	PULL_RSP: 54,
	PUSH_REQ: 55,
	PUSH_RSP: 56,
	CONRX_REQ: 57,
	CONRX_RSP: 58,
	CSO_REQ: 59,
	CSO_RSP: 60,
	MSCHG_REQ: 61,
	MSCHG_RSP: 62,
	DTASS_REQ: 63,
	DTASS_RSP: 64,
	SUBSCRIBE_REQ: 65,
	SUBSCRIBE_RSP: 66,
	SUBPUSH_REQ: 67,
	SUBPUSH_RSP: 68,
	CTUNNEL_REQ: 69,
	CTUNNEL_RSP: 70,
	CRTE_MIX_REQ: 71,
	CRTE_MIX_RSP: 72,
	CTRL_MIX_REQ: 73,
	CTRL_MIX_RSP: 74,
	NOTIFY_MIX_REQ: 75,
	NOTIFY_MIX_RSP: 76,
	SUBALIVE_REQ: 77,
	SUBALIVE_RSP: 78,
	SET_SPEAKER_REQ: 79,
	SET_SPEAKER_RSP: 80,
	CLOC_REQ: 81,
	CLOC_RSP: 82,
	USER_STATUS_REQ: 83,
	USER_STATUS_RSP: 84,
} as const;

export const CC_MSG_NAMES: Record<number, string> = {
	[CC_MSG.SETUP_REQ]: "setup_req",
	[CC_MSG.SETUP_RSP]: "setup_rsp",
	[CC_MSG.VERIFY_REQ]: "verify_req",
	[CC_MSG.VERIFY_RSP]: "verify_rsp",
	[CC_MSG.CONN_REQ]: "conn_req",
	[CC_MSG.CONN_RSP]: "conn_rsp",
	[CC_MSG.REL_REQ]: "rel_req",
	[CC_MSG.REL_RSP]: "rel_rsp",
	[CC_MSG.HO_REQ]: "ho_req",
	[CC_MSG.HO_RSP]: "ho_rsp",
	[CC_MSG.SO_REQ]: "so_req",
	[CC_MSG.SO_RSP]: "so_rsp",
	[CC_MSG.MCP_REQ]: "mcp_req",
	[CC_MSG.MCP_RSP]: "mcp_rsp",
	[CC_MSG.UPD_REQ]: "upd_req",
	[CC_MSG.UPD_RSP]: "upd_rsp",
	[CC_MSG.UNAVAIL_REQ]: "unavail_req",
	[CC_MSG.UNAVAIL_RSP]: "unavail_rsp",
	[CC_MSG.INFO_REQ]: "info_req",
	[CC_MSG.INFO_RSP]: "info_rsp",
	[CC_MSG.CONRX_REQ]: "conrx_req",
	[CC_MSG.CONRX_RSP]: "conrx_rsp",
	[CC_MSG.CPG_RPT]: "cpg_rpt",
	[CC_MSG.REL_RPT]: "rel_rpt",
	[CC_MSG.CREL_RPT]: "crel_rpt",
	[CC_MSG.ALIVE_RPT]: "alive_rpt",
	[CC_MSG.SO_RPT]: "so_rpt",
	[CC_MSG.SOMSD_RPT]: "somsd_rpt",
	[CC_MSG.BIG_DATA_REQ]: "big_data_req",
	[CC_MSG.BIG_DATA_RSP]: "big_data_rsp",
	[CC_MSG.UNAVAIL_RPT]: "unavail_rpt",
	[CC_MSG.PARTICIPATE_REQ]: "participate_req",
	[CC_MSG.PARTICIPATE_RSP]: "participate_rsp",
	[CC_MSG.PULL_REQ]: "pull_req",
	[CC_MSG.PULL_RSP]: "pull_rsp",
	[CC_MSG.PUSH_REQ]: "push_req",
	[CC_MSG.PUSH_RSP]: "push_rsp",
	[CC_MSG.CSO_REQ]: "cso_req",
	[CC_MSG.CSO_RSP]: "cso_rsp",
	[CC_MSG.MSCHG_REQ]: "mschg_req",
	[CC_MSG.MSCHG_RSP]: "mschg_rsp",
	[CC_MSG.DTASS_REQ]: "dtass_req",
	[CC_MSG.DTASS_RSP]: "dtass_rsp",
	[CC_MSG.SUBSCRIBE_REQ]: "subscribe_req",
	[CC_MSG.SUBSCRIBE_RSP]: "subscribe_rsp",
	[CC_MSG.SUBPUSH_REQ]: "subpush_req",
	[CC_MSG.SUBPUSH_RSP]: "subpush_rsp",
	[CC_MSG.CTUNNEL_REQ]: "ctunnel_req",
	[CC_MSG.CTUNNEL_RSP]: "ctunnel_rsp",
	[CC_MSG.CRTE_MIX_REQ]: "crte_mix_req",
	[CC_MSG.CRTE_MIX_RSP]: "crte_mix_rsp",
	[CC_MSG.CTRL_MIX_REQ]: "ctrl_mix_req",
	[CC_MSG.CTRL_MIX_RSP]: "ctrl_mix_rsp",
	[CC_MSG.NOTIFY_MIX_REQ]: "notify_mix_req",
	[CC_MSG.NOTIFY_MIX_RSP]: "notify_mix_rsp",
	[CC_MSG.SUBALIVE_REQ]: "subalive_req",
	[CC_MSG.SUBALIVE_RSP]: "subalive_rsp",
	[CC_MSG.SET_SPEAKER_REQ]: "set_speaker_req",
	[CC_MSG.SET_SPEAKER_RSP]: "set_speaker_rsp",
	[CC_MSG.CLOC_REQ]: "cloc_req",
	[CC_MSG.CLOC_RSP]: "cloc_rsp",
	[CC_MSG.USER_STATUS_REQ]: "user_status_req",
	[CC_MSG.USER_STATUS_RSP]: "user_status_rsp",
};

// ─── cc_setup_req — the most important payload ──────────────────────────

export interface CcSetupReq {
	initiator: string; // tag 1
	responder: string; // tag 2
	iZone?: string; // tag 3 — e.g. "jpdc"
	rZone?: string; // tag 4
	ua?: Uint8Array; // tag 5 — packed PlanetUserAgent
	devId?: string; // tag 6
	commTypeFlags?: number; // tag 7 — enum
	capas?: number[]; // tag 8 — repeated enum
	offer?: Uint8Array; // tag 9 — bytes (media offer)
	credential?: Uint8Array; // tag 10 — SHA-256 auth digest
	fakeCall?: boolean; // tag 11
	svcKey?: string; // tag 12 — OUR PUBKEY (base64 or hex)
	crt?: boolean; // tag 13
	netType?: number; // tag 14 — enum
	stid?: string; // tag 21
	ccp?: string; // tag 22
	ueData?: Uint8Array; // tag 23
	ueDataCompType?: number; // tag 24
	features?: Uint8Array[]; // tag 25 — repeated packed PlanetFeatRegister
	svcId?: string; // tag 51
	tgtSvcId?: string; // tag 52
	reqRec?: boolean; // tag 53
	appSvrDataId?: string; // tag 54
	uePublicAddr?: Uint8Array; // tag 101
	iVisitedZone?: string; // tag 102
	rToken?: string; // tag 103
	iMercuryIp?: string; // tag 104
	pathCheck?: boolean; // tag 105
	iMercuryIpv6?: string; // tag 106
	rGcallZone?: string; // tag 107
	interDomain?: boolean; // tag 151
	appSvrData?: string; // tag 152
}

export function packCcSetupReq(r: CcSetupReq): Uint8Array {
	const b: Buf = { bytes: [] };
	emitString(b, 1, r.initiator);
	emitString(b, 2, r.responder);
	if (r.iZone !== undefined) emitString(b, 3, r.iZone);
	if (r.rZone !== undefined) emitString(b, 4, r.rZone);
	if (r.ua) emitMessage(b, 5, r.ua);
	if (r.devId !== undefined) emitString(b, 6, r.devId);
	if (r.commTypeFlags !== undefined) emitEnum(b, 7, r.commTypeFlags);
	if (r.capas) { for (const c of r.capas) emitEnum(b, 8, c); }
	if (r.offer) emitBytes(b, 9, r.offer);
	if (r.credential) emitBytes(b, 10, r.credential);
	if (r.fakeCall !== undefined) emitBool(b, 11, r.fakeCall);
	if (r.svcKey !== undefined) emitString(b, 12, r.svcKey);
	if (r.crt !== undefined) emitBool(b, 13, r.crt);
	if (r.netType !== undefined) emitEnum(b, 14, r.netType);
	if (r.stid !== undefined) emitString(b, 21, r.stid);
	if (r.ccp !== undefined) emitString(b, 22, r.ccp);
	if (r.ueData) emitBytes(b, 23, r.ueData);
	if (r.ueDataCompType !== undefined) emitEnum(b, 24, r.ueDataCompType);
	if (r.features) { for (const f of r.features) emitMessage(b, 25, f); }
	if (r.svcId !== undefined) emitString(b, 51, r.svcId);
	if (r.tgtSvcId !== undefined) emitString(b, 52, r.tgtSvcId);
	if (r.reqRec !== undefined) emitBool(b, 53, r.reqRec);
	if (r.appSvrDataId !== undefined) emitString(b, 54, r.appSvrDataId);
	if (r.uePublicAddr) emitMessage(b, 101, r.uePublicAddr);
	if (r.iVisitedZone !== undefined) emitString(b, 102, r.iVisitedZone);
	if (r.rToken !== undefined) emitString(b, 103, r.rToken);
	if (r.iMercuryIp !== undefined) emitString(b, 104, r.iMercuryIp);
	if (r.pathCheck !== undefined) emitBool(b, 105, r.pathCheck);
	if (r.iMercuryIpv6 !== undefined) emitString(b, 106, r.iMercuryIpv6);
	if (r.rGcallZone !== undefined) emitString(b, 107, r.rGcallZone);
	if (r.interDomain !== undefined) emitBool(b, 151, r.interDomain);
	if (r.appSvrData !== undefined) emitString(b, 152, r.appSvrData);
	return finalize(b);
}

// ─── cc_rel_req — call release / hangup ─────────────────────────────────

export interface CcRelReq {
	relCode?: number; // tag 1
	relPhrase?: string; // tag 2
	releaser?: string; // tag 3 — native uses "initiator" for local hangup
	commMediaFlags?: number; // tag 4 — planet_comm_type enum
	userRelCode?: string; // tag 5
	dataSvcs?: number[]; // tag 6 — repeated planet_data_svc_type enum
	lastKaTs?: bigint; // tag 7 — sfixed64
	roomDestroy?: boolean; // tag 51
	devId?: string; // tag 101
}

export function packCcRelReq(r: CcRelReq): Uint8Array {
	const b: Buf = { bytes: [] };
	if (r.relCode !== undefined) emitUint32(b, 1, r.relCode);
	if (r.relPhrase !== undefined) emitString(b, 2, r.relPhrase);
	if (r.releaser !== undefined) emitString(b, 3, r.releaser);
	if (r.commMediaFlags !== undefined) emitEnum(b, 4, r.commMediaFlags);
	if (r.userRelCode !== undefined) emitString(b, 5, r.userRelCode);
	if (r.dataSvcs) { for (const svc of r.dataSvcs) emitEnum(b, 6, svc); }
	if (r.lastKaTs !== undefined) emitSfixed64(b, 7, r.lastKaTs);
	if (r.roomDestroy !== undefined) emitBool(b, 51, r.roomDestroy);
	if (r.devId !== undefined) emitString(b, 101, r.devId);
	return finalize(b);
}

// ─── cc_msg oneof wrapper ───────────────────────────────────────────────

export function wrapCcMsg(
	oneofTag: number,
	packedInner: Uint8Array,
): Uint8Array {
	const b: Buf = { bytes: [] };
	emitMessage(b, oneofTag, packedInner);
	return finalize(b);
}

// ─── planet_cc_msg ──────────────────────────────────────────────────────

export function packPlanetCcMsg(
	hdr: PlanetCcHdr,
	body: Uint8Array,
): Uint8Array {
	const b: Buf = { bytes: [] };
	emitMessage(b, 1, packPlanetCcHdr(hdr));
	emitMessage(b, 2, body);
	return finalize(b);
}

// ─── planet_msg outer envelope ──────────────────────────────────────────

export type PlanetMsgBody =
	| { kind: "sc"; data: Uint8Array }
	| { kind: "cc"; data: Uint8Array }
	| { kind: "mc"; data: Uint8Array };

export function packPlanetMsg(
	hdr: PlanetMsgHdr,
	body: PlanetMsgBody,
): Uint8Array {
	const b: Buf = { bytes: [] };
	emitMessage(b, 1, packPlanetMsgHdr(hdr));
	if (body.kind === "sc") emitMessage(b, 2, body.data);
	else if (body.kind === "cc") emitBytes(b, 3, body.data);
	else emitBytes(b, 4, body.data);
	return finalize(b);
}

// ─── planet_sc_msg (keepalive / tap) ────────────────────────────────────

export function packKeepaliveReq(ts: bigint, isP2p = false): Uint8Array {
	const b: Buf = { bytes: [] };
	emitSfixed64(b, 1, ts);
	// Native LINE emits this optional bool even when false. Keeping it
	// byte-for-byte matters because these packets are used as capture
	// fixtures while rebuilding the PLANET state machine.
	emitBool(b, 2, isP2p);
	return finalize(b);
}

export function packPlanetScMsgKaReq(inner: Uint8Array): Uint8Array {
	const b: Buf = { bytes: [] };
	emitMessage(b, 1, inner);
	return finalize(b);
}

// ─── handshake helper — extract rmt_nonce from incoming msg ─────────────

/** Extract the loc_nonce (field 6) from a decrypted incoming planet_msg.
 *  This value MUST be used as `rmt_nonce` on all subsequent outgoing msgs
 *  in the same session (echoed back to cscf so it can verify continuity).
 *
 *  Reverse-engineered from libandromeda 0xcaa4f0..0xcaa524:
 *    bl pln_msg_get_local_nonce  // sp+0x10 = msg.loc_nonce (field 6)
 *    str x8, [sess, #0xa0]       // session.rmt_nonce = that value
 */
export function extractRmtNonceFromReply(replyHdrBytes: Uint8Array): bigint {
	const fields = decodeFields(replyHdrBytes);
	for (const f of fields) {
		if (f.tag === 6 /* loc_nonce */ && f.wireType === WireType.Varint) {
			return f.value as bigint;
		}
	}
	throw new Error("extractRmtNonceFromReply: no loc_nonce in reply header");
}

// ─── decoding (read-only side) ──────────────────────────────────────────

export interface DecodedField {
	tag: number;
	wireType: WireType;
	value: bigint | Uint8Array;
}

export function decodeFields(buf: Uint8Array): DecodedField[] {
	const out: DecodedField[] = [];
	let i = 0;
	while (i < buf.length) {
		const [k, kl] = decodeVarint(buf, i);
		i += kl;
		const tag = Number(k >> 3n);
		const wt = Number(k & 7n) as WireType;
		if (wt === WireType.Varint) {
			const [v, vl] = decodeVarint(buf, i);
			i += vl;
			out.push({ tag, wireType: wt, value: v });
		} else if (wt === WireType.LengthDelim) {
			const [len, ll] = decodeVarint(buf, i);
			i += ll;
			out.push({ tag, wireType: wt, value: buf.subarray(i, i + Number(len)) });
			i += Number(len);
		} else if (wt === WireType.Fixed64) {
			out.push({ tag, wireType: wt, value: readFixed64(buf, i) });
			i += 8;
		} else if (wt === WireType.Fixed32) {
			out.push({ tag, wireType: wt, value: buf.subarray(i, i + 4) });
			i += 4;
		} else throw new Error(`decodeFields: unknown wire type ${wt}`);
	}
	return out;
}

function field(fields: DecodedField[], tag: number): DecodedField | undefined {
	return fields.find((f) => f.tag === tag);
}

function fieldsFor(fields: DecodedField[], tag: number): DecodedField[] {
	return fields.filter((f) => f.tag === tag);
}

function asBytesField(
	fields: DecodedField[],
	tag: number,
): Uint8Array | undefined {
	const f = field(fields, tag);
	return f?.value instanceof Uint8Array ? f.value : undefined;
}

function asStringField(
	fields: DecodedField[],
	tag: number,
): string | undefined {
	const b = asBytesField(fields, tag);
	return b ? new TextDecoder().decode(b) : undefined;
}

function asNumberField(
	fields: DecodedField[],
	tag: number,
): number | undefined {
	const v = field(fields, tag)?.value;
	return typeof v === "bigint" ? Number(v) : undefined;
}

function asBigintField(
	fields: DecodedField[],
	tag: number,
): bigint | undefined {
	const v = field(fields, tag)?.value;
	return typeof v === "bigint" ? v : undefined;
}

function asBoolField(
	fields: DecodedField[],
	tag: number,
): boolean | undefined {
	const v = asBigintField(fields, tag);
	return v === undefined ? undefined : v !== 0n;
}

function repeatedNumbers(fields: DecodedField[], tag: number): number[] {
	return fieldsFor(fields, tag)
		.map((f) => typeof f.value === "bigint" ? Number(f.value) : undefined)
		.filter((v): v is number => v !== undefined);
}

function repeatedBytes(fields: DecodedField[], tag: number): Uint8Array[] {
	return fieldsFor(fields, tag)
		.map((f) => f.value instanceof Uint8Array ? f.value : undefined)
		.filter((v): v is Uint8Array => v !== undefined);
}

export interface DecodedPlanetMsgHdr {
	userId?: string;
	msgId?: number;
	sessId?: Uint8Array;
	tranId?: Uint8Array;
	tranSeq?: number;
	locNonce?: bigint;
	rmtNonce?: bigint;
}

export function decodePlanetMsgHdr(bytes: Uint8Array): DecodedPlanetMsgHdr {
	const fields = decodeFields(bytes);
	return {
		userId: asStringField(fields, 1),
		msgId: asNumberField(fields, 2),
		sessId: asBytesField(fields, 3),
		tranId: asBytesField(fields, 4),
		tranSeq: asNumberField(fields, 5),
		locNonce: asBigintField(fields, 6),
		rmtNonce: asBigintField(fields, 7),
	};
}

export interface DecodedPlanetCcHdr {
	cid?: string;
	srcChanId?: bigint;
	dstChanId?: bigint;
}

export interface DecodedPlanetCcMsg {
	hdr?: DecodedPlanetCcHdr;
	bodyTag?: number;
	bodyName?: string;
	bodyBytes?: Uint8Array;
}

export interface DecodedPlanetMsg {
	hdr?: DecodedPlanetMsgHdr;
	scBytes?: Uint8Array;
	cc?: DecodedPlanetCcMsg;
	mcBytes?: Uint8Array;
}

export function decodePlanetCcMsg(bytes: Uint8Array): DecodedPlanetCcMsg {
	const fields = decodeFields(bytes);
	const hdrBytes = asBytesField(fields, 1);
	const body = asBytesField(fields, 2);
	const decoded: DecodedPlanetCcMsg = {};
	if (hdrBytes) {
		const hdrFields = decodeFields(hdrBytes);
		decoded.hdr = {
			cid: asStringField(hdrFields, 1),
			srcChanId: asBigintField(hdrFields, 2),
			dstChanId: asBigintField(hdrFields, 3),
		};
	}
	if (body) {
		const bodyFields = decodeFields(body);
		const oneof = bodyFields[0];
		if (oneof?.value instanceof Uint8Array) {
			decoded.bodyTag = oneof.tag;
			decoded.bodyName = CC_MSG_NAMES[oneof.tag] ?? `cc_msg_${oneof.tag}`;
			decoded.bodyBytes = oneof.value;
		}
	}
	return decoded;
}

export function decodePlanetMsg(bytes: Uint8Array): DecodedPlanetMsg {
	const fields = decodeFields(bytes);
	const hdrBytes = asBytesField(fields, 1);
	const scBytes = asBytesField(fields, 2);
	const ccBytes = asBytesField(fields, 3);
	const mcBytes = asBytesField(fields, 4);
	return {
		hdr: hdrBytes ? decodePlanetMsgHdr(hdrBytes) : undefined,
		scBytes,
		cc: ccBytes ? decodePlanetCcMsg(ccBytes) : undefined,
		mcBytes,
	};
}

export interface PlanetAddr {
	ver?: number;
	trpt?: number;
	ip?: string;
	ports?: string;
	port?: number;
}

export function decodePlanetAddr(bytes: Uint8Array): PlanetAddr {
	const fields = decodeFields(bytes);
	return {
		ver: asNumberField(fields, 1),
		trpt: asNumberField(fields, 2),
		ip: asStringField(fields, 3),
		ports: asStringField(fields, 4),
		port: asNumberField(fields, 5),
	};
}

export interface CcSetupRsp {
	result?: number;
	relCode?: number;
	relPhrase?: string;
	cfgs?: string;
	releaser?: string;
	compCfgs?: Uint8Array;
	compCfgsType?: number;
	aliveRptInterval?: number;
	stops?: string;
	pt?: boolean;
	noAnsToSec?: number;
	maxDurSec?: number;
	ptt?: boolean;
	svcId?: string;
	tgtSvcId?: string;
	interDomain?: boolean;
	maxCallTimeSec?: number;
}

export function decodeCcSetupRsp(bytes: Uint8Array): CcSetupRsp {
	const fields = decodeFields(bytes);
	return {
		result: asNumberField(fields, 1),
		relCode: asNumberField(fields, 2),
		relPhrase: asStringField(fields, 3),
		cfgs: asStringField(fields, 4),
		releaser: asStringField(fields, 6),
		compCfgs: asBytesField(fields, 7),
		compCfgsType: asNumberField(fields, 8),
		aliveRptInterval: asNumberField(fields, 101),
		stops: asStringField(fields, 102),
		pt: asBoolField(fields, 111),
		noAnsToSec: asNumberField(fields, 112),
		maxDurSec: asNumberField(fields, 113),
		ptt: asBoolField(fields, 114),
		svcId: asStringField(fields, 151),
		tgtSvcId: asStringField(fields, 152),
		interDomain: asBoolField(fields, 153),
		maxCallTimeSec: asNumberField(fields, 154),
	};
}

export interface CcConnReq {
	answer?: Uint8Array;
	mChanId?: bigint;
	netType?: number;
	unavailToSec?: number;
	oCapas: number[];
	ueData?: Uint8Array;
	ueDataCompType?: number;
	features: Uint8Array[];
	ua?: Uint8Array;
	rCountry?: string;
	reqRec?: boolean;
	mAddr?: PlanetAddr;
	devId?: string;
	uePublicAddr?: PlanetAddr;
	offer?: Uint8Array;
	svcId?: string;
	tgtSvcId?: string;
	interDomain?: boolean;
	pt?: boolean;
}

export function decodeCcConnReq(bytes: Uint8Array): CcConnReq {
	const fields = decodeFields(bytes);
	const mAddr = asBytesField(fields, 101);
	const uePublicAddr = asBytesField(fields, 103);
	return {
		answer: asBytesField(fields, 1),
		mChanId: asBigintField(fields, 2),
		netType: asNumberField(fields, 3),
		unavailToSec: asNumberField(fields, 4),
		oCapas: repeatedNumbers(fields, 5),
		ueData: asBytesField(fields, 6),
		ueDataCompType: asNumberField(fields, 7),
		features: repeatedBytes(fields, 8),
		ua: asBytesField(fields, 9),
		rCountry: asStringField(fields, 10),
		reqRec: asBoolField(fields, 51),
		mAddr: mAddr ? decodePlanetAddr(mAddr) : undefined,
		devId: asStringField(fields, 102),
		uePublicAddr: uePublicAddr ? decodePlanetAddr(uePublicAddr) : undefined,
		offer: asBytesField(fields, 104),
		svcId: asStringField(fields, 151),
		tgtSvcId: asStringField(fields, 152),
		interDomain: asBoolField(fields, 153),
		pt: asBoolField(fields, 154),
	};
}

export interface CcConnRsp {
	result?: number;
	relCode?: number;
	relPhrase?: string;
	mChanId?: bigint;
	netType?: number;
	unavailToSec?: number;
	ua?: Uint8Array;
	mAddr?: PlanetAddr;
	uePublicAddr?: PlanetAddr;
	svcId?: string;
	tgtSvcId?: string;
	interDomain?: boolean;
}

export function decodeCcConnRsp(bytes: Uint8Array): CcConnRsp {
	const fields = decodeFields(bytes);
	const mAddr = asBytesField(fields, 101);
	const uePublicAddr = asBytesField(fields, 102);
	return {
		result: asNumberField(fields, 1),
		relCode: asNumberField(fields, 2),
		relPhrase: asStringField(fields, 3),
		mChanId: asBigintField(fields, 4),
		netType: asNumberField(fields, 5),
		unavailToSec: asNumberField(fields, 6),
		ua: asBytesField(fields, 7),
		mAddr: mAddr ? decodePlanetAddr(mAddr) : undefined,
		uePublicAddr: uePublicAddr ? decodePlanetAddr(uePublicAddr) : undefined,
		svcId: asStringField(fields, 151),
		tgtSvcId: asStringField(fields, 152),
		interDomain: asBoolField(fields, 153),
	};
}

export interface NativeSetupMediaRecord {
	name?: string;
	enabled?: number;
	bitrate?: number;
	kind?: number;
	rtpId?: number;
	rtpPort?: number;
	rtcpId?: number;
	raw: Uint8Array;
}

export interface NativeSetupOffer {
	media: NativeSetupMediaRecord[];
	mediaPubKey?: Uint8Array;
	mediaKeyId?: number;
	mediaNonce?: Uint8Array;
	mediaSecret?: Uint8Array;
	version?: { major?: number; mode?: number };
}

export function decodeNativeSetupOffer(bytes: Uint8Array): NativeSetupOffer {
	const top = decodeFields(bytes);
	const media: NativeSetupMediaRecord[] = [];
	const decoded: NativeSetupOffer = { media };
	for (const f of top) {
		if (!(f.value instanceof Uint8Array)) continue;
		if (f.tag === 1) {
			const item = decodeFields(f.value);
			const codecBytes = asBytesField(item, 1);
			const pathBytes = asBytesField(item, 2);
			const codec = codecBytes ? decodeFields(codecBytes) : [];
			const path = pathBytes ? decodeFields(pathBytes) : [];
			media.push({
				name: asStringField(codec, 1),
				enabled: asNumberField(codec, 3),
				bitrate: asNumberField(codec, 4),
				kind: asNumberField(codec, 50),
				rtpId: asNumberField(path, 1),
				rtpPort: asNumberField(path, 11),
				rtcpId: asNumberField(path, 61),
				raw: f.value,
			});
		} else if (f.tag === 2) {
			const sec = decodeFields(f.value);
			const secA = asBytesField(sec, 3);
			if (secA) {
				const inner = decodeFields(secA);
				decoded.mediaPubKey = asBytesField(inner, 1);
				decoded.mediaKeyId = asNumberField(inner, 2);
				decoded.mediaNonce = asBytesField(inner, 3);
			}
			const secB = asBytesField(sec, 2);
			if (secB) {
				const inner = decodeFields(secB);
				decoded.mediaSecret = asBytesField(inner, 1);
			}
		} else if (f.tag === 3) {
			const version = decodeFields(f.value);
			decoded.version = {
				major: asNumberField(version, 1),
				mode: asNumberField(version, 2),
			};
		}
	}
	return decoded;
}
