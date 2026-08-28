import { assert, assertEquals } from "@std/assert";
import { Buffer } from "node:buffer";
import { E2EE } from "./mod.ts";

/** The per-user E2EE public key cache was keyed only by `keyId`
 *  (`e2eePublicKeys:${keyId}`). LINE key ids are small per-account counters,
 *  so two contacts both having key id 1 collided: the second contact's lookup
 *  returned the first contact's cached public key without any RPC, producing
 *  a wrong ECDH shared secret. */
function makeE2EE() {
	const store = new Map<string, string>();
	const negotiatedFor: string[] = [];
	const fakeBase = {
		profile: { mid: "u-self" },
		storage: {
			get(k: string) {
				return Promise.resolve(store.get(k) ?? null);
			},
			set(k: string, v: string) {
				store.set(k, v);
				return Promise.resolve();
			},
		},
		talk: {
			negotiateE2EEPublicKey({ mid }: { mid: string }) {
				negotiatedFor.push(mid);
				// Every account's first registered key gets keyId 1, but each
				// account has distinct key material.
				return Promise.resolve({
					specVersion: 2,
					publicKey: {
						keyId: 1,
						keyData: Buffer.from(`pub-of-${mid}`),
					},
				});
			},
			getE2EEPublicKeys() {
				return Promise.resolve([]);
			},
		},
		getToType() {
			return 0;
		},
		log() {},
	};
	return { e2ee: new E2EE(fakeBase as never), store, negotiatedFor };
}

Deno.test("getE2EELocalPublicKey — same keyId on two contacts does not cross-contaminate", async () => {
	const { e2ee, negotiatedFor } = makeE2EE();

	const keyA = await e2ee.getE2EELocalPublicKey("u-a", 1);
	assertEquals(keyA.toString(), "pub-of-u-a");
	assert(negotiatedFor.includes("u-a"));

	// Contact B has the same keyId=1 — must NOT be served A's cached key.
	const keyB = await e2ee.getE2EELocalPublicKey("u-b", 1);
	assertEquals(keyB.toString(), "pub-of-u-b");
	assert(negotiatedFor.includes("u-b"));

	// And repeated lookups still hit the (per-mid) cache.
	const keyA2 = await e2ee.getE2EELocalPublicKey("u-a", 1);
	assertEquals(keyA2.toString(), "pub-of-u-a");
	assertEquals(negotiatedFor.filter((m) => m === "u-a").length, 1);
});

Deno.test("getE2EELocalPublicKey — omitted keyId accepts the negotiated key", async () => {
	const { e2ee } = makeE2EE();
	// Previously this threw `E2EE key id undefined not found` even though
	// negotiation succeeded.
	const key = await e2ee.getE2EELocalPublicKey("u-a");
	assertEquals(key.toString(), "pub-of-u-a");
});
