import { assert, test } from "vite-plus/test";
import {
	aesCtrDecrypt,
	aesCtrEncrypt,
	buildCtrIv,
	buildDirectionLabel,
	buildPlanetCtrIv,
	buildPlanetMediaKeyInfo,
	decodeMpKey,
	decodeStnpkPublicKey,
	deriveCallKeys,
	derivePlanetMediaKeys,
	derivePlanetMediaStreamKeying,
	ecdh,
	generateEphemeralKeypair,
	hmacTag,
	planetHkdfStage1,
	planetHkdfStage2,
	planetKdfSha256,
	planetKdfSha512,
	sha256,
	tagEquals,
} from "./crypto.ts";

test("decodeMpKey extracts the 33-byte SEC1 P-256 pubkey", () => {
	const raw = new Uint8Array(33);
	raw[0] = 0x02;
	for (let i = 1; i < raw.length; i++) raw[i] = i;
	const b64 = btoa(String.fromCharCode(...raw));
	const k = decodeMpKey(b64);
	assert.deepEqual(k.length, 33);
	assert.deepEqual(k[0], 0x02); // parity byte
});

test("decodeMpKey rejects wrong length", () => {
	let threw = false;
	try {
		decodeMpKey(btoa("short"));
	} catch (_e) {
		threw = true;
	}
	assert.deepEqual(threw, true);
});

test("decodeStnpkPublicKey extracts a trailing uncompressed SEC1 point", () => {
	const spkiLike = new Uint8Array(91);
	spkiLike[0] = 0x30;
	spkiLike[spkiLike.length - 65] = 0x04;
	for (let i = spkiLike.length - 64; i < spkiLike.length; i++) {
		spkiLike[i] = i & 0xff;
	}
	const b64 = btoa(String.fromCharCode(...spkiLike));
	const key = decodeStnpkPublicKey(b64);
	assert.deepEqual(key.length, 65);
	assert.deepEqual(key[0], 0x04);
	assert.deepEqual(key, spkiLike.subarray(spkiLike.length - 65));
});

test("ECDH roundtrip — two parties get the same shared secret", () => {
	const a = generateEphemeralKeypair();
	const b = generateEphemeralKeypair();
	const sA = ecdh(a.privateKey, b.publicKey);
	const sB = ecdh(b.privateKey, a.publicKey);
	assert.deepEqual(sA, sB);
	assert.deepEqual(sA.length, 32);
});

test("generated ephemeral private keys always use a fixed 32-byte scalar", () => {
	// OpenSSL drops leading zero bytes when serialising the P-256 scalar, so a
	// single generateKeys() call can yield a 31-byte private key. Sampling many
	// keys makes this regression test reliable without depending on a seed.
	for (let i = 0; i < 4096; i++) {
		const keypair = generateEphemeralKeypair();
		assert.deepEqual(keypair.privateKey.length, 32);
		assert.deepEqual(keypair.publicKey.length, 33);
	}
});

test("Stage-1 HKDF is deterministic and matches expected output length", () => {
	const ecdhSecret = new Uint8Array(32).fill(0xab);
	const our = new Uint8Array(33);
	our[0] = 0x02;
	const peer = new Uint8Array(33);
	peer[0] = 0x03;
	const out1 = planetHkdfStage1(ecdhSecret, our, peer);
	const out2 = planetHkdfStage1(ecdhSecret, our, peer);
	assert.deepEqual(out1.length, 64);
	assert.deepEqual(out1, out2);
	// Swapping pubkeys produces a different output
	const out3 = planetHkdfStage1(ecdhSecret, peer, our);
	assert.notDeepEqual(out1, out3);
});

function hex(bytes: Uint8Array): string {
	return [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
}

test("PLANET KDF matches native HMAC counter construction", () => {
	const salt = new TextEncoder().encode("salt material");
	const ikm = new TextEncoder().encode("ikm key");
	const info = new TextEncoder().encode("label");
	const out = planetKdfSha512(salt, ikm, info, 64);
	assert.deepEqual(
		hex(out),
		"54f6d4e47d5626904da26d8b5a94593d084f4d2f08d5b9a68e473844" +
			"6fb5e028aed635928bad222cf8ccadbb82e7cca9c06525b759175072" +
			"61cf625b20954d2a",
	);
});

test("PLANET SHA-256 KDF matches native media-key construction", () => {
	const salt = new TextEncoder().encode("salt material");
	const ikm = new TextEncoder().encode("ikm key");
	const info = new TextEncoder().encode("label");
	const out = planetKdfSha256(salt, ikm, info, 64);
	assert.deepEqual(
		hex(out),
		"167aa50312736560a497178812df827c7b999f86d8d6157bd7cce447" +
			"9eba894bf0680590a44c729c8c76810348eea091ecb6aa81e602c23" +
			"b1f3eeefdb8ca4aec",
	);
});

test("derivePlanetMediaStreamKeying applies native stream label HMAC", () => {
	const base = new Uint8Array(30);
	for (let i = 0; i < base.length; i++) base[i] = i;
	const out = derivePlanetMediaStreamKeying(base, "AUDIO");
	assert.deepEqual(out.length, 30);
	assert.deepEqual(hex(out), "3ebc662d4d812b04d940362540d64ecf18bbcc2cb2253cf722676d1e2554");
	assert.notDeepEqual(out, base);
});

test("derivePlanetMediaKeys produces opposite-direction SRTP keying material", () => {
	const a = generateEphemeralKeypair();
	const b = generateEphemeralKeypair();
	const aNonce = new Uint8Array(16).fill(0xa1);
	const bNonce = new Uint8Array(16).fill(0xb2);
	const aKeys = derivePlanetMediaKeys({
		local: {
			privateKey: a.privateKey,
			publicKey: a.publicKey,
			mediaKeyId: 0x11223344,
			mediaNonce: aNonce,
		},
		peer: {
			publicKey: b.publicKey,
			mediaKeyId: 0x55667788,
			mediaNonce: bNonce,
		},
	});
	const bKeys = derivePlanetMediaKeys({
		local: {
			privateKey: b.privateKey,
			publicKey: b.publicKey,
			mediaKeyId: 0x55667788,
			mediaNonce: bNonce,
		},
		peer: {
			publicKey: a.publicKey,
			mediaKeyId: 0x11223344,
			mediaNonce: aNonce,
		},
	});
	assert.deepEqual(
		buildPlanetMediaKeyInfo(0x11223344),
		new Uint8Array([0x11, 0x22, 0x33, 0x44, 0, 0, 0, 0]),
	);
	assert.deepEqual(aKeys.sendKeying.length, 30);
	assert.deepEqual(aKeys.recvKeying.length, 30);
	assert.deepEqual(aKeys.sendKeying, bKeys.recvKeying);
	assert.deepEqual(aKeys.recvKeying, bKeys.sendKeying);
	assert.notDeepEqual(aKeys.sendKeying, aKeys.recvKeying);
});

test("Stage-2 HKDF carves four distinct material slices", () => {
	const stage1 = new Uint8Array(64);
	for (let i = 0; i < stage1.length; i++) stage1[i] = i;
	const sid = new Uint8Array(16).fill(0xcc);
	const dt = buildDirectionLabel(0x329a);
	const keys = planetHkdfStage2(stage1, sid, dt);
	assert.deepEqual(keys.encKey.length, 16);
	assert.deepEqual(keys.encKey, keys.raw.subarray(0, 16));
	assert.deepEqual(keys.ctrBase.length, 16);
	assert.deepEqual(keys.ctrBase, keys.raw.subarray(16, 32));
	assert.deepEqual(keys.macKey.length, 32);
	assert.deepEqual(keys.macKey, keys.raw.subarray(32, 64));
	assert.deepEqual(keys.raw.length, 64);
	assert.notDeepEqual(keys.encKey, keys.macKey);
	assert.notDeepEqual(keys.ctrBase, keys.macKey);
});

test("buildDirectionLabel matches observed 2-byte bootstrap label", () => {
	const t = buildDirectionLabel(0x329a);
	assert.deepEqual(t, new Uint8Array([0x32, 0x9a]));
});

test("buildCtrIv composes 12-byte nonce + 4-byte counter", () => {
	const nonce = new Uint8Array(16).fill(0xaa);
	const iv = buildCtrIv(nonce, 0x0102);
	assert.deepEqual(iv.length, 16);
	for (let i = 0; i < 12; i++) assert.deepEqual(iv[i], 0xaa);
	assert.deepEqual(iv[12], 0x00);
	assert.deepEqual(iv[13], 0x00);
	assert.deepEqual(iv[14], 0x01);
	assert.deepEqual(iv[15], 0x02);
});

test("buildPlanetCtrIv XORs the observed sequence across the CTR base", () => {
	const base = new Uint8Array(16);
	for (let i = 0; i < base.length; i++) base[i] = i;
	const iv = buildPlanetCtrIv(base, 0x0253);
	assert.deepEqual(iv.length, 16);
	const expected = new Uint8Array(16);
	for (let i = 0; i < expected.length; i++) {
		expected[i] = base[i] ^ (i % 2 === 0 ? 0x02 : 0x53);
	}
	assert.deepEqual(iv, expected);
});

test("AES-CTR roundtrip + tag check", () => {
	const key128 = new Uint8Array(16).fill(0x44);
	const iv128 = new Uint8Array(16).fill(0x22);
	const plain128 = new TextEncoder().encode("hello native PLANET");
	const ct128 = aesCtrEncrypt(key128, iv128, plain128);
	assert.notDeepEqual(ct128, plain128);
	assert.deepEqual(aesCtrDecrypt(key128, iv128, ct128), plain128);

	const key = new Uint8Array(32).fill(0x55);
	const iv = new Uint8Array(16).fill(0x11);
	const plain = new TextEncoder().encode("hello PLANET cassini");
	const ct = aesCtrEncrypt(key, iv, plain);
	assert.notDeepEqual(ct, plain);
	const pt = aesCtrDecrypt(key, iv, ct);
	assert.deepEqual(pt, plain);
	const tag1 = hmacTag(new Uint8Array(32).fill(0xaa), ct);
	const tag2 = hmacTag(new Uint8Array(32).fill(0xaa), ct);
	assert.deepEqual(tagEquals(tag1, tag2), true);
});

test("deriveCallKeys produces a full bidirectional key set", () => {
	const local = generateEphemeralKeypair();
	const peer = generateEphemeralKeypair();
	const keys = deriveCallKeys({
		mpkey: peer.publicKey,
		local,
		bootstrapSeed: new Uint8Array(16).fill(0x77),
		sendLabel: 0x329a,
		recvLabel: 0x8bd7,
	});
	assert.deepEqual(keys.send.encKey.length, 16);
	assert.deepEqual(keys.recv.encKey.length, 16);
	assert.deepEqual(keys.send.ctrBase.length, 16);
	assert.deepEqual(keys.recv.ctrBase.length, 16);
	assert.notDeepEqual(keys.send.encKey, keys.recv.encKey);
	assert.notDeepEqual(keys.send.ctrBase, keys.recv.ctrBase);
	assert.deepEqual(keys.ourPub.length, 33);
	assert.deepEqual(keys.ecdhSecret.length, 32);
});

test("sha256 matches well-known empty-string vector", () => {
	const e = sha256(new Uint8Array(0));
	const expected = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
	assert.deepEqual([...e].map((b) => b.toString(16).padStart(2, "0")).join(""), expected);
});
