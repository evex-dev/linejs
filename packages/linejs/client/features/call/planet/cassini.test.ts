import { assertEquals } from "@std/assert";
import {
	buildRelReq,
	buildSetupReq,
	CASSINI_MSG,
	packCassini,
	SETUP_TAG,
	unpackCassini,
} from "./cassini.ts";

Deno.test("packCassini + unpackCassini roundtrip", () => {
	const wire = packCassini({
		cls: 0,
		type: CASSINI_MSG.SETUP,
		msgId: 0x1d5,
		userId: "uc84586474703a6172e9d051eabbcb627",
	}, [
		{ tag: 0x01, value: new Uint8Array([1, 2, 3]) },
		{ tag: 0x02, value: new Uint8Array([4, 5, 6, 7, 8]) },
	]);
	const { hdr, tlvs } = unpackCassini(wire);
	assertEquals(hdr.cls, 0);
	assertEquals(hdr.type, CASSINI_MSG.SETUP);
	assertEquals(hdr.msgId, 0x1d5);
	assertEquals(hdr.userId, "uc84586474703a6172e9d051eabbcb627");
	assertEquals(tlvs.length, 2);
	assertEquals(tlvs[0].tag, 0x01);
	assertEquals(tlvs[0].value, new Uint8Array([1, 2, 3]));
	assertEquals(tlvs[1].tag, 0x02);
	assertEquals(tlvs[1].value, new Uint8Array([4, 5, 6, 7, 8]));
});

Deno.test("buildSetupReq emits a parseable SETUP message", () => {
	const sdp = new TextEncoder().encode("v=0\r\nm=audio 0 RTP/SAVP 96\r\n");
	const wire = buildSetupReq({
		msgId: 0x1d5,
		fromMid: "uc84586474703a6172e9d051eabbcb627",
		toMid: "u9dfba8dc9529aeb6063ee013a5933184",
		callType: "AUDIO",
		fromToken: "mexhVpNEQt",
		sdpOffer: sdp,
		capabilities: ["STT"],
	});
	const { hdr, tlvs } = unpackCassini(wire);
	assertEquals(hdr.type, CASSINI_MSG.SETUP);
	assertEquals(hdr.userId, "uc84586474703a6172e9d051eabbcb627");
	const peer = tlvs.find((t) => t.tag === SETUP_TAG.PEER_MID);
	assertEquals(new TextDecoder().decode(peer!.value), "u9dfba8dc9529aeb6063ee013a5933184");
	const callType = tlvs.find((t) => t.tag === SETUP_TAG.CALL_TYPE);
	assertEquals(callType!.value, new Uint8Array([1])); // AUDIO
	const tok = tlvs.find((t) => t.tag === SETUP_TAG.FROM_TOKEN);
	assertEquals(new TextDecoder().decode(tok!.value), "mexhVpNEQt");
});

Deno.test("buildRelReq emits a REL with the given reason", () => {
	const wire = buildRelReq({ msgId: 99, fromMid: "uX", reason: "user-ended" });
	const { hdr, tlvs } = unpackCassini(wire);
	assertEquals(hdr.type, CASSINI_MSG.REL);
	assertEquals(hdr.msgId, 99);
	assertEquals(new TextDecoder().decode(tlvs[0].value), "user-ended");
});
