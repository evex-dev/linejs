import { assertEquals } from "@std/assert";
import {
	buildExchangeAppStrData,
	buildRelReq,
	buildSetupReq,
	decodePb,
	decodeVarint,
	encodePb,
	encodeVarint,
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
		const encoded = encodeVarint(v);
		const [decoded, len] = decodeVarint(encoded, 0);
		assertEquals(Number(decoded), v);
		assertEquals(len, encoded.length);
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
	assertEquals(back[0].tag, 1);
	assertEquals(back[1].tag, 2);
	assertEquals(back[1].value, 42n);
	assertEquals(back[2].value, fields[2].value);
});

Deno.test("Cassini envelope roundtrip", () => {
	const hdr = {
		userId: "uc84586474703a6172e9d051eabbcb627",
		msgId: 0x1d5,
		uuid: new Uint8Array(16).fill(0xab),
		userPub: new Uint8Array(33).fill(0x02),
		createdAtMs: 1779_000_000_000n,
	};
	const body = packCassiniBody({
		callUuid: "c5cd3923-5d89-45d6-a0bf-e8175e0c7757",
		msgTypeName: "setup_req",
	});
	const wire = packCassini({ header: hdr, body });
	const back = unpackCassini(wire);
	assertEquals(back.header.userId, hdr.userId);
	assertEquals(back.header.msgId, hdr.msgId);
	assertEquals(back.header.uuid, hdr.uuid);
	assertEquals(back.header.userPub, hdr.userPub);
});

Deno.test("Captured msg_pack header bytes parse back correctly", () => {
	// First 0x60 bytes of the captured msg_pack#1 wire (the header
	// portion preceded by the outer 0x0a 0x60 framing).
	const hdrBytes = new Uint8Array([
		// field 1 (0x0a) user_id 0x21 bytes
		0x0a, 0x21,
		// "uc84586474703a6172e9d051eabbcb627" (33 chars)
		...new TextEncoder().encode("uc84586474703a6172e9d051eabbcb627"),
		// field 2 (0x10) varint 0x81 0x22 = 4353
		0x10, 0x81, 0x22,
		// field 3 (0x1a) uuid 0x10 bytes
		0x1a, 0x10,
		0xb0, 0xc2, 0xa7, 0x4c, 0xe7, 0xcd, 0x45, 0x02,
		0xa0, 0xfa, 0x32, 0x58, 0x6d, 0xa9, 0x0e, 0x54,
		// field 4 (0x22) userPub 0x21 bytes (33 = SEC1 compressed P-256)
		0x22, 0x21,
		0x0f, 0xc4, 0xed, 0x07, 0x7d, 0x5e, 0x24, 0x17,
		0x5a, 0xb5, 0x96, 0xed, 0xa7, 0x35, 0x1c, 0xbe,
		0x32, 0x8b, 0x2f, 0x08, 0xcf, 0xc0, 0x23, 0x0c,
		0xcc, 0xac, 0x78, 0xa0, 0x13, 0x89, 0x39, 0xf8,
		0x48,
	]);
	const parts = decodePb(hdrBytes);
	const userId = new TextDecoder().decode(parts[0].value as Uint8Array);
	assertEquals(userId, "uc84586474703a6172e9d051eabbcb627");
	assertEquals(Number(parts[1].value), 4353);
	assertEquals((parts[2].value as Uint8Array).length, 16);
	assertEquals((parts[3].value as Uint8Array).length, 33);
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

Deno.test("buildSetupReq + buildExchangeAppStrData + buildRelReq all parse back", () => {
	const common = {
		fromMid: "uc84586474703a6172e9d051eabbcb627",
		msgId: 0x1d5,
		uuid: new Uint8Array(16).fill(0x77),
		userPub: new Uint8Array(33),
		callUuid: "c5cd3923-5d89-45d6-a0bf-e8175e0c7757",
	};
	common.userPub[0] = 0x02;
	const setup = unpackCassini(buildSetupReq({ ...common, deviceInfo: "Android..36..Pixel 6a" }));
	assertEquals(setup.header.userId, common.fromMid);
	const exchange = unpackCassini(
		buildExchangeAppStrData({ ...common, json: '{"csv":1}' }),
	);
	assertEquals(unpackCassiniBody(exchange.body).msgTypeName, "exchange_app_str_data");
	const rel = unpackCassini(buildRelReq({ ...common, reason: "user-ended" }));
	assertEquals(unpackCassiniBody(rel.body).msgTypeName, "rel_req");
});
