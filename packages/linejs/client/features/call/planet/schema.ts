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
	while (x > 0x7fn) { out.push(Number((x & 0x7fn) | 0x80n)); x >>= 7n; }
	out.push(Number(x));
	return new Uint8Array(out);
}

export function decodeVarint(buf: Uint8Array, off: number): [bigint, number] {
	let v = 0n, shift = 0n, i = off;
	while (i < buf.length) {
		const b = BigInt(buf[i]);
		v |= (b & 0x7fn) << shift;
		shift += 7n; i++;
		if ((b & 0x80n) === 0n) break;
	}
	return [v, i - off];
}

function fixed64(v: bigint): Uint8Array {
	const o = new Uint8Array(8);
	let x = v < 0n ? v + (1n << 64n) : v;
	for (let i = 0; i < 8; i++) { o[i] = Number(x & 0xffn); x >>= 8n; }
	return o;
}
function readFixed64(buf: Uint8Array, off: number): bigint {
	let v = 0n;
	for (let i = 7; i >= 0; i--) v = (v << 8n) | BigInt(buf[off + i]);
	return v;
}
function fixed32(v: number): Uint8Array {
	const o = new Uint8Array(4);
	o[0] = v & 0xff; o[1] = (v >>> 8) & 0xff; o[2] = (v >>> 16) & 0xff; o[3] = (v >>> 24) & 0xff;
	return o;
}

// ─── encoder primitive: emit (tag, value) → wire bytes ──────────────────

interface Buf { bytes: number[] }
function _emit(b: Buf, ...parts: ArrayLike<number>[]) {
	for (const p of parts) for (let i = 0; i < p.length; i++) b.bytes.push(p[i]);
}
function _key(b: Buf, tag: number, wt: WireType) { _emit(b, encodeVarint((tag << 3) | wt)); }

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
	_key(b, tag, WireType.Varint); _emit(b, encodeVarint(v));
}
function emitUint64(b: Buf, tag: number, v: bigint) {
	_key(b, tag, WireType.Varint); _emit(b, encodeVarint(v));
}
function emitSfixed64(b: Buf, tag: number, v: bigint) {
	_key(b, tag, WireType.Fixed64); _emit(b, fixed64(v));
}
function emitBool(b: Buf, tag: number, v: boolean) {
	_key(b, tag, WireType.Varint); b.bytes.push(v ? 1 : 0);
}
function emitEnum(b: Buf, tag: number, v: number) {
	_key(b, tag, WireType.Varint); _emit(b, encodeVarint(v));
}
function emitMessage(b: Buf, tag: number, v: Uint8Array) {
	_key(b, tag, WireType.LengthDelim);
	_emit(b, encodeVarint(v.length), v);
}
function finalize(b: Buf): Uint8Array { return new Uint8Array(b.bytes); }

// ─── planet_msg_hdr ─────────────────────────────────────────────────────

export interface PlanetMsgHdr {
	userId: string;
	msgId: number;
	sessId: Uint8Array;   // 16-byte session id (constant per call)
	tranId: Uint8Array;   // 16-byte per-message random
	tranSeq: number;
	locNonce: bigint;     // local random u64
	rmtNonce: bigint;     // server-issued u64
}

export function packPlanetMsgHdr(h: PlanetMsgHdr): Uint8Array {
	const b: Buf = { bytes: [] };
	emitString(b, 1, h.userId);
	emitUint32(b, 2, h.msgId);
	emitBytes(b, 3, h.sessId);
	emitBytes(b, 4, h.tranId);
	emitUint32(b, 5, h.tranSeq);
	emitUint64(b, 6, h.locNonce);
	emitUint64(b, 7, h.rmtNonce);
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
	emitUint64(b, 3, h.dstChanId);
	return finalize(b);
}

// ─── cc_msg oneof identifiers ───────────────────────────────────────────

export const CC_MSG = {
	SETUP_REQ: 1, SETUP_RSP: 2,
	VERIFY_REQ: 3, VERIFY_RSP: 4,
	CONN_REQ: 5, CONN_RSP: 6,
	REL_REQ: 7, REL_RSP: 8,
	HO_REQ: 9, HO_RSP: 10,
	SO_REQ: 11, SO_RSP: 12,
	MCP_REQ: 13, MCP_RSP: 14,
	UPD_REQ: 15, UPD_RSP: 16,
	UNAVAIL_REQ: 17, UNAVAIL_RSP: 18,
	INFO_REQ: 19, INFO_RSP: 20,
	CONRX_REQ: 21, CONRX_RSP: 22,
} as const;

// ─── cc_setup_req — the most important payload ──────────────────────────

export interface CcSetupReq {
	initiator: string;      // tag 1
	responder: string;      // tag 2
	iZone?: string;         // tag 3 — e.g. "jpdc"
	rZone?: string;         // tag 4
	ua?: Uint8Array;        // tag 5 — packed PlanetUserAgent
	devId?: string;         // tag 6
	commTypeFlags?: number; // tag 7 — enum
	capas?: number[];       // tag 8 — repeated enum
	offer?: Uint8Array;     // tag 9 — bytes (media offer)
	credential?: Uint8Array;// tag 10 — bytes (auth: fromToken)
	fakeCall?: boolean;     // tag 11
	svcKey?: string;        // tag 12 — OUR PUBKEY (base64 or hex)
	crt?: boolean;          // tag 13
	netType?: number;       // tag 14 — enum
	stid?: string;          // tag 21
	ccp?: string;           // tag 22
	ueData?: Uint8Array;    // tag 23
	ueDataCompType?: number;// tag 24
	features?: Uint8Array[];// tag 25 — repeated packed PlanetFeatRegister
	svcId?: string;         // tag 51
	tgtSvcId?: string;      // tag 52
	reqRec?: boolean;       // tag 53
	appSvrDataId?: string;  // tag 54
	uePublicAddr?: Uint8Array; // tag 101
	iVisitedZone?: string;  // tag 102
	rToken?: string;        // tag 103
	iMercuryIp?: string;    // tag 104
	pathCheck?: boolean;    // tag 105
	iMercuryIpv6?: string;  // tag 106
	rGcallZone?: string;    // tag 107
	interDomain?: boolean;  // tag 151
	appSvrData?: string;    // tag 152
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
	if (r.capas) for (const c of r.capas) emitEnum(b, 8, c);
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
	if (r.features) for (const f of r.features) emitMessage(b, 25, f);
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

// ─── cc_msg oneof wrapper ───────────────────────────────────────────────

export function wrapCcMsg(oneofTag: number, packedInner: Uint8Array): Uint8Array {
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

export function packPlanetMsg(hdr: PlanetMsgHdr, body: PlanetMsgBody): Uint8Array {
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
	if (isP2p) emitBool(b, 2, true);
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
		const [k, kl] = decodeVarint(buf, i); i += kl;
		const tag = Number(k >> 3n);
		const wt = Number(k & 7n) as WireType;
		if (wt === WireType.Varint) {
			const [v, vl] = decodeVarint(buf, i); i += vl;
			out.push({ tag, wireType: wt, value: v });
		} else if (wt === WireType.LengthDelim) {
			const [len, ll] = decodeVarint(buf, i); i += ll;
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
