/**
 * PLANET protocol framing.
 *
 * Reverse-engineered from LINE Android 26.6.2's libandromeda.so:
 *   - pln_transport_make_planet_chunk_hdr  (0xcba934, 9 insns)
 *   - pln_transport_parse_planet_chunk_hdr (0xcba958, 8 insns)
 *   - pln_transport_make_planet_fixed_hdr  (0xcba978, 26 insns)
 *   - pln_transport_parse_planet_fixed_hdr (0xcba9e0, 25 insns)
 *
 * The PLANET wire frame is:
 *
 *   [chunk_hdr 2B][fixed_hdr 4B][cassini message body (encrypted)]
 *
 * The chunk header bit-packs a 16-bit logical value into 16 wire bytes via:
 *   wire[0..15] = bit_shuffle(logical[0..15])
 * with a fixed mapping derived from the ARM64 instruction sequence.
 *
 * The fixed header packs (type, flags, length, sequence) into 4 wire bytes
 * big-endian, with field masks pulled from .rodata at va 0x2faf70/0x2faf80:
 *
 *   bits 0..1  : 2-bit type    (mask 0x0c on the BE word after rev)
 *   bit  2     : flag A         (mask 0x10)
 *   bits 3..13 : 11-bit length  (mask 0xffe0, value = (w >> 5) & 0x7ff)
 *   bit  14    : flag B         (mask 0x00010000)
 *   bits 15..31: 17-bit sequence (the 01d5/01d6/... transaction counter)
 */

/**
 * Pack a 16-bit logical chunk header into wire bytes.
 *
 * The asm:
 *   ldrh w8, [x1]
 *   lsl  w9, w8, #7
 *   and  w9, w9, #0x800
 *   orr  w9, w9, w8, lsl #12
 *   orr  w8, w9, w8, lsr #5
 *   rev  w8, w8
 *   lsr  w8, w8, #0x10
 *   strh w8, [x0]
 */
export function makeChunkHdr(logical: number): number {
	const w8 = logical & 0xffff;
	const w9a = ((w8 << 7) & 0x800) >>> 0;
	const w9 = (w9a | ((w8 << 12) >>> 0)) >>> 0;
	const w8b = (w9 | (w8 >>> 5)) >>> 0;
	// 32-bit byte reverse
	const rev = (
		((w8b & 0xff) << 24) |
		((w8b & 0xff00) << 8) |
		((w8b & 0xff0000) >>> 8) |
		((w8b >>> 24) & 0xff)
	) >>> 0;
	return (rev >>> 16) & 0xffff;
}

/**
 * Inverse of makeChunkHdr.
 *
 * The asm:
 *   rev    w8, w1
 *   lsr    w9, w8, #0x17
 *   and    w9, w9, #0x10
 *   bfxil  w9, w8, #0x1c, #4   (w9[3:0] = w8[31:28])
 *   lsr    w8, w8, #0x10
 *   orr    w8, w9, w8, lsl #5
 *   strh   w8, [x0]
 */
export function parseChunkHdr(wire: number): number {
	// w1 = wire (16-bit but in 32-bit register, upper bits zero)
	// rev reverses 4 bytes; if upper bits are zero we get wire-bytes shifted to top
	const w1 = wire & 0xffff;
	const w8a = (
		((w1 & 0xff) << 24) |
		((w1 & 0xff00) << 8)
	) >>> 0;
	let w9 = (w8a >>> 0x17) & 0x10;
	// bfxil w9, w8, #0x1c, #4 — extract bits 28..31 of w8 into bits 0..3 of w9,
	// preserving the bit 4 we just set.
	w9 = (w9 & ~0xf) | ((w8a >>> 0x1c) & 0xf);
	const w8b = (w8a >>> 0x10) & 0xffff;
	return (w9 | ((w8b << 5) >>> 0)) & 0xffff;
}

/** Fixed-header fields. */
export interface PlanetFixedHdr {
	/** 2-bit type code. Observed: 0 (request? response?). */
	type: number;
	/** 1-bit flag A. */
	flagA: boolean;
	/** 11-bit body length. */
	length: number;
	/** 1-bit flag B. */
	flagB: boolean;
	/** Transaction sequence (observed 0x01d5..0x01ec incrementing). */
	sequence: number;
}

/**
 * Pack a fixed header into a 4-byte wire value (big-endian).
 * Bit layout established from .rodata masks at 0x2faf70:
 *   field 0: 0x30000000 (bits 28-29) — type
 *   field 1: 0x08000000 (bit 27)     — flag A
 *   field 2: 0x07ff0000 (bits 16-26) — length
 *   field 3: 0x00008000 (bit 15)     — flag B
 * remainder (bits 0-14): sequence high bits + carry
 */
export function makeFixedHdr(hdr: PlanetFixedHdr): Uint8Array {
	const t = (hdr.type & 0x3) << 28;
	const fa = hdr.flagA ? 0x08000000 : 0;
	const len = (hdr.length & 0x7ff) << 16;
	const fb = hdr.flagB ? 0x00008000 : 0;
	const seq = hdr.sequence & 0x7fff;
	const word = (t | fa | len | fb | seq) >>> 0;
	const out = new Uint8Array(4);
	// store big-endian (rev w8 + str w8 → wire is BE of the value)
	out[0] = (word >>> 24) & 0xff;
	out[1] = (word >>> 16) & 0xff;
	out[2] = (word >>> 8) & 0xff;
	out[3] = word & 0xff;
	return out;
}

export function parseFixedHdr(wire: Uint8Array): PlanetFixedHdr {
	if (wire.length < 4) throw new Error("parseFixedHdr: need 4 bytes");
	const word = (
		(wire[0] << 24) |
		(wire[1] << 16) |
		(wire[2] << 8) |
		wire[3]
	) >>> 0;
	return {
		type: (word >>> 28) & 0x3,
		flagA: (word & 0x08000000) !== 0,
		length: (word >>> 16) & 0x7ff,
		flagB: (word & 0x00008000) !== 0,
		sequence: word & 0x7fff,
	};
}

/** Build a complete PLANET datagram header (chunk + fixed). */
export function buildFrameHeader(
	chunkLogical: number,
	fixed: PlanetFixedHdr,
): Uint8Array {
	const chunk = makeChunkHdr(chunkLogical);
	const fx = makeFixedHdr(fixed);
	const out = new Uint8Array(6);
	out[0] = chunk & 0xff;
	out[1] = (chunk >>> 8) & 0xff;
	out.set(fx, 2);
	return out;
}

/** Parse a PLANET datagram header. */
export function parseFrameHeader(wire: Uint8Array): {
	chunkLogical: number;
	fixed: PlanetFixedHdr;
} {
	if (wire.length < 6) throw new Error("parseFrameHeader: need 6 bytes");
	const chunkWire = wire[0] | (wire[1] << 8);
	return {
		chunkLogical: parseChunkHdr(chunkWire),
		fixed: parseFixedHdr(wire.subarray(2, 6)),
	};
}
