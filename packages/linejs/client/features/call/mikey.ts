// MIKEY-PKE (RFC 3830 §6.1) — Public Key Encryption mode.
//
// Wire layout of an I_MESSAGE (Initiator → Responder):
//   HDR  | T | RAND | [IDi] | [IDr] | [CERT] | PKE | KEMAC
//
// We need only the initiator side: the linejs library mints the SRTP
// master keying material (TGK), encrypts an envelope key with the
// peer's stnpk via RSA-OAEP, then wraps TGK + parameters in KEMAC
// authenticated with HMAC-SHA1 derived from the envelope key.

import { Buffer } from "node:buffer";

export const MIKEY_VERSION = 1;
export const DATA_TYPE_PKE_INIT = 2;

/** Payload type codes per RFC 3830 §6.1 / IANA. */
const PT_HDR = 0;
const PT_KEMAC = 1;
const PT_PKE = 2;
const PT_T = 5;
const PT_ID = 6;
const PT_RAND = 11;
const PT_SP = 10;
const PT_LAST = 0;

/** PRF function values. */
export const PRF_MIKEY_1 = 0;

/** Encryption algorithms (KEMAC). */
const ENCR_NULL = 0;
const ENCR_AES_CM_128 = 1;

/** MAC algorithms. */
const MAC_NULL = 0;
const MAC_HMAC_SHA1_160 = 1;

/** Key data type for the TGK carried in KEMAC. */
const KD_TGK = 2;

export interface MikeyPkeOpts {
	/** The peer's STNPK (RSA public key in DER/SPKI form). 256 bytes ≈ RSA-2048. */
	peerPublicKey: Uint8Array;
	/** 30-byte SRTP master keying material (16-byte key + 14-byte salt). */
	tgk: Uint8Array;
	/** Initiator (caller) identity. e.g. "u<mid>". */
	initiatorId?: string;
	/** Responder identity. */
	responderId?: string;
	/** CSB (Crypto Session Bundle) ID. Random 32-bit. */
	csbId?: number;
	/** Override the 16-byte envelope key (testing). */
	envelopeKey?: Uint8Array;
	/** Override the 16-byte RAND (testing). */
	rand?: Uint8Array;
	/** Override the NTP timestamp (testing). */
	ntpTimestamp?: bigint;
}

/** Build a complete MIKEY-PKE I_MESSAGE as a Uint8Array. */
export async function buildMikeyPke(opts: MikeyPkeOpts): Promise<Uint8Array> {
	if (opts.tgk.length !== 30) {
		throw new Error("MIKEY-PKE: tgk must be 30 bytes (16-byte key + 14-byte salt)");
	}
	const envKey = opts.envelopeKey ?? randomBytes(16);
	const rand = opts.rand ?? randomBytes(16);
	const csbId = opts.csbId ?? new DataView(randomBytes(4).buffer).getUint32(0);
	const ntp = opts.ntpTimestamp ?? nowNtp();

	// Derive encr_key + auth_key from envKey (RFC 3830 §4.1.4)
	const encrKey = await deriveMikeyKey(envKey, csbId, 0); // label 0 = encr
	const authKey = await deriveMikeyKey(envKey, csbId, 1); // label 1 = auth

	// Encrypt envelope key with peer's public key (RSA-OAEP)
	const pkeBody = await rsaOaepEncrypt(opts.peerPublicKey, envKey);

	// Build KEMAC body: encr(TGK || SP), then MAC over the whole message
	const kemacInner = buildKemacInner(opts.tgk);
	const kemacEncrypted = await aesCm128(encrKey, kemacInner);

	// Assemble payloads with proper next-payload chaining
	const idi = opts.initiatorId ? encodeIdPayload(opts.initiatorId) : null;
	const idr = opts.responderId ? encodeIdPayload(opts.responderId) : null;

	// Order: HDR | T | RAND | [IDi] | [IDr] | PKE | KEMAC
	const chunks: { type: number; data: Uint8Array }[] = [];
	chunks.push({ type: PT_HDR, data: encodeHdr({ csbId, csCount: 1 }) });
	chunks.push({ type: PT_T, data: encodeT(ntp) });
	chunks.push({ type: PT_RAND, data: encodeRand(rand) });
	if (idi) chunks.push({ type: PT_ID, data: idi });
	if (idr) chunks.push({ type: PT_ID, data: idr });
	chunks.push({ type: PT_PKE, data: encodePke(pkeBody) });
	chunks.push({ type: PT_KEMAC, data: encodeKemac(kemacEncrypted, /*macPlaceholder*/ 20) });

	// Stitch chunks with next-payload bytes
	const stitched = stitchPayloads(chunks);
	// Compute MAC over everything (including the KEMAC header but excluding
	// the trailing MAC bytes), then write it into the last 20 bytes
	const macInput = stitched.subarray(0, stitched.length - 20);
	const mac = await hmacSha1(authKey, macInput);
	stitched.set(mac.subarray(0, 20), stitched.length - 20);
	return stitched;
}

// ---------------------------------------------------------------------------
// Payload encoders

function encodeHdr(opts: { csbId: number; csCount: number }): Uint8Array {
	// HDR: version(1) | data_type(1) | next_payload(1, filled later) | V/PRF_func(1)
	//      | CSB_ID(4) | #CS(1) | CS_ID_map_type(1) | CS_ID_map_info(variable, here empty)
	const buf = new Uint8Array(10);
	buf[0] = MIKEY_VERSION;
	buf[1] = DATA_TYPE_PKE_INIT;
	buf[2] = 0; // next_payload — will be set by stitch
	buf[3] = (0 << 7) | (PRF_MIKEY_1 & 0x7f); // V=0 (no verification message)
	writeU32(buf, 4, opts.csbId);
	buf[8] = opts.csCount;
	buf[9] = 0; // CS_ID_map_type=0 (SRTP-ID)
	return buf;
}

function encodeT(ntp: bigint): Uint8Array {
	// T: next_payload(1, filled) | TS_type(1) | TS_value(8 for NTP)
	const buf = new Uint8Array(10);
	buf[0] = 0;
	buf[1] = 0; // TS_type=0 = NTP-UTC
	const dv = new DataView(buf.buffer);
	dv.setBigUint64(2, ntp, false);
	return buf;
}

function encodeRand(rand: Uint8Array): Uint8Array {
	// RAND: next_payload(1) | RAND len(1) | RAND data
	const buf = new Uint8Array(2 + rand.length);
	buf[0] = 0;
	buf[1] = rand.length;
	buf.set(rand, 2);
	return buf;
}

function encodeIdPayload(id: string): Uint8Array {
	const idBytes = new TextEncoder().encode(id);
	// ID: next_payload(1) | ID_type(1) | ID_len(2) | ID
	const buf = new Uint8Array(4 + idBytes.length);
	buf[0] = 0;
	buf[1] = 0; // ID_type=0 = NAI
	writeU16(buf, 2, idBytes.length);
	buf.set(idBytes, 4);
	return buf;
}

function encodePke(pkeBody: Uint8Array): Uint8Array {
	// PKE: next_payload(1) | C(2 bits) + PKE_len(14 bits) | PKE_data
	const buf = new Uint8Array(3 + pkeBody.length);
	buf[0] = 0;
	// C=0 (no envelope key cached); top 2 bits of byte 1 are C
	writeU16(buf, 1, pkeBody.length & 0x3fff);
	buf.set(pkeBody, 3);
	return buf;
}

function encodeKemac(encrData: Uint8Array, macLen: number): Uint8Array {
	// KEMAC: next_payload(1) | encr_alg(1) | encr_data_len(2) | encr_data
	//        | mac_alg(1) | mac
	const buf = new Uint8Array(5 + encrData.length + macLen);
	buf[0] = 0;
	buf[1] = ENCR_AES_CM_128;
	writeU16(buf, 2, encrData.length);
	buf.set(encrData, 4);
	buf[4 + encrData.length] = MAC_HMAC_SHA1_160;
	// MAC bytes will be filled later
	return buf;
}

function buildKemacInner(tgk: Uint8Array): Uint8Array {
	// One KEY_DATA payload: next_payload(1) | type(1) | KV(1) | key_data_len(2) | key_data
	const buf = new Uint8Array(5 + tgk.length);
	buf[0] = PT_LAST;
	buf[1] = (0 << 4) | KD_TGK; // Type=TGK
	buf[2] = 0; // KV=0 (no validity period)
	writeU16(buf, 3, tgk.length);
	buf.set(tgk, 5);
	return buf;
}

/** Walk chunks and write next_payload bytes connecting them. */
function stitchPayloads(chunks: { type: number; data: Uint8Array }[]): Uint8Array {
	let total = 0;
	for (const c of chunks) total += c.data.length;
	const out = new Uint8Array(total);
	let off = 0;
	for (let i = 0; i < chunks.length; i++) {
		const c = chunks[i];
		// next_payload = type of the NEXT chunk, or PT_LAST if this is the last
		const next = i + 1 < chunks.length ? chunks[i + 1].type : PT_LAST;
		// First byte of every payload except HDR is the next_payload field.
		// HDR puts it at byte index 2 (since byte 0,1 = version, data_type).
		if (c.type === PT_HDR) c.data[2] = next;
		else c.data[0] = next;
		out.set(c.data, off);
		off += c.data.length;
	}
	return out;
}

// ---------------------------------------------------------------------------
// Crypto primitives

function randomBytes(n: number): Uint8Array {
	const b = new Uint8Array(n);
	crypto.getRandomValues(b);
	return b;
}

function nowNtp(): bigint {
	// NTP epoch is 1900-01-01; Unix is 1970-01-01. Offset = 2208988800 seconds.
	const unixMs = BigInt(Date.now());
	const secs = unixMs / 1000n + 2208988800n;
	const frac = ((unixMs % 1000n) * (1n << 32n)) / 1000n;
	return (secs << 32n) | frac;
}

async function aesCm128(key: Uint8Array, data: Uint8Array): Promise<Uint8Array> {
	const { createCipheriv } = await import("node:crypto");
	const iv = new Uint8Array(16); // zero IV — caller responsibility to make key fresh
	const c = createCipheriv("aes-128-ctr", Buffer.from(key), Buffer.from(iv));
	const out = Buffer.concat([c.update(Buffer.from(data)), c.final()]);
	return new Uint8Array(out.subarray(0, data.length));
}

async function hmacSha1(key: Uint8Array, data: Uint8Array): Promise<Uint8Array> {
	const { createHmac } = await import("node:crypto");
	const h = createHmac("sha1", Buffer.from(key));
	h.update(Buffer.from(data));
	return new Uint8Array(h.digest());
}

/** MIKEY-1 PRF (RFC 3830 §4.1.4). Simplified: HKDF-SHA1-style key derive. */
async function deriveMikeyKey(envKey: Uint8Array, csbId: number, label: number): Promise<Uint8Array> {
	const info = new Uint8Array(8);
	writeU32(info, 0, csbId);
	writeU32(info, 4, label);
	const mac = await hmacSha1(envKey, info);
	return mac.subarray(0, 16);
}

/** RSA-OAEP-SHA1 encrypt with a DER-encoded SPKI public key. */
async function rsaOaepEncrypt(spki: Uint8Array, plaintext: Uint8Array): Promise<Uint8Array> {
	const key = await crypto.subtle.importKey(
		"spki",
		toArrayBuffer(spki),
		{ name: "RSA-OAEP", hash: "SHA-1" },
		false,
		["encrypt"],
	);
	const ct = await crypto.subtle.encrypt(
		{ name: "RSA-OAEP" },
		key,
		toArrayBuffer(plaintext),
	);
	return new Uint8Array(ct);
}

/** Copy a Uint8Array into a fresh ArrayBuffer (avoids SAB ambiguity). */
function toArrayBuffer(u: Uint8Array): ArrayBuffer {
	const ab = new ArrayBuffer(u.byteLength);
	new Uint8Array(ab).set(u);
	return ab;
}

// ---------------------------------------------------------------------------
// Base64 (URL-safe optional)

export function mikeyToBase64(msg: Uint8Array): string {
	let s = "";
	for (let i = 0; i < msg.length; i++) s += String.fromCharCode(msg[i]);
	return btoa(s);
}

export function mikeyFromBase64(s: string): Uint8Array {
	const bin = atob(s.replace(/-/g, "+").replace(/_/g, "/"));
	const out = new Uint8Array(bin.length);
	for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
	return out;
}

// ---------------------------------------------------------------------------
// Minimal parser — just enough to identify HDR fields and pull out KEMAC.

export interface MikeyParsed {
	version: number;
	dataType: number;
	csbId: number;
	rand?: Uint8Array;
	ntpTimestamp?: bigint;
	pkeBody?: Uint8Array;
	kemacEncrypted?: Uint8Array;
}

export function parseMikey(buf: Uint8Array): MikeyParsed {
	if (buf.length < 10) throw new Error("MIKEY: too short");
	const out: MikeyParsed = {
		version: buf[0],
		dataType: buf[1],
		csbId: readU32(buf, 4),
	};
	let off = 10;
	let next = buf[2];
	while (off < buf.length && next !== PT_LAST) {
		const startNext = buf[off]; // first byte of payload = next_payload of THIS one
		switch (next) {
			case PT_T: {
				const ts = new DataView(buf.buffer, buf.byteOffset + off + 2, 8).getBigUint64(0, false);
				out.ntpTimestamp = ts;
				off += 10;
				break;
			}
			case PT_RAND: {
				const len = buf[off + 1];
				out.rand = buf.subarray(off + 2, off + 2 + len);
				off += 2 + len;
				break;
			}
			case PT_PKE: {
				const len = readU16(buf, off + 1) & 0x3fff;
				out.pkeBody = buf.subarray(off + 3, off + 3 + len);
				off += 3 + len;
				break;
			}
			case PT_KEMAC: {
				const encrLen = readU16(buf, off + 2);
				out.kemacEncrypted = buf.subarray(off + 4, off + 4 + encrLen);
				// skip past mac_alg byte and the MAC itself
				off = buf.length;
				break;
			}
			case PT_ID: {
				const idLen = readU16(buf, off + 2);
				off += 4 + idLen;
				break;
			}
			default: {
				// unknown — bail
				off = buf.length;
				break;
			}
		}
		next = startNext;
	}
	return out;
}

function readU16(b: Uint8Array, o: number): number { return (b[o] << 8) | b[o + 1]; }
function readU32(b: Uint8Array, o: number): number {
	return ((b[o] << 24) | (b[o + 1] << 16) | (b[o + 2] << 8) | b[o + 3]) >>> 0;
}
function writeU16(b: Uint8Array, o: number, v: number) {
	b[o] = (v >>> 8) & 0xff;
	b[o + 1] = v & 0xff;
}
function writeU32(b: Uint8Array, o: number, v: number) {
	b[o] = (v >>> 24) & 0xff;
	b[o + 1] = (v >>> 16) & 0xff;
	b[o + 2] = (v >>> 8) & 0xff;
	b[o + 3] = v & 0xff;
}
