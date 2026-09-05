import { assertEquals } from "@std/assert";
import { Buffer } from "node:buffer";
import crypto from "node:crypto";
import nacl from "tweetnacl";
import { E2EE } from "./mod.ts";
import { InternalError } from "../core/utils/error.ts";

/** A group's shared key is rotated on every membership change, so the key id
 *  in a message envelope names the generation the message was encrypted with.
 *  The cache used to hold one key per group and the fetch always asked for the
 *  last key, so any older generation came back wrong and its whole group
 *  failed the GCM tag check. These tests pin down which RPC is issued for a
 *  given key id and what ends up cached; the shared-key unwrap itself
 *  (ECDH + AES-256-CBC) runs for real. */

const GROUP_MID = "c-group";
const CREATOR = "u-creator";
const CREATOR_KEY_ID = 3;
const RECEIVER_KEY_ID = 5;

interface Call {
	name: string;
	args: Record<string, unknown>;
}

/** The shared key material the server wrapped for generation `keyId`. */
function sharedKeyMaterial(keyId: number): Buffer {
	return Buffer.alloc(32, keyId);
}

function makeFixture(opts: { served: number[]; lastKeyId: number }) {
	const store = new Map<string, string>();
	const calls: Call[] = [];
	const sharedKeys = new Map<number, Record<string, unknown>>();

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
			getE2EEGroupSharedKey(args: { groupKeyId: number }) {
				calls.push({ name: "getE2EEGroupSharedKey", args });
				const shared = sharedKeys.get(args.groupKeyId);
				if (!shared) {
					throw new InternalError(
						"TalkException",
						"group key not found",
						{ code: "NOT_FOUND" },
					);
				}
				return Promise.resolve(shared);
			},
			getLastE2EEGroupSharedKey(args: { chatMid: string }) {
				calls.push({ name: "getLastE2EEGroupSharedKey", args });
				return Promise.resolve(sharedKeys.get(opts.lastKeyId));
			},
		},
		getToType(mid: string) {
			// GROUP for the chat mid, USER for the key creator.
			return mid.startsWith("c") ? 2 : 0;
		},
		log() {},
	};
	const e2ee = new E2EE(fakeBase as never);

	const self = nacl.box.keyPair();
	const creator = nacl.box.keyPair();
	store.set(
		`e2eeKeys:${RECEIVER_KEY_ID}`,
		JSON.stringify({
			privKey: Buffer.from(self.secretKey).toString("base64"),
			pubKey: Buffer.from(self.publicKey).toString("base64"),
		}),
	);
	// Pre-seed the creator's public key so the unwrap needs no extra RPC.
	store.set(
		`e2eePublicKeys:${CREATOR}:${CREATOR_KEY_ID}`,
		Buffer.from(creator.publicKey).toString("base64"),
	);

	// Wrap each generation exactly the way `tryRegisterE2EEGroupKey` does.
	const secret = e2ee.generateSharedSecret(
		Buffer.from(self.secretKey),
		Buffer.from(creator.publicKey),
	);
	const aesKey = e2ee.getSHA256Sum(Buffer.from(secret), "Key");
	const aesIv = e2ee.xor(e2ee.getSHA256Sum(Buffer.from(secret), "IV"));
	for (const groupKeyId of opts.served) {
		const cipher = crypto.createCipheriv("aes-256-cbc", aesKey, aesIv);
		sharedKeys.set(groupKeyId, {
			keyVersion: 2,
			groupKeyId,
			creator: CREATOR,
			creatorKeyId: CREATOR_KEY_ID,
			receiver: "u-self",
			receiverKeyId: RECEIVER_KEY_ID,
			encryptedSharedKey: Buffer.concat([
				cipher.update(sharedKeyMaterial(groupKeyId)),
				cipher.final(),
			]),
			allowedTypes: [],
			specVersion: 2,
		});
	}

	return { e2ee, store, calls };
}

function expectedPrivKey(keyId: number): string {
	return sharedKeyMaterial(keyId).toString("base64");
}

function cachedAt(store: Map<string, string>, key: string) {
	const raw = store.get(key);
	return raw === undefined ? undefined : JSON.parse(raw);
}

Deno.test("group key — a cached generation is returned without any RPC", async () => {
	const { e2ee, store, calls } = makeFixture({
		served: [7],
		lastKeyId: 7,
	});
	store.set(
		`e2eeGroupKeys:${GROUP_MID}:7`,
		JSON.stringify({ privKey: expectedPrivKey(7), keyId: 7 }),
	);

	const key = await e2ee.getE2EELocalPublicKey(GROUP_MID, 7);

	assertEquals(key, { privKey: expectedPrivKey(7), keyId: 7 });
	assertEquals(calls, []);
});

Deno.test("group key — the legacy single slot is still honoured when it matches", async () => {
	const { e2ee, store, calls } = makeFixture({
		served: [7],
		lastKeyId: 7,
	});
	// A storage written before the per-keyId slot existed.
	store.set(
		`e2eeGroupKeys:${GROUP_MID}`,
		JSON.stringify({ privKey: expectedPrivKey(7), keyId: 7 }),
	);

	const key = await e2ee.getE2EELocalPublicKey(GROUP_MID, 7);

	assertEquals(key, { privKey: expectedPrivKey(7), keyId: 7 });
	assertEquals(calls, []);
});

Deno.test("group key — a requested generation is fetched by id, not as the last key", async () => {
	const { e2ee, store, calls } = makeFixture({
		served: [7, 9],
		lastKeyId: 9,
	});
	// The cache holds the current generation; the message needs the older one.
	store.set(
		`e2eeGroupKeys:${GROUP_MID}`,
		JSON.stringify({ privKey: expectedPrivKey(9), keyId: 9 }),
	);

	const key = await e2ee.getE2EELocalPublicKey(GROUP_MID, 7);

	assertEquals(calls, [{
		name: "getE2EEGroupSharedKey",
		args: { keyVersion: 2, chatMid: GROUP_MID, groupKeyId: 7 },
	}]);
	assertEquals(key, { privKey: expectedPrivKey(7), keyId: 7 });
	assertEquals(cachedAt(store, `e2eeGroupKeys:${GROUP_MID}:7`), key);
	assertEquals(cachedAt(store, `e2eeGroupKeys:${GROUP_MID}`), key);
});

Deno.test("group key — an omitted key id still asks for the last key", async () => {
	const { e2ee, store, calls } = makeFixture({
		served: [9],
		lastKeyId: 9,
	});

	const key = await e2ee.getE2EELocalPublicKey(GROUP_MID, undefined);

	assertEquals(calls, [{
		name: "getLastE2EEGroupSharedKey",
		args: { keyVersion: 2, chatMid: GROUP_MID },
	}]);
	assertEquals(key, { privKey: expectedPrivKey(9), keyId: 9 });
	assertEquals(cachedAt(store, `e2eeGroupKeys:${GROUP_MID}:9`), key);
});

Deno.test("group key — two generations of one group stay cached side by side", async () => {
	const { e2ee, store, calls } = makeFixture({
		served: [7, 9],
		lastKeyId: 9,
	});

	const older = await e2ee.getE2EELocalPublicKey(GROUP_MID, 7);
	const newer = await e2ee.getE2EELocalPublicKey(GROUP_MID, 9);
	// The older generation must not have been evicted by the newer one.
	const olderAgain = await e2ee.getE2EELocalPublicKey(GROUP_MID, 7);

	assertEquals(older, { privKey: expectedPrivKey(7), keyId: 7 });
	assertEquals(newer, { privKey: expectedPrivKey(9), keyId: 9 });
	assertEquals(olderAgain, older);
	assertEquals(calls.length, 2);
	assertEquals(cachedAt(store, `e2eeGroupKeys:${GROUP_MID}:7`), older);
	assertEquals(cachedAt(store, `e2eeGroupKeys:${GROUP_MID}:9`), newer);
});

Deno.test("group key — generation 0 is fetched by id like any other", async () => {
	// The key id used to be tested for truthiness, so generation 0 silently
	// took the last-key path.
	const { e2ee, store, calls } = makeFixture({
		served: [0, 9],
		lastKeyId: 9,
	});

	const key = await e2ee.getE2EELocalPublicKey(GROUP_MID, 0);

	assertEquals(calls, [{
		name: "getE2EEGroupSharedKey",
		args: { keyVersion: 2, chatMid: GROUP_MID, groupKeyId: 0 },
	}]);
	assertEquals(key, { privKey: expectedPrivKey(0), keyId: 0 });
	assertEquals(cachedAt(store, `e2eeGroupKeys:${GROUP_MID}:0`), key);
});

Deno.test("group key — generation 0 falls back to the last key when unserved", async () => {
	const { e2ee, calls } = makeFixture({
		served: [9], // generation 0 is not served
		lastKeyId: 9,
	});

	const key = await e2ee.getE2EELocalPublicKey(GROUP_MID, 0);

	assertEquals(calls, [
		{
			name: "getE2EEGroupSharedKey",
			args: { keyVersion: 2, chatMid: GROUP_MID, groupKeyId: 0 },
		},
		{
			name: "getLastE2EEGroupSharedKey",
			args: { keyVersion: 2, chatMid: GROUP_MID },
		},
	]);
	assertEquals(key, { privKey: expectedPrivKey(9), keyId: 9 });
});

Deno.test("group key — a key id that is not a number never reaches the wire", async () => {
	const { e2ee, calls } = makeFixture({
		served: [9],
		lastKeyId: 9,
	});

	// `Number("nonsense")` is NaN; it must not be sent as a groupKeyId.
	const key = await e2ee.getE2EELocalPublicKey(GROUP_MID, "nonsense");

	assertEquals(calls, [{
		name: "getLastE2EEGroupSharedKey",
		args: { keyVersion: 2, chatMid: GROUP_MID },
	}]);
	assertEquals(key, { privKey: expectedPrivKey(9), keyId: 9 });
});

Deno.test("group key — a generation the server dropped falls back to the last key", async () => {
	const { e2ee, store, calls } = makeFixture({
		served: [9], // generation 7 is no longer served
		lastKeyId: 9,
	});

	const key = await e2ee.getE2EELocalPublicKey(GROUP_MID, 7);

	assertEquals(calls, [
		{
			name: "getE2EEGroupSharedKey",
			args: { keyVersion: 2, chatMid: GROUP_MID, groupKeyId: 7 },
		},
		{
			name: "getLastE2EEGroupSharedKey",
			args: { keyVersion: 2, chatMid: GROUP_MID },
		},
	]);
	assertEquals(key, { privKey: expectedPrivKey(9), keyId: 9 });
	assertEquals(cachedAt(store, `e2eeGroupKeys:${GROUP_MID}:9`), key);
});
