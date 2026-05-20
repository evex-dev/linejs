// SRTP AES_CM_128_HMAC_SHA1_80 (RFC 3711).
// Key derivation: AES-CM PRF per §4.3.

import { Buffer } from "node:buffer";

const HMAC_TAG_LEN = 10; // SHA1_80 = 80 bits = 10 bytes
const SRTP_KEY_LEN = 16; // AES-CM-128
const SRTP_SALT_LEN = 14; // 112-bit salt
export const SRTP_KEYING_LEN = SRTP_KEY_LEN + SRTP_SALT_LEN; // 30 bytes

export interface SrtpCryptoContext {
	cipherKey: Uint8Array;
	cipherSalt: Uint8Array;
	authKey: Uint8Array;
	rocs: Map<number, number>;
}

const LABEL_RTP_ENCR = 0x00;
const LABEL_RTP_AUTH = 0x01;
const LABEL_RTP_SALT = 0x02;

/** Derive SRTP session keys from the 30-byte SDES master keying material. */
export async function deriveSrtpContext(masterKeying: Uint8Array): Promise<SrtpCryptoContext> {
	if (masterKeying.length !== SRTP_KEYING_LEN) {
		throw new Error(`SRTP master keying must be ${SRTP_KEYING_LEN} bytes, got ${masterKeying.length}`);
	}
	const masterKey = masterKeying.subarray(0, SRTP_KEY_LEN);
	const masterSalt = masterKeying.subarray(SRTP_KEY_LEN);
	const cipherKey = await deriveKey(masterKey, masterSalt, LABEL_RTP_ENCR, 16);
	const authKey = await deriveKey(masterKey, masterSalt, LABEL_RTP_AUTH, 20);
	const cipherSalt = await deriveKey(masterKey, masterSalt, LABEL_RTP_SALT, 14);
	return { cipherKey, cipherSalt, authKey, rocs: new Map() };
}

/** AES-CM PRF: encrypt the IV with the master key to produce L bytes. */
async function deriveKey(
	masterKey: Uint8Array,
	masterSalt: Uint8Array,
	label: number,
	len: number,
): Promise<Uint8Array> {
	// IV = master_salt XOR (label || 0...0), padded right with two zero bytes
	const iv = new Uint8Array(16);
	iv.set(masterSalt.subarray(0, 14), 0);
	iv[7] ^= label;
	// CM counter mode: encrypt successive 16-byte blocks of (iv || ctr=0,1,…)
	const { createCipheriv } = await import("node:crypto");
	const ctrIv = new Uint8Array(16);
	ctrIv.set(iv);
	const cipher = createCipheriv("aes-128-ctr", masterKey, Buffer.from(ctrIv));
	const out = Buffer.concat([cipher.update(Buffer.alloc(len)), cipher.final()]);
	return new Uint8Array(out.subarray(0, len));
}

/** Encrypt an RTP packet in place + append the 80-bit auth tag. */
export async function srtpEncrypt(
	ctx: SrtpCryptoContext,
	rtpPacket: Uint8Array,
): Promise<Uint8Array> {
	if (rtpPacket.length < 12) throw new Error("RTP packet too short");
	const header = rtpPacket.subarray(0, 12);
	const payload = rtpPacket.subarray(12);
	const ssrc = readU32(rtpPacket, 8);
	const seq = readU16(rtpPacket, 2);
	const rocKey = ssrc;
	const roc = ctx.rocs.get(rocKey) ?? 0;
	const enc = await aesCmEncrypt(ctx.cipherKey, ctx.cipherSalt, ssrc, roc, seq, payload);

	const out = new Uint8Array(rtpPacket.length + HMAC_TAG_LEN);
	out.set(header, 0);
	out.set(enc, 12);

	// auth = HMAC-SHA1(authKey, packet || ROC) [0..10]
	const { createHmac } = await import("node:crypto");
	const h = createHmac("sha1", Buffer.from(ctx.authKey));
	h.update(Buffer.from(out.subarray(0, rtpPacket.length)));
	const rocBuf = new Uint8Array(4);
	writeU32(rocBuf, 0, roc);
	h.update(Buffer.from(rocBuf));
	const tag = new Uint8Array(h.digest()).subarray(0, HMAC_TAG_LEN);
	out.set(tag, rtpPacket.length);

	// Increment ROC on seq wrap.
	if (seq === 0xffff) ctx.rocs.set(rocKey, (roc + 1) & 0xffffffff);
	else ctx.rocs.set(rocKey, roc);
	return out;
}

/** Verify the auth tag + decrypt an SRTP packet. */
export async function srtpDecrypt(
	ctx: SrtpCryptoContext,
	srtpPacket: Uint8Array,
): Promise<Uint8Array> {
	if (srtpPacket.length < 12 + HMAC_TAG_LEN) throw new Error("SRTP packet too short");
	const taggedLen = srtpPacket.length - HMAC_TAG_LEN;
	const tag = srtpPacket.subarray(taggedLen);
	const inner = srtpPacket.subarray(0, taggedLen);

	const ssrc = readU32(srtpPacket, 8);
	const seq = readU16(srtpPacket, 2);
	const roc = ctx.rocs.get(ssrc) ?? 0;

	const { createHmac } = await import("node:crypto");
	const h = createHmac("sha1", Buffer.from(ctx.authKey));
	h.update(Buffer.from(inner));
	const rocBuf = new Uint8Array(4);
	writeU32(rocBuf, 0, roc);
	h.update(Buffer.from(rocBuf));
	const expected = new Uint8Array(h.digest()).subarray(0, HMAC_TAG_LEN);
	if (!constantTimeEqual(tag, expected)) {
		throw new Error("SRTP auth tag mismatch");
	}
	const payload = inner.subarray(12);
	const dec = await aesCmEncrypt(ctx.cipherKey, ctx.cipherSalt, ssrc, roc, seq, payload);
	const out = new Uint8Array(12 + dec.length);
	out.set(inner.subarray(0, 12), 0);
	out.set(dec, 12);
	return out;
}

async function aesCmEncrypt(
	key: Uint8Array,
	salt: Uint8Array,
	ssrc: number,
	roc: number,
	seq: number,
	payload: Uint8Array,
): Promise<Uint8Array> {
	// IV = (salt || 0_16) XOR (ssrc<<64 | roc<<32 | seq<<16) per RFC 3711 §4.1.1
	const iv = new Uint8Array(16);
	iv.set(salt, 0); // first 14 bytes
	// XOR SSRC into bytes 4..7
	iv[4] ^= (ssrc >>> 24) & 0xff;
	iv[5] ^= (ssrc >>> 16) & 0xff;
	iv[6] ^= (ssrc >>> 8) & 0xff;
	iv[7] ^= ssrc & 0xff;
	// XOR ROC into bytes 8..11
	iv[8] ^= (roc >>> 24) & 0xff;
	iv[9] ^= (roc >>> 16) & 0xff;
	iv[10] ^= (roc >>> 8) & 0xff;
	iv[11] ^= roc & 0xff;
	// XOR SEQ into bytes 12..13
	iv[12] ^= (seq >>> 8) & 0xff;
	iv[13] ^= seq & 0xff;
	// Final two bytes (14..15) start as counter 0 — Node aes-128-ctr increments them
	const { createCipheriv } = await import("node:crypto");
	const cipher = createCipheriv("aes-128-ctr", Buffer.from(key), Buffer.from(iv));
	const out = Buffer.concat([cipher.update(Buffer.from(payload)), cipher.final()]);
	return new Uint8Array(out.subarray(0, payload.length));
}

function readU16(b: Uint8Array, o: number): number { return (b[o] << 8) | b[o + 1]; }
function readU32(b: Uint8Array, o: number): number {
	return ((b[o] << 24) | (b[o + 1] << 16) | (b[o + 2] << 8) | b[o + 3]) >>> 0;
}
function writeU32(b: Uint8Array, o: number, v: number) {
	b[o] = (v >>> 24) & 0xff;
	b[o + 1] = (v >>> 16) & 0xff;
	b[o + 2] = (v >>> 8) & 0xff;
	b[o + 3] = v & 0xff;
}
function constantTimeEqual(a: Uint8Array, b: Uint8Array): boolean {
	if (a.length !== b.length) return false;
	let r = 0;
	for (let i = 0; i < a.length; i++) r |= a[i] ^ b[i];
	return r === 0;
}

/** Build a minimal RTP packet (v=2, no extensions, no padding). */
export function buildRtp(opts: {
	payloadType: number;
	seq: number;
	timestamp: number;
	ssrc: number;
	payload: Uint8Array;
	marker?: boolean;
}): Uint8Array {
	const out = new Uint8Array(12 + opts.payload.length);
	out[0] = 0x80; // V=2, P=0, X=0, CC=0
	out[1] = ((opts.marker ? 0x80 : 0) | (opts.payloadType & 0x7f)) & 0xff;
	out[2] = (opts.seq >>> 8) & 0xff;
	out[3] = opts.seq & 0xff;
	writeU32(out, 4, opts.timestamp >>> 0);
	writeU32(out, 8, opts.ssrc >>> 0);
	out.set(opts.payload, 12);
	return out;
}

export function parseRtp(pkt: Uint8Array): {
	payloadType: number;
	seq: number;
	timestamp: number;
	ssrc: number;
	marker: boolean;
	payload: Uint8Array;
} {
	if (pkt.length < 12) throw new Error("RTP too short");
	return {
		payloadType: pkt[1] & 0x7f,
		marker: (pkt[1] & 0x80) !== 0,
		seq: readU16(pkt, 2),
		timestamp: readU32(pkt, 4),
		ssrc: readU32(pkt, 8),
		payload: pkt.subarray(12),
	};
}
