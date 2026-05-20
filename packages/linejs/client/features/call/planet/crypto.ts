/**
 * PLANET call crypto, ground-truth revision.
 *
 * Reverse-engineered from a real LINE call (`ear_crypto_hkdf` Frida
 * hook on `tom` call, 2026-05-21). Earlier guess of "mpkey is the
 * master secret" was wrong; mpkey is actually the peer's ephemeral
 * P-256 public key.
 *
 * Real keying flow (observed):
 *
 *   1. CallRoute.commParam.mpkey  = peer's ephemeral P-256 compressed
 *      public key, SEC1 format (1-byte 0x02/0x03 parity + 32-byte X),
 *      base64-encoded to 44 chars, decodes to 33 raw bytes.
 *
 *   2. Local side generates its own ephemeral P-256 keypair.
 *
 *   3. ECDH(local_priv, peer_pub) → 32-byte shared secret (P-256 X
 *      coordinate of the resulting point).
 *
 *   4. Stage-1 HKDF (kdf_id=3 → hash_id=64 = SHA-512):
 *        HKDF-SHA512(
 *          salt = ecdh_shared_secret (32B),
 *          ikm  = our_pub (33B SEC1 compressed),
 *          info = peer_pub (33B SEC1 compressed = mpkey),
 *        ) → 64-byte session base material
 *
 *   5. Stage-2 HKDF (kdf_id=2 → hash_id=32 = SHA-256):
 *        HKDF-SHA256(
 *          salt = stage1_out[:32],
 *          ikm  = 16-byte session id (random per call),
 *          info = 8-byte direction tag (first 4 BE bytes = counter,
 *                 last 4 = zero) — different label per direction.
 *        ) → 128-byte transport keying material
 *
 *   6. Transport keys carved from stage2_out (observed pattern fits
 *      32B encKey + 32B macKey + 16B IV-nonce + 48B reserve).
 *
 * The matching libtomcrypt functions live behind ear_crypto_hkdf's
 * dispatch table (`_get_hash_type_from_kdf` at va 0xcb5cd8):
 *
 *      kdf_id=1 -> hash_id=1  (SHA-1)
 *      kdf_id=2 -> hash_id=32 (SHA-256)
 *      kdf_id=3 -> hash_id=64 (SHA-512)
 *      kdf_id=4 -> hash_id=1  (SHA-1)
 *      kdf_id=5 -> hash_id=32 (SHA-256)
 *      kdf_id=6 -> hash_id=64 (SHA-512)
 *      default  -> hash_id=2
 */

import { Buffer } from "node:buffer";
import {
	createCipheriv,
	createDecipheriv,
	createECDH,
	createHash,
	createHmac,
	createPrivateKey,
	createPublicKey,
	hkdfSync,
	randomBytes,
} from "node:crypto";

/** Decode a base64 mpkey to its 33-byte SEC1 compressed P-256 public key. */
export function decodeMpKey(b64: string): Uint8Array {
	const bin = atob(b64);
	const out = new Uint8Array(bin.length);
	for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
	if (out.length !== 33) {
		throw new Error(
			`decodeMpKey: expected 33 bytes (P-256 compressed), got ${out.length}`,
		);
	}
	if (out[0] !== 0x02 && out[0] !== 0x03) {
		throw new Error(
			`decodeMpKey: unexpected parity byte 0x${out[0].toString(16)}, want 0x02/0x03`,
		);
	}
	return out;
}

/** A freshly-generated local ephemeral P-256 keypair, with the public
 *  key materialised in SEC1 compressed form (1-byte parity + 32-byte X). */
export interface EphemeralKeypair {
	privateKey: Uint8Array; // 32-byte scalar (for ECDH input)
	publicKey: Uint8Array; // 33-byte SEC1 compressed
}

export function generateEphemeralKeypair(): EphemeralKeypair {
	const ec = createECDH("prime256v1");
	ec.generateKeys();
	return {
		privateKey: new Uint8Array(ec.getPrivateKey()),
		publicKey: new Uint8Array(ec.getPublicKey(undefined, "compressed")),
	};
}

/** Compute the ECDH shared secret (32-byte X coordinate of dH*P). */
export function ecdh(
	localPriv: Uint8Array,
	peerPub: Uint8Array,
): Uint8Array {
	const ec = createECDH("prime256v1");
	ec.setPrivateKey(Buffer.from(localPriv));
	return new Uint8Array(ec.computeSecret(Buffer.from(peerPub)));
}

/** Stage-1 HKDF: derive 64-byte session base from ECDH secret + the
 *  two SEC1 compressed public keys. */
export function planetHkdfStage1(
	ecdhSecret: Uint8Array,
	ourPub: Uint8Array,
	peerPub: Uint8Array,
): Uint8Array {
	if (ecdhSecret.length !== 32) {
		throw new Error("planetHkdfStage1: ecdhSecret must be 32 bytes");
	}
	if (ourPub.length !== 33 || peerPub.length !== 33) {
		throw new Error("planetHkdfStage1: pubkeys must be 33 bytes SEC1");
	}
	return new Uint8Array(
		hkdfSync("sha512", ourPub, ecdhSecret, peerPub, 64),
	);
}

export interface TransportKeys {
	/** AES-256-CTR encryption key, 32 bytes. */
	encKey: Uint8Array;
	/** HMAC-SHA256 authentication key, 32 bytes. */
	macKey: Uint8Array;
	/** 16-byte CTR nonce/IV base. */
	ivNonce: Uint8Array;
	/** Remaining 48 bytes of HKDF output (reserved). */
	reserve: Uint8Array;
}

/** Stage-2 HKDF: carve 128 bytes of transport keying material from the
 *  stage-1 base + a per-direction tag + a 16-byte session-id. */
export function planetHkdfStage2(
	stage1Base: Uint8Array,
	sessionId16: Uint8Array,
	directionTag8: Uint8Array,
): TransportKeys {
	if (stage1Base.length < 32) {
		throw new Error("planetHkdfStage2: stage1Base too short");
	}
	if (sessionId16.length !== 16) {
		throw new Error("planetHkdfStage2: sessionId must be 16 bytes");
	}
	if (directionTag8.length !== 8) {
		throw new Error("planetHkdfStage2: directionTag must be 8 bytes");
	}
	const out = new Uint8Array(
		hkdfSync("sha256", sessionId16, stage1Base.subarray(0, 32), directionTag8, 128),
	);
	return {
		encKey: out.subarray(0, 32),
		macKey: out.subarray(32, 64),
		ivNonce: out.subarray(64, 80),
		reserve: out.subarray(80, 128),
	};
}

/** Build the per-packet CTR IV: ivNonce[0..11] || 4-byte BE counter. */
export function buildCtrIv(ivNonce: Uint8Array, counter: number): Uint8Array {
	if (ivNonce.length < 12) throw new Error("buildCtrIv: ivNonce < 12 bytes");
	const iv = new Uint8Array(16);
	iv.set(ivNonce.subarray(0, 12), 0);
	iv[12] = (counter >>> 24) & 0xff;
	iv[13] = (counter >>> 16) & 0xff;
	iv[14] = (counter >>> 8) & 0xff;
	iv[15] = counter & 0xff;
	return iv;
}

/** AES-256-CTR encrypt. */
export function aesCtrEncrypt(
	key: Uint8Array,
	iv: Uint8Array,
	plaintext: Uint8Array,
): Uint8Array {
	const c = createCipheriv("aes-256-ctr", key, iv);
	return new Uint8Array(Buffer.concat([c.update(plaintext), c.final()]));
}

export function aesCtrDecrypt(
	key: Uint8Array,
	iv: Uint8Array,
	ciphertext: Uint8Array,
): Uint8Array {
	const c = createDecipheriv("aes-256-ctr", key, iv);
	return new Uint8Array(Buffer.concat([c.update(ciphertext), c.final()]));
}

/** HMAC-SHA256, truncated to 16 bytes (the apparent PLANET tag size). */
export function hmacTag(key: Uint8Array, data: Uint8Array): Uint8Array {
	const h = createHmac("sha256", key);
	h.update(data);
	return new Uint8Array(h.digest()).subarray(0, 16);
}

export function tagEquals(a: Uint8Array, b: Uint8Array): boolean {
	if (a.length !== b.length) return false;
	let diff = 0;
	for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
	return diff === 0;
}

export function sha256(data: Uint8Array): Uint8Array {
	return new Uint8Array(createHash("sha256").update(data).digest());
}

/** Random 16-byte session ID. */
export function newSessionId(): Uint8Array {
	return new Uint8Array(randomBytes(16));
}

/** Build the 8-byte direction tag: 4-byte BE counter + 4 zero bytes.
 *  The captured wire used 0x329aba33 and 0x8bd74aaa as the leading 4 bytes
 *  — these are per-session random labels, NOT a monotonic counter. */
export function buildDirectionTag(label32: number): Uint8Array {
	const t = new Uint8Array(8);
	t[0] = (label32 >>> 24) & 0xff;
	t[1] = (label32 >>> 16) & 0xff;
	t[2] = (label32 >>> 8) & 0xff;
	t[3] = label32 & 0xff;
	return t;
}

/** End-to-end key derivation: from a CallRoute mpkey + a fresh local
 *  ephemeral keypair, derive both directions' transport keys. */
export function deriveCallKeys(opts: {
	mpkey: Uint8Array; // peer EC pub (33B SEC1)
	local: EphemeralKeypair;
	sessionId: Uint8Array; // 16B
	sendLabel: number;
	recvLabel: number;
}): { send: TransportKeys; recv: TransportKeys; ourPub: Uint8Array; ecdhSecret: Uint8Array } {
	const ecdhSecret = ecdh(opts.local.privateKey, opts.mpkey);
	const stage1 = planetHkdfStage1(ecdhSecret, opts.local.publicKey, opts.mpkey);
	const send = planetHkdfStage2(stage1, opts.sessionId, buildDirectionTag(opts.sendLabel));
	const recv = planetHkdfStage2(stage1, opts.sessionId, buildDirectionTag(opts.recvLabel));
	return { send, recv, ourPub: opts.local.publicKey, ecdhSecret };
}
