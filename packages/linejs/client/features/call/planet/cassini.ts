/**
 * PLANET Cassini message format — ground-truth revision.
 *
 * Live `pln_msg_pack` capture during a native LINE call shows the on-wire
 * format is **protobuf**. Captured hex bytes:
 *
 *   0a 60 0a 21 75 63 38 34 35 38 36 34 37 34 37 30 33 61 36 31 37 32
 *   65 39 64 30 35 31 65 61 62 62 63 62 36 32 37 10 81 22 1a 10 b0 c2
 *   a7 4c e7 cd 45 02 a0 fa 32 58 6d a9 0e 54 22 21 0f c4 ed 07 ...
 *
 * Decoded as protobuf:
 *
 *   field 1 (tag 0x0a, length-delimited, len=0x60):
 *     // nested header message
 *     field 1 (0x0a, len=0x21): user_id "u00000000000000000000000000000000"
 *     field 2 (0x10, varint):   msg_id   (varint 0x81 0x22 = 4353 ascending per call)
 *     field 3 (0x1a, len=0x10): uuid     (16-byte session UUID)
 *     field 4 (0x22, len=0x21): user_pub (33-byte SEC1 EC pubkey)
 *     field 5 (0x28, varint):   timestamp1
 *     field 6 (0x30, varint):   timestamp2
 *     field 7 (0x38, varint):   created_at_ms (Unix-ms timestamp)
 *
 *   field N+1 (0x6a, len=...): body payload — typically:
 *     field 1 (0x0a, len-delim): call_uuid "c5cd3923-5d89-45d6-a0bf-..."
 *     field N (0x12 or 0x22, len-delim): "exchange_app_str_data" (msg type name)
 *     field N (0x22, len-delim): JSON params  e.g. {"csv":1}
 *     field N (0x...):           device info  "Android..36..Pixel 6a"
 *
 * This file gives a clean protobuf encoder/decoder for these messages
 * plus typed builders for the SETUP / EXCHANGE / REL flows.
 */

import { Buffer } from "node:buffer";

/** Protobuf wire type tags. */
export const enum WireType {
	Varint = 0,
	Fixed64 = 1,
	LengthDelim = 2,
	Fixed32 = 5,
}

/** Encode a protobuf varint. */
export function encodeVarint(n: number | bigint): Uint8Array {
	let v = typeof n === "bigint" ? n : BigInt(n);
	const out: number[] = [];
	while (v > 0x7fn) {
		out.push(Number((v & 0x7fn) | 0x80n));
		v >>= 7n;
	}
	out.push(Number(v));
	return new Uint8Array(out);
}

/** Decode a protobuf varint. Returns [value, byte length]. */
export function decodeVarint(buf: Uint8Array, off: number): [bigint, number] {
	let v = 0n;
	let shift = 0n;
	let i = off;
	while (i < buf.length) {
		const b = BigInt(buf[i]);
		v |= (b & 0x7fn) << shift;
		shift += 7n;
		i++;
		if ((b & 0x80n) === 0n) break;
	}
	return [v, i - off];
}

/** A single protobuf field. */
export interface PbField {
	tag: number;
	wireType: WireType;
	value: bigint | Uint8Array;
}

/** Encode a sequence of protobuf fields to wire bytes. */
export function encodePb(fields: PbField[]): Uint8Array {
	const out: number[] = [];
	for (const f of fields) {
		const key = encodeVarint(BigInt((f.tag << 3) | f.wireType));
		for (const b of key) out.push(b);
		if (f.wireType === WireType.Varint) {
			for (const b of encodeVarint(f.value as bigint)) out.push(b);
		} else if (f.wireType === WireType.LengthDelim) {
			const v = new Uint8Array(f.value as Uint8Array);
			for (const b of encodeVarint(v.length)) out.push(b);
			for (const b of v) out.push(b);
		} else {
			throw new Error(`encodePb: wireType ${f.wireType} not implemented`);
		}
	}
	return new Uint8Array(out);
}

/** Decode protobuf bytes into a list of fields (varint + length-delim only). */
export function decodePb(buf: Uint8Array): PbField[] {
	const out: PbField[] = [];
	let i = 0;
	while (i < buf.length) {
		const [k, kl] = decodeVarint(buf, i);
		i += kl;
		const tag = Number(k >> 3n);
		const wt = Number(k & 7n) as WireType;
		if (wt === WireType.Varint) {
			const [v, vl] = decodeVarint(buf, i);
			out.push({ tag, wireType: wt, value: v });
			i += vl;
		} else if (wt === WireType.LengthDelim) {
			const [len, ll] = decodeVarint(buf, i);
			i += ll;
			const v = buf.subarray(i, i + Number(len));
			out.push({ tag, wireType: wt, value: v });
			i += Number(len);
		} else if (wt === WireType.Fixed64) {
			out.push({
				tag,
				wireType: wt,
				value: buf.subarray(i, i + 8),
			});
			i += 8;
		} else if (wt === WireType.Fixed32) {
			out.push({
				tag,
				wireType: wt,
				value: buf.subarray(i, i + 4),
			});
			i += 4;
		} else {
			throw new Error(`decodePb: unknown wireType ${wt} at offset ${i}`);
		}
	}
	return out;
}

/** Cassini message envelope — the outer protobuf the libandromeda
 *  call control plane uses. Field tags match `pln_msg_pack` output. */
export interface CassiniEnvelope {
	header: CassiniHeader;
	body: Uint8Array;
}

export interface CassiniHeader {
	/** Owning user mid (Cassini "user_id"). */
	userId: string;
	/** Monotonic per-call sequence (the 0x1d5/0x1d6/... we observed). */
	msgId: number;
	/** 16-byte call UUID — constant for the call's lifetime. */
	callUuid16: Uint8Array;
	/** 16-byte per-message random / HMAC tag — varies per packet. */
	msgNonce: Uint8Array;
	/** Wire-observed counter (varint). Increments slowly. */
	counter: bigint;
	/** Subscription id (varint) — constant per call. */
	subscriptionId: bigint;
	/** Session id (varint) — constant per call, differs slightly by msg
	 *  class (the upper bits encode a class indicator). */
	sessionId: bigint;
}

const enum HDR_TAG {
	USER_ID = 1,
	MSG_ID = 2,
	CALL_UUID = 3,
	MSG_NONCE = 4,
	COUNTER = 5,
	SUBSCRIPTION_ID = 6,
	SESSION_ID = 7,
}

/** Envelope-body tag varies by message class. Observed values from a
 *  native LINE call: */
export const ENVELOPE_BODY_TAG = {
	KA: 2, // keepalive / handshake init
	CONTROL: 3, // req / rsp / exchange_app_str_data / initiator
	STATE: 4, // setup / complex state payloads with device info
} as const;

const ENV_HDR_TAG = 1;

export function packCassiniHeader(h: CassiniHeader): Uint8Array {
	return encodePb([
		{
			tag: HDR_TAG.USER_ID,
			wireType: WireType.LengthDelim,
			value: new TextEncoder().encode(h.userId),
		},
		{ tag: HDR_TAG.MSG_ID, wireType: WireType.Varint, value: BigInt(h.msgId) },
		{
			tag: HDR_TAG.CALL_UUID,
			wireType: WireType.LengthDelim,
			value: h.callUuid16,
		},
		{
			tag: HDR_TAG.MSG_NONCE,
			wireType: WireType.LengthDelim,
			value: h.msgNonce,
		},
		{ tag: HDR_TAG.COUNTER, wireType: WireType.Varint, value: h.counter },
		{
			tag: HDR_TAG.SUBSCRIPTION_ID,
			wireType: WireType.Varint,
			value: h.subscriptionId,
		},
		{ tag: HDR_TAG.SESSION_ID, wireType: WireType.Varint, value: h.sessionId },
	]);
}

export function packCassini(
	env: CassiniEnvelope,
	bodyTag: number = ENVELOPE_BODY_TAG.CONTROL,
): Uint8Array {
	const headerBytes = packCassiniHeader(env.header);
	return encodePb([
		{ tag: ENV_HDR_TAG, wireType: WireType.LengthDelim, value: headerBytes },
		{ tag: bodyTag, wireType: WireType.LengthDelim, value: env.body },
	]);
}

export function unpackCassini(
	wire: Uint8Array,
): CassiniEnvelope & { bodyTag: number } {
	const fields = decodePb(wire);
	const hdrField = fields.find((f) => f.tag === ENV_HDR_TAG);
	const bodyField = fields.find((f) =>
		f.tag !== ENV_HDR_TAG && f.wireType === WireType.LengthDelim
	);
	if (!hdrField || !bodyField) {
		throw new Error("unpackCassini: missing header/body");
	}
	const hdrParts = decodePb(new Uint8Array(hdrField.value as Uint8Array));
	let userId = "", msgId = 0;
	let callUuid16 = new Uint8Array(0), msgNonce = new Uint8Array(0);
	let counter = 0n, subscriptionId = 0n, sessionId = 0n;
	for (const f of hdrParts) {
		if (f.tag === HDR_TAG.USER_ID) {
			userId = new TextDecoder().decode(new Uint8Array(f.value as Uint8Array));
		} else if (f.tag === HDR_TAG.MSG_ID) msgId = Number(f.value);
		else if (f.tag === HDR_TAG.CALL_UUID) {
			callUuid16 = new Uint8Array(f.value as Uint8Array);
		} else if (f.tag === HDR_TAG.MSG_NONCE) {
			msgNonce = new Uint8Array(f.value as Uint8Array);
		} else if (f.tag === HDR_TAG.COUNTER) counter = f.value as bigint;
		else if (f.tag === HDR_TAG.SUBSCRIPTION_ID) {
			subscriptionId = f.value as bigint;
		} else if (f.tag === HDR_TAG.SESSION_ID) sessionId = f.value as bigint;
	}
	return {
		header: {
			userId,
			msgId,
			callUuid16,
			msgNonce,
			counter,
			subscriptionId,
			sessionId,
		},
		body: new Uint8Array(bodyField.value as Uint8Array),
		bodyTag: bodyField.tag,
	};
}

/** Body payload — observed contents include:
 *  - call UUID string
 *  - message type name (e.g. "exchange_app_str_data")
 *  - JSON params (e.g. `{"csv":1}`)
 *  - device info
 */
export interface CassiniBody {
	callUuid?: string;
	msgTypeName?: string;
	jsonParams?: string;
	deviceInfo?: string;
	/** Additional protobuf fields that we don't yet have names for. */
	extra?: PbField[];
}

const enum BODY_TAG {
	CALL_UUID = 1,
	MSG_TYPE = 2,
	JSON_PARAMS = 4,
	DEVICE_INFO = 13,
}

export function packCassiniBody(b: CassiniBody): Uint8Array {
	const enc = new TextEncoder();
	const fields: PbField[] = [];
	if (b.callUuid !== undefined) {
		fields.push({
			tag: BODY_TAG.CALL_UUID,
			wireType: WireType.LengthDelim,
			value: enc.encode(b.callUuid),
		});
	}
	if (b.msgTypeName !== undefined) {
		fields.push({
			tag: BODY_TAG.MSG_TYPE,
			wireType: WireType.LengthDelim,
			value: enc.encode(b.msgTypeName),
		});
	}
	if (b.jsonParams !== undefined) {
		fields.push({
			tag: BODY_TAG.JSON_PARAMS,
			wireType: WireType.LengthDelim,
			value: enc.encode(b.jsonParams),
		});
	}
	if (b.deviceInfo !== undefined) {
		fields.push({
			tag: BODY_TAG.DEVICE_INFO,
			wireType: WireType.LengthDelim,
			value: enc.encode(b.deviceInfo),
		});
	}
	if (b.extra) fields.push(...b.extra);
	return encodePb(fields);
}

export function unpackCassiniBody(wire: Uint8Array): CassiniBody {
	const fields = decodePb(wire);
	const out: CassiniBody = { extra: [] };
	const dec = new TextDecoder();
	for (const f of fields) {
		if (f.wireType !== WireType.LengthDelim) {
			out.extra!.push(f);
			continue;
		}
		const v = new Uint8Array(f.value as Uint8Array);
		if (f.tag === BODY_TAG.CALL_UUID) out.callUuid = dec.decode(v);
		else if (f.tag === BODY_TAG.MSG_TYPE) out.msgTypeName = dec.decode(v);
		else if (f.tag === BODY_TAG.JSON_PARAMS) out.jsonParams = dec.decode(v);
		else if (f.tag === BODY_TAG.DEVICE_INFO) out.deviceInfo = dec.decode(v);
		else out.extra!.push(f);
	}
	return out;
}

/** Common per-call session parameters. The subscriptionId + sessionId
 *  values are observed-constant within a single call and need to be
 *  established by an initial bootstrap handshake (still under RE). */
export interface CassiniSession {
	fromMid: string;
	callUuid16: Uint8Array;
	callUuidString: string;
	subscriptionId: bigint;
	sessionId: bigint;
}

function nextNonce16(): Uint8Array {
	const n = new Uint8Array(16);
	crypto.getRandomValues(n);
	return n;
}

/** Build a Cassini SETUP envelope (state-class body, tag=4 on the wire). */
export function buildSetupReq(opts: {
	session: CassiniSession;
	msgId: number;
	counter: bigint;
	deviceInfo: string;
}): Uint8Array {
	const body = packCassiniBody({
		callUuid: opts.session.callUuidString,
		msgTypeName: "setup_req",
		deviceInfo: opts.deviceInfo,
	});
	return packCassini({
		header: {
			userId: opts.session.fromMid,
			msgId: opts.msgId,
			callUuid16: opts.session.callUuid16,
			msgNonce: nextNonce16(),
			counter: opts.counter,
			subscriptionId: opts.session.subscriptionId,
			sessionId: opts.session.sessionId,
		},
		body,
	}, ENVELOPE_BODY_TAG.STATE);
}

/** Build a Cassini "exchange_app_str_data" — used mid-call for app-level
 *  signaling (e.g. CSV capability flag). control-class body (tag=3). */
export function buildExchangeAppStrData(opts: {
	session: CassiniSession;
	msgId: number;
	counter: bigint;
	json: string;
}): Uint8Array {
	const body = packCassiniBody({
		callUuid: opts.session.callUuidString,
		msgTypeName: "exchange_app_str_data",
		jsonParams: opts.json,
	});
	return packCassini({
		header: {
			userId: opts.session.fromMid,
			msgId: opts.msgId,
			callUuid16: opts.session.callUuid16,
			msgNonce: nextNonce16(),
			counter: opts.counter,
			subscriptionId: opts.session.subscriptionId,
			sessionId: opts.session.sessionId,
		},
		body,
	}, ENVELOPE_BODY_TAG.CONTROL);
}

/** Build a Cassini REL (release / BYE-equivalent). control-class body. */
export function buildRelReq(opts: {
	session: CassiniSession;
	msgId: number;
	counter: bigint;
	reason?: string;
}): Uint8Array {
	const body = packCassiniBody({
		callUuid: opts.session.callUuidString,
		msgTypeName: "rel_req",
		jsonParams: opts.reason
			? JSON.stringify({ reason: opts.reason })
			: undefined,
	});
	return packCassini({
		header: {
			userId: opts.session.fromMid,
			msgId: opts.msgId,
			callUuid16: opts.session.callUuid16,
			msgNonce: nextNonce16(),
			counter: opts.counter,
			subscriptionId: opts.session.subscriptionId,
			sessionId: opts.session.sessionId,
		},
		body,
	}, ENVELOPE_BODY_TAG.CONTROL);
}
