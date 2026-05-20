import { assert, assertEquals } from "@std/assert";
import { Buffer } from "node:buffer";
import { E2EE } from "./mod.ts";

/** Builds an E2EE instance with a stub BaseClient that records which
 *  self-key id was looked up.  We don't try to mock a working GCM
 *  ciphertext — instead we trap `decryptE2EEMessageV2` and assert on
 *  the privK / pubK that flowed into it. */
function makeE2EE(opts: {
	keysByKeyId: Record<string | number, { privKey: string; pubKey: string }>;
	latestKey: { privKey: string; pubKey: string; keyId?: number };
	receiverPubKey: Buffer;
}) {
	const lookups: (string | number)[] = [];
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
				lookups.push(id);
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
	// Stub getE2EELocalPublicKey so we don't need a real Curve25519 pubkey
	(e2ee as unknown as {
		getE2EELocalPublicKey: unknown;
	}).getE2EELocalPublicKey = () => Promise.resolve(opts.receiverPubKey);

	// Trap decryptE2EEMessageV2 — we want to verify which privK reached it.
	const seen: { privK: Buffer | null; pubK: unknown } = {
		privK: null,
		pubK: null,
	};
	(e2ee as unknown as {
		decryptE2EEMessageV2: unknown;
	}).decryptE2EEMessageV2 = (
		_to: string,
		_from: string,
		_chunks: Buffer[],
		privK: Buffer,
		pubK: Buffer,
	) => {
		seen.privK = privK;
		seen.pubK = pubK;
		return { text: "ok-stub", keyMaterial: "00", fileName: "x" };
	};

	return { e2ee, seen, lookups };
}

function makeFakeMessage(opts: {
	senderKeyId: number;
	receiverKeyId: number;
	contentType: string;
	from: string;
	to: string;
}): never {
	function int4(v: number): Buffer {
		const b = Buffer.alloc(4);
		b.writeInt32BE(v, 0);
		return b;
	}
	return {
		from: opts.from,
		to: opts.to,
		toType: "USER",
		contentType: opts.contentType,
		contentMetadata: { e2eeVersion: "2" },
		chunks: [
			Buffer.alloc(16), // salt
			Buffer.alloc(64), // message+tag
			Buffer.alloc(12), // sign/iv
			int4(opts.senderKeyId),
			int4(opts.receiverKeyId),
		],
	} as never;
}

Deno.test("decryptE2EEDataMessage — received: looks up self-key by receiverKeyId (#88)", async () => {
	const oldKey = { privKey: "AAAA", pubKey: "BBBB" };
	const newKey = { privKey: "CCCC", pubKey: "DDDD" };
	const { e2ee, seen, lookups } = makeE2EE({
		keysByKeyId: { "9": oldKey, "11": newKey },
		latestKey: newKey,
		receiverPubKey: Buffer.alloc(32),
	});
	const msg = makeFakeMessage({
		senderKeyId: 7,
		receiverKeyId: 9,
		contentType: "IMAGE",
		from: "u-them",
		to: "u-self",
	});
	const out = await e2ee.decryptE2EEDataMessage(msg);
	// The stub returned the keyMaterial/fileName we set above.
	assertEquals(out.fileName, "x");
	// Verify the by-id lookup happened for receiverKeyId=9, not 11.
	assert(lookups.includes("9"), "expected by-keyId lookup for 9");
	assertEquals(
		Buffer.from(oldKey.privKey, "base64").toString("base64"),
		seen.privK!.toString("base64"),
	);
});

Deno.test("decryptE2EEDataMessage — sent: looks up self-key by senderKeyId (#88)", async () => {
	const key7 = { privKey: "AAAA", pubKey: "BBBB" };
	const key11 = { privKey: "CCCC", pubKey: "DDDD" };
	const { e2ee, seen, lookups } = makeE2EE({
		keysByKeyId: { "7": key7, "11": key11 },
		latestKey: key11,
		receiverPubKey: Buffer.alloc(32),
	});
	const msg = makeFakeMessage({
		senderKeyId: 7,
		receiverKeyId: 11,
		contentType: "IMAGE",
		from: "u-self", // I sent it
		to: "u-them",
	});
	await e2ee.decryptE2EEDataMessage(msg);
	assert(lookups.includes("7"), "expected by-keyId lookup for senderKeyId 7");
	assertEquals(
		Buffer.from(key7.privKey, "base64").toString("base64"),
		seen.privK!.toString("base64"),
	);
});

Deno.test("decryptE2EEDataMessage — falls back to latest key when by-id miss (#88)", async () => {
	const newKey = { privKey: "ZZZZ", pubKey: "YYYY" };
	const { e2ee, seen } = makeE2EE({
		keysByKeyId: {}, // empty by-id store
		latestKey: newKey,
		receiverPubKey: Buffer.alloc(32),
	});
	const msg = makeFakeMessage({
		senderKeyId: 7,
		receiverKeyId: 9,
		contentType: "IMAGE",
		from: "u-them",
		to: "u-self",
	});
	await e2ee.decryptE2EEDataMessage(msg);
	assertEquals(
		Buffer.from(newKey.privKey, "base64").toString("base64"),
		seen.privK!.toString("base64"),
	);
});
