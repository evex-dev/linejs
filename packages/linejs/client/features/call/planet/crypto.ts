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
 *   4. Stage-1 PLANET KDF (kdf_id=3, SHA-512):
 *        PRK = HMAC-SHA512(key = route mpkey, data = ecdh_secret)
 *        OUT = HMAC-SHA512(key = PRK, data = local_pub || u32be(0))
 *        → 64-byte forward base material
 *
 *      Reverse direction repeats stage 1 with the public keys swapped.
 *
 *   5. Stage-2 PLANET KDF:
 *        PRK = HMAC-SHA512(key = 16-byte bootstrap seed,
 *                          data = 64-byte stage1 output)
 *        OUT = HMAC-SHA512(key = PRK, data = 2-byte label || u32be(0))
 *        → 64-byte transport keying material
 *
 *   6. Native transport carve observed from `ear_crypto_aes_ctr_create`,
 *      `ear_crypto_aes_ctr_do`, and `ear_crypto_calc_hmac`:
 *        AES-128 key = stage2[0..16]
 *        CTR base    = stage2[16..32]
 *        HMAC key    = stage2[32..64]
 *
 *      Per packet, the CTR IV is `CTR base XOR seq_hi/seq_lo` repeated
 *      across alternating bytes. The 16-bit sequence is the clear value in
 *      PLANET header bytes 2..3.
 *
 * The exported native function is named `ear_crypto_hkdf`, but live
 * arguments plus disassembly show it is not RFC 5869 HKDF. It is the
 * HMAC-based counter KDF above.
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
			`decodeMpKey: unexpected parity byte 0x${
				out[0].toString(16)
			}, want 0x02/0x03`,
		);
	}
	return out;
}

/** Decode route.stnpk to a SEC1 P-256 public key.
 *
 * LINE returns stnpk as a base64 DER SubjectPublicKeyInfo. The useful ECDH
 * point is the trailing uncompressed SEC1 point: 0x04 || X || Y.
 */
export function decodeStnpkPublicKey(b64: string): Uint8Array {
	const bin = atob(b64);
	const raw = new Uint8Array(bin.length);
	for (let i = 0; i < bin.length; i++) raw[i] = bin.charCodeAt(i);
	if (raw.length === 33 && (raw[0] === 0x02 || raw[0] === 0x03)) {
		return raw;
	}
	if (raw.length === 65 && raw[0] === 0x04) return raw;
	if (raw.length >= 65 && raw[raw.length - 65] === 0x04) {
		return raw.subarray(raw.length - 65);
	}
	throw new Error(
		`decodeStnpkPublicKey: unsupported key material length ${raw.length}`,
	);
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

function hmacDigest(
	algorithm: "sha256" | "sha512",
	key: Uint8Array,
	...parts: Uint8Array[]
): Uint8Array {
	const h = createHmac(algorithm, key);
	for (const p of parts) h.update(p);
	return new Uint8Array(h.digest());
}

function hmacSha512(key: Uint8Array, ...parts: Uint8Array[]): Uint8Array {
	return hmacDigest("sha512", key, ...parts);
}

function u32be(v: number): Uint8Array {
	const out = new Uint8Array(4);
	out[0] = (v >>> 24) & 0xff;
	out[1] = (v >>> 16) & 0xff;
	out[2] = (v >>> 8) & 0xff;
	out[3] = v & 0xff;
	return out;
}

/** Native PLANET KDF used by `ear_crypto_hkdf` for kdf_id=3/SHA-512.
 *  This is not RFC HKDF:
 *
 *    prk = HMAC-SHA512(key = ikm, data = salt)
 *    block[i] = HMAC-SHA512(key = prk, data = info || u32be(i))
 *
 *  The first counter value is 0, matching live `ear_crypto_hkdf` output.
 */
export function planetKdfSha512(
	salt: Uint8Array,
	ikm: Uint8Array,
	info: Uint8Array,
	outLen = 64,
): Uint8Array {
	return planetKdf("sha512", salt, ikm, info, outLen);
}

/** Native PLANET KDF used by media-key setup for kdf_id=2/SHA-256. */
export function planetKdfSha256(
	salt: Uint8Array,
	ikm: Uint8Array,
	info: Uint8Array,
	outLen = 32,
): Uint8Array {
	return planetKdf("sha256", salt, ikm, info, outLen);
}

function planetKdf(
	algorithm: "sha256" | "sha512",
	salt: Uint8Array,
	ikm: Uint8Array,
	info: Uint8Array,
	outLen: number,
): Uint8Array {
	if (outLen < 0) throw new Error("planetKdf: outLen < 0");
	const prk = hmacDigest(algorithm, ikm, salt);
	const out = new Uint8Array(outLen);
	let written = 0;
	let counter = 0;
	while (written < outLen) {
		const block = hmacDigest(algorithm, prk, info, u32be(counter++));
		const n = Math.min(block.length, outLen - written);
		out.set(block.subarray(0, n), written);
		written += n;
	}
	return out;
}

/** Stage-1 KDF: derive 64-byte session base from ECDH secret + the two
 *  SEC1 compressed public keys. `ikmPub` and `infoPub` are intentionally
 *  ordered; native computes one base per direction by swapping them. */
export function planetHkdfStage1(
	ecdhSecret: Uint8Array,
	ikmPub: Uint8Array,
	infoPub: Uint8Array,
): Uint8Array {
	if (ecdhSecret.length !== 32) {
		throw new Error("planetHkdfStage1: ecdhSecret must be 32 bytes");
	}
	if (ikmPub.length !== 33 || infoPub.length !== 33) {
		throw new Error("planetHkdfStage1: pubkeys must be 33 bytes SEC1");
	}
	return planetKdfSha512(ecdhSecret, ikmPub, infoPub, 64);
}

export interface PlanetMediaKeyPeer {
	publicKey: Uint8Array;
	mediaKeyId: number;
	mediaNonce: Uint8Array;
}

export interface PlanetMediaKeyLocal extends PlanetMediaKeyPeer {
	privateKey: Uint8Array;
}

export interface PlanetMediaKeys {
	sendKeying: Uint8Array;
	recvKeying: Uint8Array;
	sendRaw: Uint8Array;
	recvRaw: Uint8Array;
	sendStage1: Uint8Array;
	recvStage1: Uint8Array;
	ecdhSecret: Uint8Array;
}

export type PlanetMediaKeyVariantName =
	| "local-peer/peer"
	| "peer-local/local"
	| "local-peer/local"
	| "peer-local/peer";

export interface PlanetMediaKeyingVariants {
	variants: Record<PlanetMediaKeyVariantName, Uint8Array>;
	raw: Record<PlanetMediaKeyVariantName, Uint8Array>;
	localPeerStage1: Uint8Array;
	peerLocalStage1: Uint8Array;
	ecdhSecret: Uint8Array;
}

const MEDIA_STREAM_KEY_NAMES = new Set(["AUDIO", "VIDEO", "DATA"]);

export function derivePlanetMediaStreamKeying(
	baseKeying: Uint8Array,
	streamName: "AUDIO" | "VIDEO" | "DATA" = "AUDIO",
): Uint8Array {
	if (baseKeying.length !== 30) {
		throw new Error(
			`derivePlanetMediaStreamKeying: base keying must be 30 bytes, got ${baseKeying.length}`,
		);
	}
	if (!MEDIA_STREAM_KEY_NAMES.has(streamName)) {
		throw new Error(
			`derivePlanetMediaStreamKeying: invalid stream ${streamName}`,
		);
	}
	const streamKey = new TextEncoder().encode(streamName);
	return hmacDigest("sha256", streamKey, baseKeying).subarray(0, 30);
}

export function buildPlanetMediaKeyInfo(mediaKeyId: number): Uint8Array {
	const out = new Uint8Array(8);
	out.set(u32be(mediaKeyId >>> 0), 0);
	return out;
}

/** Derive LINE's PLANET media SRTP keying material.
 *
 * Native capture shows kdf_id=2/SHA-256 in two stages:
 *   stage1 = KDF-SHA256(ECDH(local_priv, peer_pub), ordered_pub_a, ordered_pub_b)
 *   stage2 = KDF-SHA256(stage1, media_nonce, u32be(media_key_id) || 0)
 *
 * The outgoing SRTP key uses the peer's nonce/key id. The incoming SRTP key
 * uses our advertised nonce/key id. The first 30 bytes are the SRTP master key
 * and salt expected by AES_CM_128_HMAC_SHA1_80.
 */
export function derivePlanetMediaKeys(opts: {
	local: PlanetMediaKeyLocal;
	peer: PlanetMediaKeyPeer;
}): PlanetMediaKeys {
	const derived = derivePlanetMediaKeyingVariants(opts);
	const sendRaw = derived.raw["local-peer/peer"];
	const recvRaw = derived.raw["peer-local/local"];
	return {
		sendKeying: derived.variants["local-peer/peer"],
		recvKeying: derived.variants["peer-local/local"],
		sendRaw,
		recvRaw,
		sendStage1: derived.localPeerStage1,
		recvStage1: derived.peerLocalStage1,
		ecdhSecret: derived.ecdhSecret,
	};
}

export function derivePlanetMediaKeyingVariants(opts: {
	local: PlanetMediaKeyLocal;
	peer: PlanetMediaKeyPeer;
}): PlanetMediaKeyingVariants {
	if (opts.local.privateKey.length !== 32) {
		throw new Error(
			"derivePlanetMediaKeys: local private key must be 32 bytes",
		);
	}
	if (opts.local.publicKey.length !== 33 || opts.peer.publicKey.length !== 33) {
		throw new Error(
			"derivePlanetMediaKeys: media public keys must be 33 bytes",
		);
	}
	if (
		opts.local.mediaNonce.length !== 16 || opts.peer.mediaNonce.length !== 16
	) {
		throw new Error("derivePlanetMediaKeys: media nonces must be 16 bytes");
	}
	const ecdhSecret = ecdh(opts.local.privateKey, opts.peer.publicKey);
	const localPeerStage1 = planetKdfSha256(
		ecdhSecret,
		opts.local.publicKey,
		opts.peer.publicKey,
		32,
	);
	const peerLocalStage1 = planetKdfSha256(
		ecdhSecret,
		opts.peer.publicKey,
		opts.local.publicKey,
		32,
	);
	const localPeerPeerRaw = planetKdfSha256(
		localPeerStage1,
		opts.peer.mediaNonce,
		buildPlanetMediaKeyInfo(opts.peer.mediaKeyId),
		32,
	);
	const peerLocalLocalRaw = planetKdfSha256(
		peerLocalStage1,
		opts.local.mediaNonce,
		buildPlanetMediaKeyInfo(opts.local.mediaKeyId),
		32,
	);
	const localPeerLocalRaw = planetKdfSha256(
		localPeerStage1,
		opts.local.mediaNonce,
		buildPlanetMediaKeyInfo(opts.local.mediaKeyId),
		32,
	);
	const peerLocalPeerRaw = planetKdfSha256(
		peerLocalStage1,
		opts.peer.mediaNonce,
		buildPlanetMediaKeyInfo(opts.peer.mediaKeyId),
		32,
	);
	return {
		variants: {
			"local-peer/peer": localPeerPeerRaw.subarray(0, 30),
			"peer-local/local": peerLocalLocalRaw.subarray(0, 30),
			"local-peer/local": localPeerLocalRaw.subarray(0, 30),
			"peer-local/peer": peerLocalPeerRaw.subarray(0, 30),
		},
		raw: {
			"local-peer/peer": localPeerPeerRaw,
			"peer-local/local": peerLocalLocalRaw,
			"local-peer/local": localPeerLocalRaw,
			"peer-local/peer": peerLocalPeerRaw,
		},
		localPeerStage1,
		peerLocalStage1,
		ecdhSecret,
	};
}

export interface TransportKeys {
	/** AES-128-CTR encryption key, 16 bytes. */
	encKey: Uint8Array;
	/** HMAC-SHA256 key, 32 bytes. Native truncates the digest to 16 bytes. */
	macKey: Uint8Array;
	/** 16-byte CTR base mixed with the clear 16-bit packet sequence. */
	ctrBase: Uint8Array;
	/** Full 64-byte native stage-2 KDF output. */
	raw: Uint8Array;
}

/** Stage-2 KDF and native key carve. */
export function planetHkdfStage2(
	stage1Base: Uint8Array,
	bootstrapSeed16: Uint8Array,
	directionLabel2: Uint8Array,
): TransportKeys {
	if (stage1Base.length !== 64) {
		throw new Error("planetHkdfStage2: stage1Base must be 64 bytes");
	}
	if (bootstrapSeed16.length !== 16) {
		throw new Error("planetHkdfStage2: bootstrap seed must be 16 bytes");
	}
	if (directionLabel2.length !== 2) {
		throw new Error("planetHkdfStage2: direction label must be 2 bytes");
	}
	const out = planetKdfSha512(stage1Base, bootstrapSeed16, directionLabel2, 64);
	return {
		encKey: out.subarray(0, 16),
		macKey: out.subarray(32, 64),
		ctrBase: out.subarray(16, 32),
		raw: out,
	};
}

/** Build the native PLANET per-packet CTR IV.
 *
 * Native code copies the 16-byte base at transport offset `0x1180` and XORs
 * alternating bytes with the clear packet sequence high and low bytes.
 */
export function buildPlanetCtrIv(
	ctrBase: Uint8Array,
	sequence: number,
): Uint8Array {
	if (ctrBase.length !== 16) {
		throw new Error("buildPlanetCtrIv: ctrBase must be 16 bytes");
	}
	const hi = (sequence >>> 8) & 0xff;
	const lo = sequence & 0xff;
	const out = new Uint8Array(16);
	for (let i = 0; i < out.length; i++) {
		out[i] = ctrBase[i] ^ (i % 2 === 0 ? hi : lo);
	}
	return out;
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
	const c = createCipheriv(aesCtrAlgorithm(key), key, iv);
	return new Uint8Array(Buffer.concat([c.update(plaintext), c.final()]));
}

export function aesCtrDecrypt(
	key: Uint8Array,
	iv: Uint8Array,
	ciphertext: Uint8Array,
): Uint8Array {
	const c = createDecipheriv(aesCtrAlgorithm(key), key, iv);
	return new Uint8Array(Buffer.concat([c.update(ciphertext), c.final()]));
}

function aesCtrAlgorithm(key: Uint8Array): "aes-128-ctr" | "aes-256-ctr" {
	if (key.length === 16) return "aes-128-ctr";
	if (key.length === 32) return "aes-256-ctr";
	throw new Error(`AES-CTR key must be 16 or 32 bytes, got ${key.length}`);
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

/** Build the native 2-byte per-direction label seen in the plaintext
 *  bootstrap prefix and in stage-2 KDF `info`. */
export function buildDirectionLabel(label16: number): Uint8Array {
	const t = new Uint8Array(2);
	t[0] = (label16 >>> 8) & 0xff;
	t[1] = label16 & 0xff;
	return t;
}

/** End-to-end key derivation: from a CallRoute mpkey + a fresh local
 *  ephemeral keypair, derive both directions' transport keys. */
export function deriveCallKeys(opts: {
	mpkey: Uint8Array; // peer EC pub (33B SEC1)
	local: EphemeralKeypair;
	bootstrapSeed: Uint8Array; // 16B
	sendLabel: number;
	recvLabel: number;
}): {
	send: TransportKeys;
	recv: TransportKeys;
	ourPub: Uint8Array;
	ecdhSecret: Uint8Array;
} {
	const ecdhSecret = ecdh(opts.local.privateKey, opts.mpkey);
	const sendStage1 = planetHkdfStage1(
		ecdhSecret,
		opts.mpkey,
		opts.local.publicKey,
	);
	const recvStage1 = planetHkdfStage1(
		ecdhSecret,
		opts.local.publicKey,
		opts.mpkey,
	);
	const send = planetHkdfStage2(
		sendStage1,
		opts.bootstrapSeed,
		buildDirectionLabel(opts.sendLabel),
	);
	const recv = planetHkdfStage2(
		recvStage1,
		opts.bootstrapSeed,
		buildDirectionLabel(opts.recvLabel),
	);
	return { send, recv, ourPub: opts.local.publicKey, ecdhSecret };
}
