/**
 * PLANET / Cassini message types.
 *
 * The full set of 27 Cassini message types enumerated from
 * libandromeda's `pln_cassini_send_*` dynamic symbols:
 *
 *   0x774d34  pln_cassini_send_setup           — outbound INVITE-equivalent
 *   0x775530  pln_cassini_send_verify          — call-leg verification
 *   0x775898  pln_cassini_send_conn            — connection establishment
 *   0x775c04  pln_cassini_send_conrx           — connection-rx ack
 *   0x775f50  pln_cassini_send_ho              — handover
 *   0x7761e0  pln_cassini_send_so              — service operation
 *   0x77684c  pln_cassini_send_mcp             — media control
 *   0x776aa8  pln_cassini_send_info            — call info exchange
 *   0x776de8  pln_cassini_send_data_sess_req   — data session
 *   0x777404  pln_cassini_send_unsubscribe_req
 *   0x7776f4  pln_cassini_send_<other>         (truncated in readelf)
 *   0x777c58  pln_cassini_send_pull
 *   0x777f10  pln_cassini_send_push
 *   0x778150  pln_cassini_send_set_speaker
 *   0x778380  pln_cassini_send_unavail
 *   0x779b10  pln_cassini_send_participate_rsp
 *   0x77a0b8  pln_cassini_send_subscribe
 *   0x77a32c  pln_cassini_send_subpush
 *   0x77a8a8  pln_cassini_send_upd
 *   0x77aa98  pln_cassini_send_dtass_rsp
 *   0x77ad0c  pln_cassini_send_push_rsp
 *   0x77b44c  pln_cassini_send_subpush_rsp
 *   0x77b974  pln_cassini_send_set_speaker_rsp
 *   0x77b48c  pln_cassini_send_rel             — release (BYE-equivalent)
 *
 * Each is a 600-1100-byte function that builds a binary payload and
 * hands it to pln_sess_send_req.
 *
 * Exact field schemas require deeper RE; this file ships the type tags
 * + a TLV-style builder framework that matches the observed wire shape
 * (length-prefixed fields).
 */

export const CASSINI_MSG = {
	SETUP: 0x01,
	SETUP_RSP: 0x02,
	CONN: 0x03,
	CONN_RSP: 0x04,
	CONRX: 0x05,
	CONRX_RSP: 0x06,
	REL: 0x07,
	REL_RSP: 0x08,
	INFO: 0x09,
	INFO_RSP: 0x0a,
	MCP: 0x0b,
	MCP_RSP: 0x0c,
	VERIFY: 0x0d,
	VERIFY_RSP: 0x0e,
	HO: 0x0f,
	HO_RSP: 0x10,
	UPD: 0x11,
	UPD_RSP: 0x12,
	UNAVAIL: 0x13,
	UNAVAIL_RSP: 0x14,
	SO: 0x15,
	SO_RSP: 0x16,
	PUSH: 0x17,
	PUSH_RSP: 0x18,
	PULL: 0x19,
	PULL_RSP: 0x1a,
	SUBSCRIBE: 0x1b,
	SUBSCRIBE_RSP: 0x1c,
	UNSUBSCRIBE: 0x1d,
	SUBPUSH: 0x1e,
	SUBPUSH_RSP: 0x1f,
	PARTICIPATE: 0x20,
	PARTICIPATE_RSP: 0x21,
	DATA_SESS_REQ: 0x22,
	BIG_DATA: 0x23,
	BIG_DATA_RSP: 0x24,
	DTASS: 0x25,
	DTASS_RSP: 0x26,
	SET_SPEAKER: 0x27,
	SET_SPEAKER_RSP: 0x28,
} as const;

export type CassiniMsgType = (typeof CASSINI_MSG)[keyof typeof CASSINI_MSG];

/** Fields shared by every Cassini message. */
export interface CassiniHeader {
	/** Class (req=0, rsp=1, event=2). Derived from `pln_msg_get_msg_cls`. */
	cls: number;
	/** Message type — one of `CASSINI_MSG`. */
	type: CassiniMsgType;
	/** Transaction id — increments per request. */
	msgId: number;
	/** Owning user mid. */
	userId: string;
}

/** A TLV (type-length-value) field, used to encode optional payload data. */
export interface TLV {
	tag: number;
	value: Uint8Array;
}

/** Pack a Cassini message: header + TLV body, in the wire format that
 *  `pln_msg_pack` produces (best-effort match: 1-byte class, 1-byte
 *  type, 4-byte msgId BE, length-prefixed userId, then TLVs). */
export function packCassini(hdr: CassiniHeader, tlvs: TLV[]): Uint8Array {
	const userIdBytes = new TextEncoder().encode(hdr.userId);
	let total = 1 + 1 + 4 + 2 + userIdBytes.length;
	for (const t of tlvs) total += 1 + 2 + t.value.length;
	const out = new Uint8Array(total);
	const dv = new DataView(out.buffer);
	let o = 0;
	out[o++] = hdr.cls & 0xff;
	out[o++] = hdr.type & 0xff;
	dv.setUint32(o, hdr.msgId >>> 0, false);
	o += 4;
	dv.setUint16(o, userIdBytes.length, false);
	o += 2;
	out.set(userIdBytes, o);
	o += userIdBytes.length;
	for (const t of tlvs) {
		out[o++] = t.tag & 0xff;
		dv.setUint16(o, t.value.length, false);
		o += 2;
		out.set(t.value, o);
		o += t.value.length;
	}
	return out;
}

/** Unpack a Cassini message produced by `packCassini`. */
export function unpackCassini(
	wire: Uint8Array,
): { hdr: CassiniHeader; tlvs: TLV[] } {
	if (wire.length < 8) throw new Error("unpackCassini: too short");
	const dv = new DataView(wire.buffer, wire.byteOffset, wire.byteLength);
	let o = 0;
	const cls = wire[o++];
	const type = wire[o++] as CassiniMsgType;
	const msgId = dv.getUint32(o, false);
	o += 4;
	const uidLen = dv.getUint16(o, false);
	o += 2;
	const userId = new TextDecoder().decode(wire.subarray(o, o + uidLen));
	o += uidLen;
	const tlvs: TLV[] = [];
	while (o + 3 <= wire.length) {
		const tag = wire[o++];
		const len = dv.getUint16(o, false);
		o += 2;
		if (o + len > wire.length) break;
		tlvs.push({ tag, value: wire.subarray(o, o + len) });
		o += len;
	}
	return { hdr: { cls, type, msgId, userId }, tlvs };
}

/** Cassini SETUP request — initiates an outgoing call.
 *  Field tags are best-effort guesses; live verification needed. */
export const SETUP_TAG = {
	PEER_MID: 0x01,
	CALL_TYPE: 0x02, // 1=AUDIO, 2=VIDEO, 3=FACEPLAY
	SDP_OFFER: 0x03,
	CAPABILITIES: 0x04,
	CALL_FLOW_TYPE: 0x05,
	FROM_TOKEN: 0x06,
} as const;

export function buildSetupReq(opts: {
	msgId: number;
	fromMid: string;
	toMid: string;
	callType: "AUDIO" | "VIDEO" | "FACEPLAY";
	fromToken: string;
	sdpOffer: Uint8Array;
	capabilities?: string[];
}): Uint8Array {
	const callTypeMap = { AUDIO: 1, VIDEO: 2, FACEPLAY: 3 } as const;
	const enc = new TextEncoder();
	const tlvs: TLV[] = [
		{ tag: SETUP_TAG.PEER_MID, value: enc.encode(opts.toMid) },
		{ tag: SETUP_TAG.CALL_TYPE, value: new Uint8Array([callTypeMap[opts.callType]]) },
		{ tag: SETUP_TAG.SDP_OFFER, value: opts.sdpOffer },
		{ tag: SETUP_TAG.FROM_TOKEN, value: enc.encode(opts.fromToken) },
		{ tag: SETUP_TAG.CALL_FLOW_TYPE, value: new Uint8Array([2]) }, // PLANET
	];
	if (opts.capabilities && opts.capabilities.length) {
		tlvs.push({
			tag: SETUP_TAG.CAPABILITIES,
			value: enc.encode(opts.capabilities.join(",")),
		});
	}
	return packCassini({
		cls: 0, // req
		type: CASSINI_MSG.SETUP,
		msgId: opts.msgId,
		userId: opts.fromMid,
	}, tlvs);
}

/** Cassini REL request — terminate a call. */
export function buildRelReq(opts: {
	msgId: number;
	fromMid: string;
	reason?: string;
}): Uint8Array {
	const tlvs: TLV[] = [];
	if (opts.reason) {
		tlvs.push({ tag: 0x01, value: new TextEncoder().encode(opts.reason) });
	}
	return packCassini({
		cls: 0,
		type: CASSINI_MSG.REL,
		msgId: opts.msgId,
		userId: opts.fromMid,
	}, tlvs);
}
