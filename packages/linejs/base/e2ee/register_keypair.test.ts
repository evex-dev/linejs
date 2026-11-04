import { assert, test } from "vite-plus/test";
import { Buffer } from "node:buffer";
import { E2EE } from "./mod.ts";

test("registerE2EEKeyPair sends the raw 32-byte public key", async () => {
	let registeredPublicKey: unknown;
	const stored = new Map<string, string>();
	const fakeBase = {
		profile: { mid: "u-self" },
		storage: {
			set(key: string, value: string) {
				stored.set(key, value);
				return Promise.resolve();
			},
		},
		talk: {
			registerE2EEPublicKey({ publicKey }: { publicKey: unknown }) {
				registeredPublicKey = publicKey;
				return Promise.resolve({ keyId: 7 });
			},
		},
		log() {},
	};

	const result = await new E2EE(fakeBase as never).registerE2EEKeyPair();
	const keyData = (registeredPublicKey as { keyData: unknown }).keyData;

	assert.isOk(Buffer.isBuffer(keyData));
	assert.deepEqual(keyData.length, 32);
	assert.deepEqual(result?.keyId, 7);
	assert.deepEqual(result?.pubKey.equals(keyData), true);
	assert.isOk(stored.has("e2eeKeys:7"));
	assert.isOk(stored.has("e2eeKeys:u-self"));
});
