import { assert, assertEquals } from "@std/assert";
import { Buffer } from "node:buffer";
import { E2EE } from "./mod.ts";

/** Verifies the envelope arguments that reach `decryptE2EEMessageV2` when
 *  decrypting a LOCATION message: the AAD content type must be the numeric
 *  enum (15), and the self-key / peer-key selection must follow isSelf.
 *  We don't mock real GCM crypto — we trap the V2 primitive and record
 *  what flowed into it (same approach as key_selection.test.ts). */
function makeE2EE(opts: {
	keysByKeyId: Record<string | number, { privKey: string; pubKey: string }>;
	latestKey: { privKey: string; pubKey: string };
	negotiatedPubKey?: Buffer;
}) {
	const byIdLookups: (string | number)[] = [];
	const localPubKeyLookups: [string, string | number | undefined][] = [];
	const fakeBase = {
		profile: { mid: "u-self" },
		storage: {
			get(k: string) {
				const m = k.match(/^e2eeKeys:(.+)$/);
				if (!m) return Promise.resolve(null);
				const id = m[1];
				if (id === "u-self") {
					return Promise.resolve(JSON.stringify(opts.latestKey));
				}
				byIdLookups.push(id);
				if (opts.keysByKeyId[id]) {
					return Promise.resolve(JSON.stringify(opts.keysByKeyId[id]));
				}
				return Promise.resolve(null);
			},
		},
		talk: {
			getE2EEPublicKeys() {
				return Promise.resolve([]);
			},
		},
		getToType() {
			return 0;
		},
		log() {},
	};
	const e2ee = new E2EE(fakeBase as never);
	(e2ee as unknown as {
		getE2EELocalPublicKey: unknown;
	}).getE2EELocalPublicKey = (
		mid: string,
		keyId: string | number | undefined,
	) => {
		localPubKeyLookups.push([mid, keyId]);
		return Promise.resolve(opts.negotiatedPubKey ?? Buffer.alloc(32));
	};

	const seen: {
		contentType: number | undefined;
		privK: Buffer | null;
		pubK: unknown;
	} = { contentType: undefined, privK: null, pubK: null };
	(e2ee as unknown as {
		decryptE2EEMessageV2: unknown;
	}).decryptE2EEMessageV2 = (
		_to: string,
		_from: string,
		_chunks: Buffer[],
		privK: Buffer,
		pubK: Buffer,
		_specVersion: number,
		contentType: number,
	) => {
		seen.privK = privK;
		seen.pubK = pubK;
		seen.contentType = contentType;
		return { location: { latitude: 1 } };
	};

	return { e2ee, seen, byIdLookups, localPubKeyLookups };
}

function int4(v: number): Buffer {
	const b = Buffer.alloc(4);
	b.writeInt32BE(v, 0);
	return b;
}

function makeFakeMessage(opts: {
	senderKeyId: number;
	receiverKeyId: number;
	from: string;
	to: string;
}) {
	return {
		from: opts.from,
		to: opts.to,
		toType: "USER",
		contentType: "LOCATION",
		contentMetadata: { e2eeVersion: "2" },
		chunks: [
			Buffer.alloc(16),
			Buffer.alloc(64),
			Buffer.alloc(12),
			int4(opts.senderKeyId),
			int4(opts.receiverKeyId),
		],
	} as never;
}

Deno.test("decryptE2EELocationMessage — received: numeric AAD contentType + peer key selected", async () => {
	const oldKey = { privKey: "AAAA", pubKey: "BBBB" };
	const newKey = { privKey: "CCCC", pubKey: "DDDD" };
	const { e2ee, seen, byIdLookups, localPubKeyLookups } = makeE2EE({
		keysByKeyId: { "9": oldKey, "11": newKey },
		latestKey: newKey,
	});
	const msg = makeFakeMessage({
		senderKeyId: 7,
		receiverKeyId: 9,
		from: "u-them",
		to: "u-self",
	});
	await e2ee.decryptE2EELocationMessage(msg);
	// "LOCATION" must be mapped to its numeric enum value (15) for the AAD.
	assertEquals(seen.contentType, 15);
	// Received message: pin my key by receiverKeyId=9…
	assert(byIdLookups.includes("9"), "expected by-keyId lookup for 9");
	assertEquals(
		Buffer.from(oldKey.privKey, "base64").toString("base64"),
		seen.privK!.toString("base64"),
	);
	// …and use the *sender's* public key, not mine.
	assertEquals(localPubKeyLookups, [["u-them", 7]]);
});

Deno.test("decryptE2EELocationMessage — sent: isSelf derived from from-mid", async () => {
	const key7 = { privKey: "AAAA", pubKey: "BBBB" };
	const key11 = { privKey: "CCCC", pubKey: "DDDD" };
	const { e2ee, seen, byIdLookups, localPubKeyLookups } = makeE2EE({
		keysByKeyId: { "7": key7, "11": key11 },
		latestKey: key11,
	});
	const msg = makeFakeMessage({
		senderKeyId: 7,
		receiverKeyId: 11,
		from: "u-self", // I sent it
		to: "u-them",
	});
	await e2ee.decryptE2EELocationMessage(msg);
	assertEquals(seen.contentType, 15);
	assert(byIdLookups.includes("7"), "expected by-keyId lookup for 7");
	assertEquals(
		Buffer.from(key7.privKey, "base64").toString("base64"),
		seen.privK!.toString("base64"),
	);
	// Self-sent: use the recipient's public key with receiverKeyId.
	assertEquals(localPubKeyLookups, [["u-them", 11]]);
});

Deno.test("decryptE2EELocationMessage — falls back to latest key on by-id miss", async () => {
	const latestKey = { privKey: "ZZZZ", pubKey: "YYYY" };
	const { e2ee, seen, byIdLookups } = makeE2EE({
		keysByKeyId: {}, // empty by-id store
		latestKey,
	});
	const msg = makeFakeMessage({
		senderKeyId: 7,
		receiverKeyId: 9,
		from: "u-them",
		to: "u-self",
	});
	await e2ee.decryptE2EELocationMessage(msg);
	assert(byIdLookups.includes("9"));
	assertEquals(
		Buffer.from(latestKey.privKey, "base64").toString("base64"),
		seen.privK!.toString("base64"),
	);
});
