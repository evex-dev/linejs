import { assertEquals, assertNotEquals } from "@std/assert";
import {
	aesCtrDecrypt,
	aesCtrEncrypt,
	buildCtrIv,
	buildDirectionLabel,
	buildPlanetCtrIv,
	decodeMpKey,
	decodeStnpkPublicKey,
	deriveCallKeys,
	ecdh,
	generateEphemeralKeypair,
	hmacTag,
	planetHkdfStage1,
	planetHkdfStage2,
	planetKdfSha512,
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

Deno.test("decodeStnpkPublicKey extracts a trailing uncompressed SEC1 point", () => {
	const spkiLike = new Uint8Array(91);
	spkiLike[0] = 0x30;
	spkiLike[spkiLike.length - 65] = 0x04;
	for (let i = spkiLike.length - 64; i < spkiLike.length; i++) {
		spkiLike[i] = i & 0xff;
	}
	const b64 = btoa(String.fromCharCode(...spkiLike));
	const key = decodeStnpkPublicKey(b64);
	assertEquals(key.length, 65);
	assertEquals(key[0], 0x04);
	assertEquals(key, spkiLike.subarray(spkiLike.length - 65));
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

function hex(bytes: Uint8Array): string {
	return [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
}

Deno.test("PLANET KDF matches native HMAC counter construction", () => {
	const salt = new TextEncoder().encode("salt material");
	const ikm = new TextEncoder().encode("ikm key");
	const info = new TextEncoder().encode("label");
	const out = planetKdfSha512(salt, ikm, info, 64);
	assertEquals(
		hex(out),
		"54f6d4e47d5626904da26d8b5a94593d084f4d2f08d5b9a68e473844" +
			"6fb5e028aed635928bad222cf8ccadbb82e7cca9c06525b759175072" +
			"61cf625b20954d2a",
	);
});

Deno.test("Stage-2 HKDF carves four distinct material slices", () => {
	const stage1 = new Uint8Array(64);
	for (let i = 0; i < stage1.length; i++) stage1[i] = i;
	const sid = new Uint8Array(16).fill(0xcc);
	const dt = buildDirectionLabel(0x329a);
	const keys = planetHkdfStage2(stage1, sid, dt);
	assertEquals(keys.encKey.length, 16);
	assertEquals(keys.encKey, keys.raw.subarray(0, 16));
	assertEquals(keys.ctrBase.length, 16);
	assertEquals(keys.ctrBase, keys.raw.subarray(16, 32));
	assertEquals(keys.macKey.length, 32);
	assertEquals(keys.macKey, keys.raw.subarray(32, 64));
	assertEquals(keys.raw.length, 64);
	assertNotEquals(keys.encKey, keys.macKey);
	assertNotEquals(keys.ctrBase, keys.macKey);
});

Deno.test("buildDirectionLabel matches observed 2-byte bootstrap label", () => {
	const t = buildDirectionLabel(0x329a);
	assertEquals(t, new Uint8Array([0x32, 0x9a]));
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

Deno.test("buildPlanetCtrIv XORs the observed sequence across the CTR base", () => {
	const base = new Uint8Array(16);
	for (let i = 0; i < base.length; i++) base[i] = i;
	const iv = buildPlanetCtrIv(base, 0x0253);
	assertEquals(iv.length, 16);
	const expected = new Uint8Array(16);
	for (let i = 0; i < expected.length; i++) {
		expected[i] = base[i] ^ (i % 2 === 0 ? 0x02 : 0x53);
	}
	assertEquals(iv, expected);
});

Deno.test("AES-CTR roundtrip + tag check", () => {
	const key128 = new Uint8Array(16).fill(0x44);
	const iv128 = new Uint8Array(16).fill(0x22);
	const plain128 = new TextEncoder().encode("hello native PLANET");
	const ct128 = aesCtrEncrypt(key128, iv128, plain128);
	assertNotEquals(ct128, plain128);
	assertEquals(aesCtrDecrypt(key128, iv128, ct128), plain128);

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
		bootstrapSeed: new Uint8Array(16).fill(0x77),
		sendLabel: 0x329a,
		recvLabel: 0x8bd7,
	});
	assertEquals(keys.send.encKey.length, 16);
	assertEquals(keys.recv.encKey.length, 16);
	assertEquals(keys.send.ctrBase.length, 16);
	assertEquals(keys.recv.ctrBase.length, 16);
	assertNotEquals(keys.send.encKey, keys.recv.encKey);
	assertNotEquals(keys.send.ctrBase, keys.recv.ctrBase);
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
