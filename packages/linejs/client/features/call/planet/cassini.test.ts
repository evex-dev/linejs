import { assertEquals } from "@std/assert";
import {
	buildExchangeAppStrData,
	buildRelReq,
	buildSetupReq,
	type CassiniSession,
	decodePb,
	decodeVarint,
	encodePb,
	encodeVarint,
	ENVELOPE_BODY_TAG,
	packCassini,
	packCassiniBody,
	packCassiniHeader,
	unpackCassini,
	unpackCassiniBody,
	WireType,
} from "./cassini.ts";

Deno.test("encodeVarint matches well-known protobuf encodings", () => {
	assertEquals(encodeVarint(0), new Uint8Array([0]));
	assertEquals(encodeVarint(150), new Uint8Array([0x96, 0x01]));
	assertEquals(encodeVarint(4353), new Uint8Array([0x81, 0x22]));
});

Deno.test("encodeVarint + decodeVarint roundtrip", () => {
	for (const v of [0, 1, 127, 128, 4353, 0x1d5, 1_000_000_000, 0x7fffffff]) {
		const e = encodeVarint(v);
		const [d, n] = decodeVarint(e, 0);
		assertEquals(Number(d), v);
		assertEquals(n, e.length);
	}
});

Deno.test("encodePb + decodePb roundtrip", () => {
	const fields = [
		{ tag: 1, wireType: WireType.LengthDelim, value: new TextEncoder().encode("hello") },
		{ tag: 2, wireType: WireType.Varint, value: 42n },
		{ tag: 3, wireType: WireType.LengthDelim, value: new Uint8Array([1, 2, 3, 4]) },
	];
	const wire = encodePb(fields);
	const back = decodePb(wire);
	assertEquals(back.length, fields.length);
});

Deno.test("Cassini envelope roundtrip with the live-captured 7-field header", () => {
	const hdr = {
		userId: "uc84586474703a6172e9d051eabbcb627",
		msgId: 4353,
		callUuid16: new Uint8Array([
			0xb0, 0xc2, 0xa7, 0x4c, 0xe7, 0xcd, 0x45, 0x02,
			0xa0, 0xfa, 0x32, 0x58, 0x6d, 0xa9, 0x0e, 0x54,
		]),
		msgNonce: new Uint8Array([
			0xfc, 0x4e, 0xd0, 0x77, 0xd5, 0xe2, 0x41, 0x75,
			0xab, 0x59, 0x6e, 0xda, 0x73, 0x51, 0xcb, 0xe3,
		]),
		counter: 797128754n,
		subscriptionId: 290579788n,
		sessionId: 7642030284661133203n,
	};
	const body = new Uint8Array([0x0a, 0x0b, 0x09]);
	const wire = packCassini({ header: hdr, body }, ENVELOPE_BODY_TAG.KA);
	const back = unpackCassini(wire);
	assertEquals(back.bodyTag, ENVELOPE_BODY_TAG.KA);
	assertEquals(back.header, hdr);
});

Deno.test("packCassini against the captured msg_pack#1 header bytes (byte-for-byte)", () => {
	// Reproduce the first 96 bytes of msg_pack#1 from the live capture.
	const expectedHeaderBytes = new Uint8Array([
		// field 1 (user_id, 33 chars)
		0x0a, 0x21,
		...new TextEncoder().encode("uc84586474703a6172e9d051eabbcb627"),
		// field 2 (msg_id varint = 4353)
		0x10, 0x81, 0x22,
		// field 3 (call_uuid 16B)
		0x1a, 0x10,
		0xb0, 0xc2, 0xa7, 0x4c, 0xe7, 0xcd, 0x45, 0x02,
		0xa0, 0xfa, 0x32, 0x58, 0x6d, 0xa9, 0x0e, 0x54,
		// field 4 (msg_nonce 16B)
		0x22, 0x10,
		0xfc, 0x4e, 0xd0, 0x77, 0xd5, 0xe2, 0x41, 0x75,
		0xab, 0x59, 0x6e, 0xda, 0x73, 0x51, 0xcb, 0xe3,
		// field 5 (counter varint = 797128754)
		0x28, 0xb2, 0xf0, 0x8c, 0xfc, 0x02,
		// field 6 (subscription_id varint = 290579788)
		0x30, 0xcc, 0xca, 0xc7, 0x8a, 0x01,
		// field 7 (session_id varint = 7642030284661133203)
		0x38, 0x93, 0x9f, 0x84, 0x80, 0xe0, 0xc1, 0xfc, 0x86, 0x6a,
	]);
	const produced = packCassiniHeader({
		userId: "uc84586474703a6172e9d051eabbcb627",
		msgId: 4353,
		callUuid16: expectedHeaderBytes.subarray(40, 56),
		msgNonce: expectedHeaderBytes.subarray(58, 74),
		counter: 797128754n,
		subscriptionId: 290579788n,
		sessionId: 7642030284661133203n,
	});
	assertEquals(produced, expectedHeaderBytes);
});

Deno.test("Cassini body roundtrip preserves typed fields", () => {
	const wire = packCassiniBody({
		callUuid: "c5cd3923-5d89-45d6-a0bf-e8175e0c7757",
		msgTypeName: "exchange_app_str_data",
		jsonParams: '{"csv":1}',
		deviceInfo: "Android..36..Pixel 6a",
	});
	const back = unpackCassiniBody(wire);
	assertEquals(back.callUuid, "c5cd3923-5d89-45d6-a0bf-e8175e0c7757");
	assertEquals(back.msgTypeName, "exchange_app_str_data");
	assertEquals(back.jsonParams, '{"csv":1}');
});

Deno.test("buildSetupReq emits an envelope with STATE-class body tag (= 4)", () => {
	const session: CassiniSession = {
		fromMid: "uc84586474703a6172e9d051eabbcb627",
		callUuid16: new Uint8Array(16),
		callUuidString: "c5cd3923-5d89-45d6-a0bf-e8175e0c7757",
		subscriptionId: 290579788n,
		sessionId: 7642030284661133203n,
	};
	const back = unpackCassini(buildSetupReq({
		session,
		msgId: 1,
		counter: 1n,
		deviceInfo: "linejs",
	}));
	assertEquals(back.bodyTag, ENVELOPE_BODY_TAG.STATE);
	assertEquals(unpackCassiniBody(back.body).msgTypeName, "setup_req");
});

Deno.test("buildExchangeAppStrData uses CONTROL-class body tag (= 3)", () => {
	const session: CassiniSession = {
		fromMid: "u1", callUuid16: new Uint8Array(16),
		callUuidString: "uuid", subscriptionId: 1n, sessionId: 1n,
	};
	const back = unpackCassini(buildExchangeAppStrData({
		session, msgId: 1, counter: 1n, json: '{"csv":1}',
	}));
	assertEquals(back.bodyTag, ENVELOPE_BODY_TAG.CONTROL);
});

Deno.test("buildRelReq uses CONTROL-class body tag", () => {
	const session: CassiniSession = {
		fromMid: "u1", callUuid16: new Uint8Array(16),
		callUuidString: "uuid", subscriptionId: 1n, sessionId: 1n,
	};
	const back = unpackCassini(buildRelReq({ session, msgId: 1, counter: 1n, reason: "x" }));
	assertEquals(back.bodyTag, ENVELOPE_BODY_TAG.CONTROL);
	assertEquals(unpackCassiniBody(back.body).msgTypeName, "rel_req");
});
