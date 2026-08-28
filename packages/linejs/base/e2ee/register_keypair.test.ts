import { assert, assertEquals } from "@std/assert";
import { Buffer } from "node:buffer";
import { E2EE } from "./mod.ts";

Deno.test("registerE2EEKeyPair sends the raw 32-byte public key", async () => {
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

	assert(Buffer.isBuffer(keyData));
	assertEquals(keyData.length, 32);
	assertEquals(result?.keyId, 7);
	assertEquals(result?.pubKey.equals(keyData), true);
	assert(stored.has("e2eeKeys:7"));
	assert(stored.has("e2eeKeys:u-self"));
});
