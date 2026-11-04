import { assert, test } from "vite-plus/test";
import { assertRejects } from "../../test/assert.ts";
import { Buffer } from "node:buffer";
import { E2EE } from "./mod.ts";
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
