import { assert, test } from "vite-plus/test";
import {
	CompactMessageProtocolError,
	decodeCompactMessageResponse,
	encodeCompactText,
	packCompactE2EEMessage,
	packCompactPlainMessage,
	writeCompactI32,
	writeCompactI64,
} from "./compact.ts";

function hex(data: Uint8Array): string {
	return Array.from(data)
		.map((v) => v.toString(16).padStart(2, "0"))
		.join("");
}

test("encodeCompactText chooses UTF-8 with BOM for ASCII", () => {
	assert.deepEqual(hex(encodeCompactText("hello")), "efbbbf68656c6c6f");
});

test("encodeCompactText chooses UTF-16LE with BOM when shorter", () => {
	assert.deepEqual(hex(encodeCompactText("あ")), "fffe4230");
});

test("packCompactPlainMessage writes type, MID type, seq, MID bytes, text, and suffix", () => {
	const mid = "u" + "00".repeat(16);
	const packed = packCompactPlainMessage(0, mid, "hi");
	assert.deepEqual(hex(packed), "02" + "00" + "00" + "00".repeat(16) + "05" + "efbbbf6869" + "00");
});

test("packCompactE2EEMessage writes E2EE version, binary chunks, and compact key ids", () => {
	const mid = "c" + "11".repeat(16);
	const salt = Uint8Array.from(Array.from({ length: 16 }, (_, i) => i));
	const message = Uint8Array.from([0xaa, 0xbb, 0xcc]);
	const nonce = Uint8Array.from(Array.from({ length: 12 }, () => 0x22));
	const senderKeyId = Uint8Array.from([0x00, 0x00, 0x00, 0x96]);
	const receiverKeyId = Uint8Array.from([0xff, 0xff, 0xff, 0xff]);
	const packed = packCompactE2EEMessage(1, mid, [salt, message, nonce, senderKeyId, receiverKeyId]);
	assert.deepEqual(
		hex(packed),
		"05" +
			"02" +
			"02" +
			"11".repeat(16) +
			"02" +
			"10" +
			hex(salt) +
			"03aabbcc" +
			"0c" +
			"22".repeat(12) +
			"ac02" +
			"01",
	);
});

test("decodeCompactMessageResponse reads success body", () => {
	const body: number[] = [1];
	writeCompactI32(body, 7);
	writeCompactI64(body, 1234567890123n);
	writeCompactI64(body, 1710000000000n);
	const decoded = decodeCompactMessageResponse(Uint8Array.from(body));
	assert.deepEqual(decoded, {
		sequenceId: 7,
		messageId: 1234567890123n,
		createdTime: 1710000000,
	});
});

test("decodeCompactMessageResponse throws compact error code", () => {
	const body: number[] = [2];
	writeCompactI32(body, 82);
	const error = assert.throws(() => decodeCompactMessageResponse(Uint8Array.from(body)));
	assert.instanceOf(error, CompactMessageProtocolError);
	assert.deepEqual(error.code, 82);
});
