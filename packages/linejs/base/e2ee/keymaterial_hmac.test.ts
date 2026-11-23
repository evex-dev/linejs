import { assert, test } from "vite-plus/test";
import { assertRejects } from "../../test/assert.ts";
import { Buffer } from "node:buffer";
import crypto from "node:crypto";
import { chunkDigests, E2EE, MEDIA_TAG_CHUNK } from "./mod.ts";
import { InternalError } from "../core/utils/error.ts";

// `encryptByKeyMaterial` appends an HMAC-SHA256 of the ciphertext, but
// `decryptByKeyMaterial` silently discarded those 32 bytes without ever
// comparing them — tampered/corrupted media decrypted to garbage without
// error.
function makeE2EE() {
	return new E2EE({
		profile: { mid: "u-self" },
		storage: {
			get() {
				return Promise.resolve(null);
			},
			set() {
				return Promise.resolve();
			},
		},
		getToType() {
			return 0;
		},
		log() {},
	} as never);
}

test("decryptByKeyMaterial round-trips and verifies the HMAC", async () => {
	const e2ee = makeE2EE();
	const raw = Buffer.from("secret media payload");

	const { keyMaterial, encryptedData } = await e2ee.encryptByKeyMaterial(raw);
	assert.deepEqual(encryptedData.length, raw.length + 32);

	const decrypted = await e2ee.decryptByKeyMaterial(encryptedData, keyMaterial);
	assert.deepEqual(decrypted.toString(), "secret media payload");
});

test("decryptByKeyMaterial rejects a tampered ciphertext", async () => {
	const e2ee = makeE2EE();
	const { keyMaterial, encryptedData } = await e2ee.encryptByKeyMaterial(
		Buffer.from("secret media payload"),
	);

	const tampered = Buffer.from(encryptedData);
	tampered[0] ^= 0x01;
	await assertRejects(
		() => e2ee.decryptByKeyMaterial(tampered, keyMaterial),
		InternalError as never,
		"HMAC verification failed",
	);
});

test("decryptByKeyMaterial rejects a wrong keyMaterial", async () => {
	const e2ee = makeE2EE();
	const { encryptedData } = await e2ee.encryptByKeyMaterial(Buffer.from("secret media payload"));

	await assertRejects(
		() => e2ee.decryptByKeyMaterial(encryptedData, Buffer.alloc(32, 7)),
		InternalError as never,
		"HMAC verification failed",
	);
});

test("decryptByKeyMaterial rejects truncated input", async () => {
	const e2ee = makeE2EE();
	await assertRejects(
		() => e2ee.decryptByKeyMaterial(Buffer.alloc(10), Buffer.alloc(32)),
		InternalError as never,
		"too short",
	);
	assert.isOk(true);
});

// LINE tags videos with an HMAC over the SHA-256 of each 128 KiB ciphertext
// chunk (LINE Encryption Overview v2.2, "Video Encryption"). Videos sent from
// the app failed to download with "HMAC verification failed" (#291).
test("chunked tag matches the published video construction and round-trips", async () => {
	const e2ee = makeE2EE();
	// Two full chunks and a partial third, so the chunking matters.
	const raw = crypto.randomBytes(MEDIA_TAG_CHUNK * 2 + 4097);
	const { keyMaterial, encryptedData } = await e2ee.encryptByKeyMaterial(raw, undefined, {
		chunked: true,
	});
	const enc = encryptedData.subarray(0, -32);
	const { macKey } = await e2ee.deriveKeyMaterial(Buffer.from(keyMaterial, "base64"));
	const hashes = [0, 1, 2].map((i) =>
		crypto
			.createHash("sha256")
			.update(enc.subarray(i * MEDIA_TAG_CHUNK, (i + 1) * MEDIA_TAG_CHUNK))
			.digest(),
	);
	assert.deepEqual(chunkDigests(enc), Buffer.concat(hashes));
	assert.deepEqual(
		encryptedData.subarray(-32),
		crypto.createHmac("sha256", macKey).update(Buffer.concat(hashes)).digest(),
	);
	assert.isTrue((await e2ee.decryptByKeyMaterial(encryptedData, keyMaterial)).equals(raw));
});

test("decryptByKeyMaterial rejects a tampered chunk under the chunked tag", async () => {
	const e2ee = makeE2EE();
	const { keyMaterial, encryptedData } = await e2ee.encryptByKeyMaterial(
		crypto.randomBytes(MEDIA_TAG_CHUNK + 10),
		undefined,
		{ chunked: true },
	);
	const tampered = Buffer.from(encryptedData);
	tampered[MEDIA_TAG_CHUNK + 3] ^= 0x01; // inside the second chunk
	await assertRejects(
		() => e2ee.decryptByKeyMaterial(tampered, keyMaterial),
		InternalError as never,
		"HMAC verification failed",
	);
});
