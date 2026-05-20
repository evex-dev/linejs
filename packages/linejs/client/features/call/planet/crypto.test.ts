import { assertEquals, assertNotEquals } from "@std/assert";
import {
	buildIv,
	decodeMpKey,
	decryptCtr,
	deriveSessionKeys,
	encryptCtr,
	hmacTag,
	sha256,
	tagEquals,
} from "./crypto.ts";

Deno.test("decodeMpKey decodes the captured LINE mpkey", () => {
	// From a real CallRoute.commParam.mpkey captured during a tom-call.
	// 44 base64 chars (no padding) = 33 raw bytes.
	const b64 = "AhLRU30XuXFenT3Z8ZapU+2YPTPzrYA2ZObDqRzy+hr3";
	const raw = decodeMpKey(b64);
	assertEquals(raw.length, 33);
	assertEquals(raw[0], 0x02);
	assertEquals(raw[1], 0x12);
	assertEquals(raw[2], 0xd1);
});

Deno.test("deriveSessionKeys produces stable, distinct enc/mac/iv material", () => {
	const mp = decodeMpKey("AhLRU30XuXFenT3Z8ZapU+2YPTPzrYA2ZObDqRzy+hr3");
	const a = deriveSessionKeys(mp, "uA", "uB");
	const b = deriveSessionKeys(mp, "uA", "uB");
	// deterministic
	assertEquals(a.encKey, b.encKey);
	assertEquals(a.macKey, b.macKey);
	assertEquals(a.ivPrefix, b.ivPrefix);
	// distinct
	assertNotEquals(a.encKey, a.macKey);
	const c = deriveSessionKeys(mp, "uB", "uA");
	assertNotEquals(a.encKey, c.encKey);
});

Deno.test("AES-256-CTR roundtrip with derived keys", () => {
	const mp = decodeMpKey("AhLRU30XuXFenT3Z8ZapU+2YPTPzrYA2ZObDqRzy+hr3");
	const keys = deriveSessionKeys(mp, "uA", "uB");
	const plain = new TextEncoder().encode("hello PLANET wire");
	const iv = buildIv(keys.ivPrefix, 0x1d5);
	const ct = encryptCtr(keys.encKey, iv, plain);
	assertNotEquals(ct, plain);
	const pt = decryptCtr(keys.encKey, iv, ct);
	assertEquals(pt, plain);
});

Deno.test("buildIv increments the trailing 4 bytes with the sequence", () => {
	const prefix = new Uint8Array(12).fill(0xaa);
	const a = buildIv(prefix, 0);
	const b = buildIv(prefix, 1);
	assertEquals(a[15], 0x00);
	assertEquals(b[15], 0x01);
	// first 12 bytes identical
	for (let i = 0; i < 12; i++) assertEquals(a[i], b[i]);
});

Deno.test("hmacTag is deterministic and depends on key + data", () => {
	const k1 = new Uint8Array(32).fill(0x11);
	const k2 = new Uint8Array(32).fill(0x22);
	const d = new TextEncoder().encode("frame");
	assertEquals(hmacTag(k1, d), hmacTag(k1, d));
	assertNotEquals(hmacTag(k1, d), hmacTag(k2, d));
	assertEquals(hmacTag(k1, d).length, 16);
});

Deno.test("tagEquals is constant-time", () => {
	const a = new Uint8Array([1, 2, 3, 4]);
	const b = new Uint8Array([1, 2, 3, 4]);
	const c = new Uint8Array([1, 2, 3, 5]);
	assertEquals(tagEquals(a, b), true);
	assertEquals(tagEquals(a, c), false);
});

Deno.test("sha256 matches well-known vector", () => {
	const empty = sha256(new Uint8Array(0));
	const expected =
		"e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
	assertEquals(
		[...empty].map((b) => b.toString(16).padStart(2, "0")).join(""),
		expected,
	);
});
