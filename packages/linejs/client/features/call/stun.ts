// STUN client (RFC 8489) — Binding requests + ICE attributes (RFC 8445).
// Minimal: enough for ICE-Lite + connectivity checks, server-reflexive
// candidate discovery, USERNAME/MESSAGE-INTEGRITY/FINGERPRINT.

import { Buffer } from "node:buffer";

const STUN_MAGIC_COOKIE = 0x2112a442;
const METHOD_BINDING = 0x001;
const CLASS_REQUEST = 0x000;
const CLASS_INDICATION = 0x010;
const CLASS_SUCCESS = 0x100;
const CLASS_ERROR = 0x110;

const ATTR_MAPPED_ADDR = 0x0001;
const ATTR_USERNAME = 0x0006;
const ATTR_MESSAGE_INTEGRITY = 0x0008;
const ATTR_ERROR_CODE = 0x0009;
const ATTR_UNKNOWN_ATTRIBUTES = 0x000a;
const ATTR_REALM = 0x0014;
const ATTR_NONCE = 0x0015;
const ATTR_XOR_MAPPED_ADDR = 0x0020;
const ATTR_PRIORITY = 0x0024;
const ATTR_USE_CANDIDATE = 0x0025;
const ATTR_FINGERPRINT = 0x8028;
const ATTR_ICE_CONTROLLED = 0x8029;
const ATTR_ICE_CONTROLLING = 0x802a;

export interface StunMessage {
	type: number;
	method: number;
	class: number;
	transactionId: Uint8Array;
	attrs: Map<number, Uint8Array>;
}

export interface StunBindingResult {
	mappedAddress?: { family: 4 | 6; host: string; port: number };
}

/** Build a STUN Binding Request. */
export function buildBindingRequest(opts: {
	transactionId?: Uint8Array;
	username?: string;
	password?: string;
	priority?: number;
	iceControlling?: bigint;
	iceControlled?: bigint;
	useCandidate?: boolean;
}): Uint8Array {
	const txId = opts.transactionId ?? randomBytes(12);
	const attrs: { type: number; data: Uint8Array }[] = [];
	if (opts.username) {
		attrs.push({ type: ATTR_USERNAME, data: new TextEncoder().encode(opts.username) });
	}
	if (opts.priority !== undefined) {
		const b = new Uint8Array(4);
		new DataView(b.buffer).setUint32(0, opts.priority >>> 0, false);
		attrs.push({ type: ATTR_PRIORITY, data: b });
	}
	if (opts.iceControlling !== undefined) {
		attrs.push({ type: ATTR_ICE_CONTROLLING, data: bigU64(opts.iceControlling) });
	}
	if (opts.iceControlled !== undefined) {
		attrs.push({ type: ATTR_ICE_CONTROLLED, data: bigU64(opts.iceControlled) });
	}
	if (opts.useCandidate) {
		attrs.push({ type: ATTR_USE_CANDIDATE, data: new Uint8Array(0) });
	}
	return encodeStun({
		method: METHOD_BINDING,
		class: CLASS_REQUEST,
		transactionId: txId,
		attrs,
		password: opts.password,
	});
}

/** Parse a STUN message. */
export function parseStun(buf: Uint8Array): StunMessage {
	if (buf.length < 20) throw new Error("STUN: too short");
	const dv = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
	const type = dv.getUint16(0, false);
	const method = ((type & 0x3e00) >> 2) | ((type & 0xe0) >> 1) | (type & 0xf);
	const cls = ((type & 0x100) >> 7) | ((type & 0x10) >> 4);
	const length = dv.getUint16(2, false);
	const magic = dv.getUint32(4, false);
	if (magic !== STUN_MAGIC_COOKIE) throw new Error("STUN: bad magic");
	const transactionId = buf.subarray(8, 20);
	const attrs = new Map<number, Uint8Array>();
	let off = 20;
	const end = 20 + length;
	while (off + 4 <= end) {
		const attrType = dv.getUint16(off, false);
		const attrLen = dv.getUint16(off + 2, false);
		attrs.set(attrType, buf.subarray(off + 4, off + 4 + attrLen));
		off += 4 + attrLen;
		off += (4 - (attrLen % 4)) % 4;
	}
	return {
		type,
		method,
		class: cls << 4,
		transactionId,
		attrs,
	};
}

/** Pull XOR-MAPPED-ADDRESS (or MAPPED-ADDRESS) out of a Binding Success. */
export function readMappedAddress(m: StunMessage): StunBindingResult["mappedAddress"] | undefined {
	let raw = m.attrs.get(ATTR_XOR_MAPPED_ADDR);
	let xor = !!raw;
	if (!raw) {
		raw = m.attrs.get(ATTR_MAPPED_ADDR);
		xor = false;
	}
	if (!raw) return undefined;
	const family = raw[1];
	const xorMagic = xor ? 0x2112 : 0;
	const port = ((raw[2] << 8) | raw[3]) ^ xorMagic;
	if (family === 0x01) {
		const cookie = xor ? 0x2112a442 : 0;
		const a = raw[4] ^ ((cookie >>> 24) & 0xff);
		const b = raw[5] ^ ((cookie >>> 16) & 0xff);
		const c = raw[6] ^ ((cookie >>> 8) & 0xff);
		const d = raw[7] ^ (cookie & 0xff);
		return { family: 4, host: `${a}.${b}.${c}.${d}`, port };
	}
	return undefined;
}

function encodeStun(opts: {
	method: number;
	class: number;
	transactionId: Uint8Array;
	attrs: { type: number; data: Uint8Array }[];
	password?: string;
}): Uint8Array {
	const m = opts.method;
	const c = opts.class;
	const type = (m & 0x0fff) | ((c & 0x10) << 4) | ((c & 0x01) << 8);
	// Calculate body length (including MI/FP if present)
	let attrsLen = 0;
	for (const a of opts.attrs) {
		attrsLen += 4 + a.data.length;
		attrsLen += (4 - (a.data.length % 4)) % 4;
	}
	const miLen = opts.password ? 4 + 20 : 0;
	const fpLen = 4 + 4;
	const totalAttrs = attrsLen + miLen + fpLen;
	const out = new Uint8Array(20 + totalAttrs);
	const dv = new DataView(out.buffer);
	dv.setUint16(0, type, false);
	dv.setUint16(2, totalAttrs, false);
	dv.setUint32(4, STUN_MAGIC_COOKIE, false);
	out.set(opts.transactionId, 8);
	let off = 20;
	for (const a of opts.attrs) {
		dv.setUint16(off, a.type, false);
		dv.setUint16(off + 2, a.data.length, false);
		out.set(a.data, off + 4);
		off += 4 + a.data.length;
		off += (4 - (a.data.length % 4)) % 4;
	}
	if (opts.password) {
		dv.setUint16(off, ATTR_MESSAGE_INTEGRITY, false);
		dv.setUint16(off + 2, 20, false);
		// Compute MI over message-so-far with adjusted length field
		// excluding the FINGERPRINT attr but including the MI attr itself
		const lenIncludingMi = attrsLen + miLen;
		dv.setUint16(2, lenIncludingMi, false);
		const macInput = out.subarray(0, off);
		// HMAC-SHA1 with key=password (short-term creds); long-term would
		// use HA1 = MD5(user:realm:password).
		out.set(syncHmacSha1(opts.password, macInput), off + 4);
		dv.setUint16(2, totalAttrs, false); // restore final length
		off += 24;
	}
	// FINGERPRINT
	dv.setUint16(off, ATTR_FINGERPRINT, false);
	dv.setUint16(off + 2, 4, false);
	const crcInput = out.subarray(0, off);
	const crc = crc32(crcInput) ^ 0x5354554e; // RFC 5389
	dv.setUint32(off + 4, crc >>> 0, false);
	return out;
}

function syncHmacSha1(password: string, data: Uint8Array): Uint8Array {
	// Sync wrapper using node:crypto — STUN MI is computed in build path
	// before send; doing it sync keeps the API tidy.
	// (node:crypto createHmac IS sync; we just import it at top.)
	const crypto = require_node_crypto();
	const h = crypto.createHmac("sha1", Buffer.from(password, "utf-8"));
	h.update(Buffer.from(data));
	return new Uint8Array(h.digest());
}

// `require`-style cached crypto import. Avoids `await` in build paths.
let _crypto: typeof import("node:crypto") | null = null;
function require_node_crypto(): typeof import("node:crypto") {
	if (!_crypto) {
		// dynamic require via the CJS shim that node:crypto exposes
		// — at runtime in Deno/Node, this loads instantly the first call.
		_crypto = (globalThis as { require?: (m: string) => unknown }).require?.("node:crypto") as
			typeof import("node:crypto");
		if (!_crypto) {
			throw new Error(
				"STUN: node:crypto unavailable. Use buildBindingRequestAsync() instead.",
			);
		}
	}
	return _crypto;
}

/** Async variant that doesn't require sync require(). */
export async function buildBindingRequestAsync(opts: Parameters<typeof buildBindingRequest>[0]): Promise<Uint8Array> {
	// Just defer to sync version using dynamic import to warm crypto.
	await import("node:crypto").then((c) => { _crypto = c; });
	return buildBindingRequest(opts);
}

// CRC32 (IEEE polynomial 0xedb88320) — used by STUN FINGERPRINT.
const CRC32_TABLE = (() => {
	const t = new Uint32Array(256);
	for (let i = 0; i < 256; i++) {
		let c = i;
		for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
		t[i] = c >>> 0;
	}
	return t;
})();

function crc32(buf: Uint8Array): number {
	let c = 0xffffffff;
	for (let i = 0; i < buf.length; i++) c = CRC32_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
	return (c ^ 0xffffffff) >>> 0;
}

function bigU64(v: bigint): Uint8Array {
	const out = new Uint8Array(8);
	new DataView(out.buffer).setBigUint64(0, v, false);
	return out;
}

function randomBytes(n: number): Uint8Array {
	const b = new Uint8Array(n);
	crypto.getRandomValues(b);
	return b;
}

export { ATTR_USE_CANDIDATE, ATTR_USERNAME, ATTR_XOR_MAPPED_ADDR, CLASS_SUCCESS };
