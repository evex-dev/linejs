import { assert, test } from "vite-plus/test";
import { assertRejects } from "../../test/assert.ts";
import { Buffer } from "node:buffer";
import crypto from "node:crypto";
import nacl from "tweetnacl";
import { E2EE } from "./mod.ts";
import { type NestedArray, Protocols, Thrift } from "../thrift/mod.ts";
import { writeStruct } from "../thrift/readwrite/write.ts";

function fixture(ids = [10, 20, 30, 40, 50, 60, 70, 80], corrupt = false) {
	const saved = new Map<string, string>();
	const e2ee = new E2EE({
		thrift: new Thrift(),
		storage: {
			set: (key: string, value: string) => {
				saved.set(key, value);
			},
		},
		talk: { getE2EEPublicKeys: () => Promise.resolve([]) },
		log() {},
		emit() {},
	} as never);
	const keys = ids.map((keyId, i) => {
		const privKey = Buffer.alloc(32, i + 1);
		const pubKey = Buffer.from(nacl.scalarMult.base(privKey));
		return { keyId, privKey, pubKey };
	});
	const entries: NestedArray[] = keys.map((key, i) => [
		[8, 1, 1],
		[8, 2, key.keyId],
		[11, 4, corrupt && i === 0 ? Buffer.alloc(32) : key.pubKey],
		[11, 5, key.privKey],
	]);
	const plain = Buffer.from(writeStruct([[15, 1, [12, entries]]], Protocols[4]));
	const secret = Buffer.alloc(32, 99);
	const publicKey = Buffer.from(nacl.scalarMult.base(Buffer.alloc(32, 100)));
	const shared = Buffer.from(e2ee.generateSharedSecret(secret, publicKey));
	const cipher = crypto.createCipheriv(
		"aes-256-cbc",
		e2ee.getSHA256Sum(shared, "Key"),
		e2ee.xor(e2ee.getSHA256Sum(shared, "IV")),
	);
	const encrypted = Buffer.concat([cipher.update(plain), cipher.final()]);
	const data = {
		keyId: "80",
		publicKey: publicKey.toString("base64"),
		encryptedKeyChain: encrypted.toString("base64"),
		e2eeVersion: 2,
	};
	return { e2ee, saved, secret, publicKey, encrypted, data, keys };
}

test("login keychain selects the requested eighth entry and preserves every generation", async () => {
	const f = fixture();
	const result = await f.e2ee.decodeE2EEKeyV1(f.data, f.secret);
	assert.deepEqual(result?.privKey, f.keys[7].privKey);
	assert.deepEqual(result?.pubKey, f.keys[7].pubKey);
	assert.deepEqual(f.saved.size, 8);
	for (const key of f.keys) {
		const stored = JSON.parse(f.saved.get(`e2eeKeys:${key.keyId}`)!);
		assert.deepEqual(stored.keyId, key.keyId);
		assert.deepEqual(stored.privKey, key.privKey.toString("base64"));
	}
});

test("login keychain missing ID fails without saving a wrong key", async () => {
	const f = fixture();
	await assertRejects(
		() => f.e2ee.decodeE2EEKeyV1({ ...f.data, keyId: 999 }, f.secret),
		Error,
		"Requested keyId",
	);
	assert.deepEqual(f.saved.size, 0);
});

test("login keychain validates historical pairs before any writes", async () => {
	const f = fixture(undefined, true);
	await assertRejects(() => f.e2ee.decodeE2EEKeyV1(f.data, f.secret), Error, "invalid key pair");
	assert.deepEqual(f.saved.size, 0);
});

test("login keychain rejects duplicate IDs", async () => {
	const f = fixture([80, 80]);
	await assertRejects(() => f.e2ee.decodeE2EEKeyV1(f.data, f.secret), Error, "duplicate keyId");
	assert.deepEqual(f.saved.size, 0);
});

test("server verification is deferred and mismatch does not rotate keys", async () => {
	const f = fixture();
	let calls = 0;
	f.e2ee.client.talk.getE2EEPublicKeys = () => {
		calls++;
		assert.deepEqual(f.e2ee.client.authToken, "test-token");
		return Promise.resolve([{ keyId: 80, keyData: Buffer.alloc(32) }] as never);
	};
	await f.e2ee.decodeE2EEKeyV1(f.data, f.secret);
	assert.deepEqual(calls, 0);
	f.e2ee.client.authToken = "test-token";
	await assertRejects(() => f.e2ee.verifyLoginKey(), Error, "no replacement key was registered");
	assert.deepEqual(calls, 1);
});

test("unavailable server verification is unknown, not a verified match", async () => {
	const f = fixture();
	f.e2ee.client.talk.getE2EEPublicKeys = () => Promise.reject(new Error("offline"));
	assert.deepEqual(await f.e2ee.verifyStoredKeyAgainstServer(80, f.keys[7].privKey), false);
});

test("re-login repairs stale mid alias through its corrected per-ID key", async () => {
	const f = fixture();
	f.e2ee.client.storage.get = (key) => Promise.resolve(f.saved.get(key) ?? null);
	f.saved.set(
		"e2eeKeys:u-self",
		JSON.stringify({
			keyId: 80,
			privKey: f.keys[0].privKey.toString("base64"),
			pubKey: f.keys[0].pubKey.toString("base64"),
		}),
	);
	await f.e2ee.decodeE2EEKeyV1(f.data, f.secret);
	const selfKey = await f.e2ee.getE2EESelfKeyData("u-self");
	assert.deepEqual(selfKey.privKey, f.keys[7].privKey.toString("base64"));
});

test("decryptKeyChain accepts explicit ID but rejects ambiguous legacy calls", () => {
	const f = fixture();
	assert.deepEqual(
		f.e2ee.decryptKeyChain(f.publicKey, f.secret, f.encrypted, 80)[0],
		f.keys[7].privKey,
	);
	assert.throws(() => f.e2ee.decryptKeyChain(f.publicKey, f.secret, f.encrypted));
	const single = fixture([80]);
	assert.deepEqual(
		single.e2ee.decryptKeyChain(single.publicKey, single.secret, single.encrypted)[0],
		single.keys[0].privKey,
	);
});
