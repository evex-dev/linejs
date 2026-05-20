/**
 * PLANET transport encryption.
 *
 * libandromeda uses libtomcrypt (`ltc_*` symbols) for the call crypto:
 *
 *   ltc_rijndael_setup / ltc_rijndael_ecb_encrypt   — AES block cipher
 *   ltc_ctr_start / ltc_ctr_encrypt / ltc_ctr_done — CTR mode
 *   ltc_hmac_init / ltc_hmac_process / ltc_hmac_done — HMAC
 *   ltc_ecc_make_key_ex / ltc_ecc_shared_secret    — ECDH (secp256r1)
 *   ear_crypto_hkdf                                 — HKDF expand
 *
 * The HKDF hash selector (`_get_hash_type_from_kdf`) maps:
 *   kdf=1 → SHA1, kdf=2 → SHA256, kdf=3 → SHA384,
 *   kdf=4 → SHA1, kdf=5 → SHA256, kdf=6 → SHA384.
 * Default fallback is hash_id=2 (= SHA256).
 *
 * The session keying material:
 *   - `CallRoute.commParam.mpkey` (base64, 32 bytes) is the master secret
 *     given by acquireCallRoute.
 *   - HKDF-SHA256 expands `mpkey` into separate AES-CTR key + HMAC key.
 *   - The chunk_hdr's sequence number is used as the AES-CTR counter
 *     initialisation so each datagram has a unique keystream.
 */

import { Buffer } from "node:buffer";
import {
	createCipheriv,
	createDecipheriv,
	createHash,
	createHmac,
	hkdfSync,
} from "node:crypto";

export interface PlanetSessionKeys {
	/** AES-256-CTR encryption key, 32 bytes. */
	encKey: Uint8Array;
	/** HMAC-SHA256 authentication key, 32 bytes. */
	macKey: Uint8Array;
	/** 12-byte IV/nonce prefix; the per-packet counter is mixed in for CTR. */
	ivPrefix: Uint8Array;
}

/** Decode a base64 mpkey to its 32-byte master secret. */
export function decodeMpKey(b64: string): Uint8Array {
	const bin = atob(b64);
	const out = new Uint8Array(bin.length);
	for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
	return out;
}

/**
 * Derive the session keys from `mpkey`. Uses HKDF-SHA256 with an `info`
 * label that matches libandromeda's ear_crypto_hkdf call convention.
 *
 * info layout (best-effort match to PLANET; the exact label has not yet
 * been confirmed against the binary):
 *
 *   "PLANET-CALL-v1" || sender_mid || receiver_mid
 */
export function deriveSessionKeys(
	mpkey: Uint8Array,
	from: string,
	to: string,
): PlanetSessionKeys {
	const info = new TextEncoder().encode(`PLANET-CALL-v1\0${from}\0${to}`);
	const salt = new Uint8Array(32); // libtomcrypt HKDF default-empty salt = zeros
	const km = new Uint8Array(hkdfSync("sha256", mpkey, salt, info, 76));
	return {
		encKey: km.subarray(0, 32),
		macKey: km.subarray(32, 64),
		ivPrefix: km.subarray(64, 76),
	};
}

/** Per-packet IV: 12-byte prefix || 4-byte big-endian sequence counter. */
export function buildIv(prefix: Uint8Array, sequence: number): Uint8Array {
	if (prefix.length !== 12) throw new Error("buildIv: prefix must be 12 bytes");
	const iv = new Uint8Array(16);
	iv.set(prefix, 0);
	iv[12] = (sequence >>> 24) & 0xff;
	iv[13] = (sequence >>> 16) & 0xff;
	iv[14] = (sequence >>> 8) & 0xff;
	iv[15] = sequence & 0xff;
	return iv;
}

/** Encrypt with AES-256-CTR using a session key + per-packet IV. */
export function encryptCtr(
	key: Uint8Array,
	iv: Uint8Array,
	plaintext: Uint8Array,
): Uint8Array {
	const c = createCipheriv("aes-256-ctr", key, iv);
	return new Uint8Array(Buffer.concat([c.update(plaintext), c.final()]));
}

export function decryptCtr(
	key: Uint8Array,
	iv: Uint8Array,
	ciphertext: Uint8Array,
): Uint8Array {
	const c = createDecipheriv("aes-256-ctr", key, iv);
	return new Uint8Array(Buffer.concat([c.update(ciphertext), c.final()]));
}

/** HMAC-SHA256, truncated to 16 bytes (matches LINE's apparent tag size). */
export function hmacTag(key: Uint8Array, data: Uint8Array): Uint8Array {
	const h = createHmac("sha256", key);
	h.update(data);
	return new Uint8Array(h.digest()).subarray(0, 16);
}

/** Constant-time tag compare. */
export function tagEquals(a: Uint8Array, b: Uint8Array): boolean {
	if (a.length !== b.length) return false;
	let diff = 0;
	for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
	return diff === 0;
}

/** SHA-256 helper (for fingerprints/IDs the PLANET layer needs). */
export function sha256(data: Uint8Array): Uint8Array {
	return new Uint8Array(createHash("sha256").update(data).digest());
}
