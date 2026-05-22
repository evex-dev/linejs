import { assertEquals } from "@std/assert";
import {
	CC_MSG,
	decodeCcConnReq,
	decodeCcConnRsp,
	decodeCcInfoReq,
	decodeCcInfoRsp,
	decodeCcSetupRsp,
	decodeFields,
	decodeNativeSetupOffer,
	decodePlanetMsg,
	decodeVarint,
	encodeVarint,
	packCcConnReq,
	packCcConnRsp,
	packCcInfoReq,
	packCcInfoRsp,
	packCcRelReq,
	packCcSetupReq,
	packCcSetupRsp,
	packKeepaliveReq,
	packNativeSetupOffer,
	packPlanetCcHdr,
	packPlanetCcMsg,
	packPlanetFeatureRegister,
	packPlanetMsg,
	packPlanetMsgHdr,
	packPlanetScMsgKaReq,
	packPlanetUserAgent,
	WireType,
	wrapCcMsg,
} from "./schema.ts";

Deno.test("packPlanetMsgHdr matches an observed 96-byte header shape", () => {
	// Reproduce an observed msg_pack header shape without account-specific
	// identifiers.
	const expected = new Uint8Array([
		// field 1 (user_id, 33B str)
		0x0a,
		0x21,
		...new TextEncoder().encode("u00000000000000000000000000000000"),
		// field 2 (msg_id varint = 4353)
		0x10,
		0x81,
		0x22,
		// field 3 (sess_id 16B)
		0x1a,
		0x10,
		0xb0,
		0xc2,
		0xa7,
		0x4c,
		0xe7,
		0xcd,
		0x45,
		0x02,
		0xa0,
		0xfa,
		0x32,
		0x58,
		0x6d,
		0xa9,
		0x0e,
		0x54,
		// field 4 (tran_id 16B)
		0x22,
		0x10,
		0xfc,
		0x4e,
		0xd0,
		0x77,
		0xd5,
		0xe2,
		0x41,
		0x75,
		0xab,
		0x59,
		0x6e,
		0xda,
		0x73,
		0x51,
		0xcb,
		0xe3,
		// field 5 (tran_seq varint = 797128754)
		0x28,
		0xb2,
		0xf0,
		0x8c,
		0xfc,
		0x02,
		// field 6 (loc_nonce varint = 290579788)
		0x30,
		0xcc,
		0xca,
		0xc7,
		0x8a,
		0x01,
		// field 7 (rmt_nonce varint = 7642030284661133203)
		0x38,
		0x93,
		0x9f,
		0x84,
		0x80,
		0xe0,
		0xc1,
		0xfc,
		0x86,
		0x6a,
	]);
	const got = packPlanetMsgHdr({
		userId: "u00000000000000000000000000000000",
		msgId: 4353,
		sessId: expected.subarray(40, 56),
		tranId: expected.subarray(58, 74),
		tranSeq: 797128754,
		locNonce: 290579788n,
		rmtNonce: 7642030284661133203n,
	});
	assertEquals(got, expected);
});

Deno.test("decodeFields parses the captured header into the expected fields", () => {
	const captured = new Uint8Array([
		0x0a,
		0x21,
		...new TextEncoder().encode("u00000000000000000000000000000000"),
		0x10,
		0x81,
		0x22,
		0x1a,
		0x10,
		0xb0,
		0xc2,
		0xa7,
		0x4c,
		0xe7,
		0xcd,
		0x45,
		0x02,
		0xa0,
		0xfa,
		0x32,
		0x58,
		0x6d,
		0xa9,
		0x0e,
		0x54,
		0x22,
		0x10,
		0xfc,
		0x4e,
		0xd0,
		0x77,
		0xd5,
		0xe2,
		0x41,
		0x75,
		0xab,
		0x59,
		0x6e,
		0xda,
		0x73,
		0x51,
		0xcb,
		0xe3,
		0x28,
		0xb2,
		0xf0,
		0x8c,
		0xfc,
		0x02,
		0x30,
		0xcc,
		0xca,
		0xc7,
		0x8a,
		0x01,
		0x38,
		0x93,
		0x9f,
		0x84,
		0x80,
		0xe0,
		0xc1,
		0xfc,
		0x86,
		0x6a,
	]);
	const f = decodeFields(captured);
	assertEquals(f.length, 7);
	assertEquals(
		new TextDecoder().decode(f[0].value as Uint8Array),
		"u00000000000000000000000000000000",
	);
	assertEquals(f[1].value, 4353n);
	assertEquals((f[2].value as Uint8Array).length, 16);
	assertEquals((f[3].value as Uint8Array).length, 16);
	assertEquals(f[4].value, 797128754n);
	assertEquals(f[5].value, 290579788n);
	assertEquals(f[6].value, 7642030284661133203n);
});

Deno.test("packCcSetupReq emits initiator + responder + svc_key in tag order", () => {
	const wire = packCcSetupReq({
		initiator: "uA",
		responder: "uB",
		svcKey: "BASE64PUBKEY==",
		credential: new Uint8Array([1, 2, 3]),
	});
	const fields = decodeFields(wire);
	const byTag = new Map(fields.map((f) => [f.tag, f]));
	assertEquals(
		new TextDecoder().decode(byTag.get(1)!.value as Uint8Array),
		"uA",
	);
	assertEquals(
		new TextDecoder().decode(byTag.get(2)!.value as Uint8Array),
		"uB",
	);
	assertEquals(
		new TextDecoder().decode(byTag.get(12)!.value as Uint8Array),
		"BASE64PUBKEY==",
	);
	assertEquals(byTag.get(10)!.value, new Uint8Array([1, 2, 3]));
});

Deno.test("packCcSetupRsp round-trips setup response fields", () => {
	const wire = packCcSetupRsp({
		result: 0,
		aliveRptInterval: 5,
		noAnsToSec: 30,
		svcId: "svc",
		tgtSvcId: "target",
		interDomain: true,
	});
	const decoded = decodeCcSetupRsp(wire);
	assertEquals(decoded.result, 0);
	assertEquals(decoded.aliveRptInterval, 5);
	assertEquals(decoded.noAnsToSec, 30);
	assertEquals(decoded.svcId, "svc");
	assertEquals(decoded.tgtSvcId, "target");
	assertEquals(decoded.interDomain, true);
});

Deno.test("packPlanetUserAgent emits the native Android UA field layout", () => {
	const wire = packPlanetUserAgent({
		osName: "Android",
		osVersion: "36",
		deviceName: "Pixel 6a",
		appVersion: "12.1.13-63078245f",
		engineVersion: "8.2.0-694e2367",
		appReleaseInfo: "ANDROID\t26.6.2\tAndroid OS\t16",
		manufacturer: "google",
	});
	const fields = decodeFields(wire);
	assertEquals(fields.map((f) => f.tag), [1, 2, 3, 5, 6, 7, 8]);
	assertEquals(
		new TextDecoder().decode(fields[0].value as Uint8Array),
		"Android",
	);
	assertEquals(
		new TextDecoder().decode(fields[2].value as Uint8Array),
		"Pixel 6a",
	);
	assertEquals(
		new TextDecoder().decode(fields[6].value as Uint8Array),
		"google",
	);
});

Deno.test("packPlanetFeatureRegister matches captured feature records", () => {
	assertEquals(
		packPlanetFeatureRegister(16, true, 0),
		new Uint8Array([0x08, 0x10, 0x10, 0x01, 0x18, 0x00]),
	);
	assertEquals(
		packPlanetFeatureRegister(17, false, 0),
		new Uint8Array([0x08, 0x11, 0x10, 0x00, 0x18, 0x00]),
	);
	assertEquals(
		packPlanetFeatureRegister(0, false, 0),
		new Uint8Array([0x08, 0x00, 0x10, 0x00, 0x18, 0x00]),
	);
});

Deno.test("packNativeSetupOffer emits the 311-byte native media offer shape", () => {
	const pub = new Uint8Array(33);
	pub[0] = 0x02;
	for (let i = 1; i < pub.length; i++) pub[i] = i;
	const nonce = new Uint8Array(16);
	for (let i = 0; i < nonce.length; i++) nonce[i] = 0xa0 + i;
	const secret = new Uint8Array(30);
	for (let i = 0; i < secret.length; i++) secret[i] = 0xc0 + i;

	const offer = packNativeSetupOffer({
		mediaPubKey: pub,
		mediaKeyId: 0x572ff1a1,
		mediaNonce: nonce,
		mediaSecret: secret,
	});
	assertEquals(offer.length, 311);
	const top = decodeFields(offer);
	assertEquals(top.map((f) => f.tag), [1, 1, 1, 2, 2, 3]);
	assertEquals(top.map((f) => (f.value as Uint8Array).length), [
		74,
		79,
		47,
		61,
		34,
		4,
	]);

	const names = top.slice(0, 3).map((f) => {
		const media = decodeFields(f.value as Uint8Array);
		const codec = decodeFields(media[0].value as Uint8Array);
		return new TextDecoder().decode(codec[0].value as Uint8Array);
	});
	assertEquals(names, ["A", "V", "D"]);

	const securityA = decodeFields(top[3].value as Uint8Array);
	const securityAInner = decodeFields(securityA[0].value as Uint8Array);
	assertEquals(securityA[0].tag, 3);
	assertEquals(securityAInner[0].value, pub);
	assertEquals(securityAInner[1].value, 0x572ff1a1n);
	assertEquals(securityAInner[2].value, nonce);

	const securityB = decodeFields(top[4].value as Uint8Array);
	const securityBInner = decodeFields(securityB[0].value as Uint8Array);
	assertEquals(securityB[0].tag, 2);
	assertEquals(securityBInner[0].value, secret);

	const decoded = decodeNativeSetupOffer(offer);
	assertEquals(decoded.media.map((m) => m.name), ["A", "V", "D"]);
	assertEquals(decoded.media.map((m) => m.rtpPort), [101, 111, 121]);
	assertEquals(decoded.mediaPubKey, pub);
	assertEquals(decoded.mediaKeyId, 0x572ff1a1);
	assertEquals(decoded.mediaNonce, nonce);
	assertEquals(decoded.mediaSecret, secret);
	assertEquals(decoded.version, { major: 0, mode: 3 });
});

Deno.test("wrapCcMsg/packPlanetCcMsg/packPlanetMsg nest a SETUP_REQ properly", () => {
	const setup = packCcSetupReq({ initiator: "uA", responder: "uB" });
	const ccBody = wrapCcMsg(CC_MSG.SETUP_REQ, setup);
	const ccMsg = packPlanetCcMsg(
		{ cid: "call-001", srcChanId: 1n, dstChanId: 2n },
		ccBody,
	);
	const wire = packPlanetMsg(
		{
			userId: "uA",
			msgId: 1,
			sessId: new Uint8Array(16),
			tranId: new Uint8Array(16),
			tranSeq: 1,
			locNonce: 0n,
			rmtNonce: 0n,
		},
		{ kind: "cc", data: ccMsg },
	);
	// Outer must have field 1 (hdr) and field 3 (cc_msg as bytes)
	const outerFields = decodeFields(wire);
	assertEquals(outerFields[0].tag, 1);
	assertEquals(outerFields[1].tag, 3);
});

Deno.test("decodePlanetMsg unwraps cc setup_rsp", () => {
	const setupRsp = new Uint8Array([
		0x08,
		0x00, // result = 0
		0xa8,
		0x06,
		0x1e, // alive_rpt_interval = 30
		0x80,
		0x07,
		0x78, // no_ans_to_sec = 120
	]);
	const ccMsg = packPlanetCcMsg(
		{ cid: "call-001", srcChanId: 1n, dstChanId: 2n },
		wrapCcMsg(CC_MSG.SETUP_RSP, setupRsp),
	);
	const wire = packPlanetMsg(
		{
			userId: "uB",
			msgId: 2,
			sessId: new Uint8Array(16).fill(0xaa),
			tranId: new Uint8Array(16).fill(0xbb),
			tranSeq: 3,
			locNonce: 4n,
			rmtNonce: 5n,
		},
		{ kind: "cc", data: ccMsg },
	);

	const decoded = decodePlanetMsg(wire);
	assertEquals(decoded.hdr?.msgId, 2);
	assertEquals(decoded.hdr?.sessId, new Uint8Array(16).fill(0xaa));
	assertEquals(decoded.cc?.hdr?.cid, "call-001");
	assertEquals(decoded.cc?.bodyTag, CC_MSG.SETUP_RSP);
	assertEquals(decoded.cc?.bodyName, "setup_rsp");
	assertEquals(decodeCcSetupRsp(decoded.cc!.bodyBytes!).aliveRptInterval, 30);
	assertEquals(decodeCcSetupRsp(decoded.cc!.bodyBytes!).noAnsToSec, 120);
});

Deno.test("packCcConnReq/packCcConnRsp round-trip answered-call media fields", () => {
	const answer = new Uint8Array([1, 2, 3]);
	const ua = packPlanetUserAgent({
		osName: "Android",
		osVersion: "36",
		deviceName: "Pixel 6a",
	});
	const req = packCcConnReq({
		answer,
		mChanId: 0x11223344n,
		netType: 1,
		unavailToSec: 120,
		oCapas: [1, 2, 7],
		features: [packPlanetFeatureRegister(16, true, 0)],
		ua,
		mAddr: { ver: 4, trpt: 1, ip: "203.0.113.10", port: 12345 },
		reqRec: false,
	});
	const decodedReq = decodeCcConnReq(req);
	assertEquals(decodedReq.answer, answer);
	assertEquals(decodedReq.mChanId, 0x11223344n);
	assertEquals(decodedReq.netType, 1);
	assertEquals(decodedReq.unavailToSec, 120);
	assertEquals(decodedReq.oCapas, [1, 2, 7]);
	assertEquals(decodedReq.features.length, 1);
	assertEquals(decodedReq.ua, ua);
	assertEquals(decodedReq.mAddr, {
		ver: 4,
		trpt: 1,
		ip: "203.0.113.10",
		ports: undefined,
		port: 12345,
	});
	assertEquals(decodedReq.reqRec, false);

	const rsp = packCcConnRsp({
		result: 0,
		mChanId: 0x55667788n,
		netType: 1,
		unavailToSec: 120,
		ua,
	});
	const decodedRsp = decodeCcConnRsp(rsp);
	assertEquals(decodedRsp.result, 0);
	assertEquals(decodedRsp.mChanId, 0x55667788n);
	assertEquals(decodedRsp.netType, 1);
	assertEquals(decodedRsp.unavailToSec, 120);
	assertEquals(decodedRsp.ua, ua);
});

Deno.test("packCcInfoReq/packCcInfoRsp round-trip info exchange fields", () => {
	const body = new Uint8Array([1, 2, 3]);
	const ue = new Uint8Array([4, 5]);
	const req = packCcInfoReq({
		bodyType: "profile",
		body,
		targets: ["callee"],
		source: "caller",
		sourceSvcId: "freecall.audio",
		tgtUe: [ue],
		trxOrigin: "origin",
		svcId: "svc",
		tgtSvcId: "target",
		interDomain: false,
	});
	const decodedReq = decodeCcInfoReq(req);
	assertEquals(decodedReq.bodyType, "profile");
	assertEquals(decodedReq.body, body);
	assertEquals(decodedReq.targets, ["callee"]);
	assertEquals(decodedReq.source, "caller");
	assertEquals(decodedReq.sourceSvcId, "freecall.audio");
	assertEquals(decodedReq.tgtUe, [ue]);
	assertEquals(decodedReq.trxOrigin, "origin");
	assertEquals(decodedReq.svcId, "svc");
	assertEquals(decodedReq.tgtSvcId, "target");
	assertEquals(decodedReq.interDomain, false);

	const rsp = packCcInfoRsp({
		result: 0,
		bodyType: "profile",
		body,
		svcId: "svc",
		tgtSvcId: "target",
		interDomain: true,
	});
	const decodedRsp = decodeCcInfoRsp(rsp);
	assertEquals(decodedRsp.result, 0);
	assertEquals(decodedRsp.bodyType, "profile");
	assertEquals(decodedRsp.body, body);
	assertEquals(decodedRsp.svcId, "svc");
	assertEquals(decodedRsp.tgtSvcId, "target");
	assertEquals(decodedRsp.interDomain, true);
});

Deno.test("packCcRelReq matches the observed local-hangup field shape", () => {
	const wire = packCcRelReq({
		relCode: 2,
		releaser: "initiator",
		commMediaFlags: 1,
	});
	const fields = decodeFields(wire);
	assertEquals(
		fields.map((f) => [f.tag, f.wireType]),
		[
			[1, WireType.Varint],
			[3, WireType.LengthDelim],
			[4, WireType.Varint],
		],
	);
	assertEquals(fields[0].value, 2n);
	assertEquals(
		new TextDecoder().decode(fields[1].value as Uint8Array),
		"initiator",
	);
	assertEquals(fields[2].value, 1n);
});

Deno.test("packKeepaliveReq produces the captured msg #1 body (13 bytes)", () => {
	// captured ka_req inner body was `09 80 ee 7a 46 dc 56 b1 18 10 00`
	const ts = 0x18b156dc467aee80n;
	const inner = packKeepaliveReq(ts, false);
	assertEquals(
		inner,
		new Uint8Array([
			0x09,
			0x80,
			0xee,
			0x7a,
			0x46,
			0xdc,
			0x56,
			0xb1,
			0x18,
			0x10,
			0x00,
		]),
	);
	const decoded = decodeFields(inner);
	assertEquals(decoded[0].tag, 1);
	assertEquals(decoded[0].wireType, WireType.Fixed64);
	assertEquals(decoded[0].value, ts);
	assertEquals(decoded[1].tag, 2);
	assertEquals(decoded[1].value, 0n);
});

Deno.test("extractRmtNonceFromReply pulls loc_nonce (field 6) out", async () => {
	const { extractRmtNonceFromReply, packPlanetMsgHdr } = await import(
		"./schema.ts"
	);
	// Build a reply header where the server's loc_nonce = 0x6a0e122c0e9d22ac
	const expected = 0x6a0e122c0e9d22acn;
	const hdr = packPlanetMsgHdr({
		userId: "u11111111111111111111111111111111",
		msgId: 1,
		sessId: new Uint8Array(16).fill(0xaa),
		tranId: new Uint8Array(16).fill(0xbb),
		tranSeq: 1,
		locNonce: expected, // cscf's local nonce — what becomes OUR rmt_nonce
		rmtNonce: 199820756n, // cscf knows our loc_nonce → echoes it back
	});
	const recovered = extractRmtNonceFromReply(hdr);
	assertEquals(recovered, expected);
});

Deno.test("encodeVarint matches well-known protobuf encodings", () => {
	assertEquals(encodeVarint(150), new Uint8Array([0x96, 0x01]));
	assertEquals(encodeVarint(4353), new Uint8Array([0x81, 0x22]));
	const [v, n] = decodeVarint(encodeVarint(7642030284661133203n), 0);
	assertEquals(v, 7642030284661133203n);
	assertEquals(n, 9);
});
