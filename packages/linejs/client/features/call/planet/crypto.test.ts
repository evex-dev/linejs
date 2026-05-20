import { assertEquals, assertNotEquals } from "@std/assert";
import {
	aesCtrDecrypt,
	aesCtrEncrypt,
	buildCtrIv,
	buildDirectionTag,
	decodeMpKey,
	deriveCallKeys,
	ecdh,
	generateEphemeralKeypair,
	hmacTag,
	planetHkdfStage1,
	planetHkdfStage2,
	sha256,
	tagEquals,
} from "./crypto.ts";

Deno.test("decodeMpKey extracts the 33-byte SEC1 P-256 pubkey", () => {
	const b64 = "AhLRU30XuXFenT3Z8ZapU+2YPTPzrYA2ZObDqRzy+hr3";
	const k = decodeMpKey(b64);
	assertEquals(k.length, 33);
	assertEquals(k[0], 0x02); // parity byte
});

Deno.test("decodeMpKey rejects wrong length", () => {
	let threw = false;
	try {
		decodeMpKey(btoa("short"));
	} catch (_e) {
		threw = true;
	}
	assertEquals(threw, true);
});

Deno.test("ECDH roundtrip — two parties get the same shared secret", () => {
	const a = generateEphemeralKeypair();
	const b = generateEphemeralKeypair();
	const sA = ecdh(a.privateKey, b.publicKey);
	const sB = ecdh(b.privateKey, a.publicKey);
	assertEquals(sA, sB);
	assertEquals(sA.length, 32);
});

Deno.test("Stage-1 HKDF is deterministic and matches expected output length", () => {
	const ecdhSecret = new Uint8Array(32).fill(0xab);
	const our = new Uint8Array(33);
	our[0] = 0x02;
	const peer = new Uint8Array(33);
	peer[0] = 0x03;
	const out1 = planetHkdfStage1(ecdhSecret, our, peer);
	const out2 = planetHkdfStage1(ecdhSecret, our, peer);
	assertEquals(out1.length, 64);
	assertEquals(out1, out2);
	// Swapping pubkeys produces a different output
	const out3 = planetHkdfStage1(ecdhSecret, peer, our);
	assertNotEquals(out1, out3);
});

Deno.test("Stage-2 HKDF carves four distinct material slices", () => {
	const stage1 = new Uint8Array(64).fill(0x77);
	const sid = new Uint8Array(16).fill(0xcc);
	const dt = buildDirectionTag(0x329aba33);
	const keys = planetHkdfStage2(stage1, sid, dt);
	assertEquals(keys.encKey.length, 32);
	assertEquals(keys.macKey.length, 32);
	assertEquals(keys.ivNonce.length, 16);
	assertEquals(keys.reserve.length, 48);
	assertNotEquals(keys.encKey, keys.macKey);
	assertNotEquals(keys.ivNonce, keys.macKey);
});

Deno.test("buildDirectionTag matches observed wire (0x329aba33 -> 32 9a ba 33 00 00 00 00)", () => {
	const t = buildDirectionTag(0x329aba33);
	assertEquals(
		t,
		new Uint8Array([0x32, 0x9a, 0xba, 0x33, 0x00, 0x00, 0x00, 0x00]),
	);
});

Deno.test("buildCtrIv composes 12-byte nonce + 4-byte counter", () => {
	const nonce = new Uint8Array(16).fill(0xaa);
	const iv = buildCtrIv(nonce, 0x0102);
	assertEquals(iv.length, 16);
	for (let i = 0; i < 12; i++) assertEquals(iv[i], 0xaa);
	assertEquals(iv[12], 0x00);
	assertEquals(iv[13], 0x00);
	assertEquals(iv[14], 0x01);
	assertEquals(iv[15], 0x02);
});

Deno.test("AES-256-CTR roundtrip + tag check", () => {
	const key = new Uint8Array(32).fill(0x55);
	const iv = new Uint8Array(16).fill(0x11);
	const plain = new TextEncoder().encode("hello PLANET cassini");
	const ct = aesCtrEncrypt(key, iv, plain);
	assertNotEquals(ct, plain);
	const pt = aesCtrDecrypt(key, iv, ct);
	assertEquals(pt, plain);
	const tag1 = hmacTag(new Uint8Array(32).fill(0xaa), ct);
	const tag2 = hmacTag(new Uint8Array(32).fill(0xaa), ct);
	assertEquals(tagEquals(tag1, tag2), true);
});

Deno.test("deriveCallKeys produces a full bidirectional key set", () => {
	const local = generateEphemeralKeypair();
	const peer = generateEphemeralKeypair();
	const keys = deriveCallKeys({
		mpkey: peer.publicKey,
		local,
		sessionId: new Uint8Array(16).fill(0x77),
		sendLabel: 0x329aba33,
		recvLabel: 0x8bd74aaa,
	});
	assertEquals(keys.send.encKey.length, 32);
	assertEquals(keys.recv.encKey.length, 32);
	assertNotEquals(keys.send.encKey, keys.recv.encKey);
	assertEquals(keys.ourPub.length, 33);
	assertEquals(keys.ecdhSecret.length, 32);
});

Deno.test("sha256 matches well-known empty-string vector", () => {
	const e = sha256(new Uint8Array(0));
	const expected =
		"e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
	assertEquals(
		[...e].map((b) => b.toString(16).padStart(2, "0")).join(""),
		expected,
	);
});
