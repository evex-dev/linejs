import { assertEquals, assertRejects } from "@std/assert";
import { Buffer } from "node:buffer";
import { buildMikeyPke, mikeyFromBase64, mikeyToBase64, parseMikey } from "./mikey.ts";

async function fakeRsaKeypair() {
	const k = await crypto.subtle.generateKey(
		{
			name: "RSA-OAEP",
			modulusLength: 2048,
			publicExponent: new Uint8Array([1, 0, 1]),
			hash: "SHA-1",
		},
		true,
		["encrypt", "decrypt"],
	);
	const spki = new Uint8Array(await crypto.subtle.exportKey("spki", k.publicKey));
	return { pub: k.publicKey, priv: k.privateKey, spki };
}

Deno.test("buildMikeyPke: TGK length is enforced", async () => {
	const { spki } = await fakeRsaKeypair();
	await assertRejects(
		() => buildMikeyPke({ peerPublicKey: spki, tgk: new Uint8Array(29) }),
		Error,
		"30 bytes",
	);
});

Deno.test("buildMikeyPke: produces a header with v=1, dataType=2 (PKE_INIT)", async () => {
	const { spki } = await fakeRsaKeypair();
	const tgk = new Uint8Array(30);
	for (let i = 0; i < 30; i++) tgk[i] = i;
	const msg = await buildMikeyPke({
		peerPublicKey: spki,
		tgk,
		initiatorId: "u-self",
		responderId: "u-peer",
		csbId: 0xdeadbeef,
	});
	const parsed = parseMikey(msg);
	assertEquals(parsed.version, 1);
	assertEquals(parsed.dataType, 2);
	assertEquals(parsed.csbId, 0xdeadbeef);
});

Deno.test("buildMikeyPke + parseMikey: round-trip pulls out rand/timestamp/PKE/KEMAC", async () => {
	const { spki } = await fakeRsaKeypair();
	const tgk = new Uint8Array(30).fill(0x42);
	const rand = new Uint8Array(16);
	for (let i = 0; i < 16; i++) rand[i] = i + 1;
	const msg = await buildMikeyPke({
		peerPublicKey: spki,
		tgk,
		rand,
		ntpTimestamp: 0x123456789abcdef0n,
		csbId: 1,
	});
	const parsed = parseMikey(msg);
	assertEquals(parsed.rand, rand);
	assertEquals(parsed.ntpTimestamp, 0x123456789abcdef0n);
	assertEquals(parsed.pkeBody?.length, 256); // RSA-2048 encryption = 256 bytes
	// KEMAC encrypted body is at least 5 bytes (KEY_DATA payload header) + 30 (TGK) = 35
	assertEquals((parsed.kemacEncrypted?.length ?? 0) >= 35, true);
});

Deno.test("MIKEY-PKE: peer can decrypt envelope key with private RSA key", async () => {
	const kp = await fakeRsaKeypair();
	const envKey = new Uint8Array(16);
	for (let i = 0; i < 16; i++) envKey[i] = i + 100;
	const msg = await buildMikeyPke({
		peerPublicKey: kp.spki,
		tgk: new Uint8Array(30),
		envelopeKey: envKey,
		csbId: 1,
	});
	const parsed = parseMikey(msg);
	// Decrypt PKE body with the private key
	const pke = parsed.pkeBody!;
	const ab = pke.buffer.slice(pke.byteOffset, pke.byteOffset + pke.byteLength) as ArrayBuffer;
	const dec = await crypto.subtle.decrypt({ name: "RSA-OAEP" }, kp.priv, ab);
	const recovered = new Uint8Array(dec);
	assertEquals(recovered, envKey);
});

Deno.test("mikeyToBase64 + mikeyFromBase64 round-trip", () => {
	const sample = new Uint8Array([0xde, 0xad, 0xbe, 0xef, 0x00, 0xff, 0x42]);
	const enc = mikeyToBase64(sample);
	const back = mikeyFromBase64(enc);
	assertEquals(back, sample);
});
