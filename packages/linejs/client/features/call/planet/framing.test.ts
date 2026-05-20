/** Unit tests for PLANET framing — match values observed in live wire capture. */
import { assertEquals } from "@std/assert";
import {
	buildFrameHeader,
	makeChunkHdr,
	makeFixedHdr,
	parseChunkHdr,
	parseFixedHdr,
	parseFrameHeader,
} from "./framing.ts";

Deno.test("chunk hdr is invertible across all 16-bit values", () => {
	for (let i = 0; i < 0x10000; i++) {
		const wire = makeChunkHdr(i);
		const back = parseChunkHdr(wire);
		assertEquals(back, i, `roundtrip fail at i=0x${i.toString(16)}`);
	}
});

Deno.test("chunk hdr is bijective (each input -> unique output)", () => {
	const seen = new Set<number>();
	for (let i = 0; i < 0x10000; i++) {
		const w = makeChunkHdr(i);
		if (seen.has(w)) {
			throw new Error(`collision: input 0x${i.toString(16)} -> wire 0x${w.toString(16)} (also produced by another input)`);
		}
		seen.add(w);
	}
	assertEquals(seen.size, 0x10000);
});

Deno.test("fixed hdr roundtrip", () => {
	const cases = [
		{ type: 0, flagA: false, length: 535, flagB: false, sequence: 0x1d5 },
		{ type: 1, flagA: true, length: 100, flagB: false, sequence: 0x7fff },
		{ type: 2, flagA: false, length: 0x7ff, flagB: true, sequence: 0 },
		{ type: 3, flagA: true, length: 1, flagB: true, sequence: 0x123 },
	];
	for (const c of cases) {
		const wire = makeFixedHdr(c);
		const back = parseFixedHdr(wire);
		assertEquals(back, c, `roundtrip fail ${JSON.stringify(c)}`);
	}
});

Deno.test("buildFrameHeader + parseFrameHeader roundtrip", () => {
	const fixed = { type: 0, flagA: false, length: 535, flagB: false, sequence: 0x1d5 };
	const wire = buildFrameHeader(0x10de, fixed);
	assertEquals(wire.length, 6);
	const parsed = parseFrameHeader(wire);
	assertEquals(parsed.chunkLogical, 0x10de);
	assertEquals(parsed.fixed, fixed);
});

Deno.test("observed wire bytes — sequence in BE bytes 2..3 of frame", () => {
	// Captured live during a real tom-call. The transaction counter
	// pattern (01d5, 01d6, 01d7, ..., 01e6, 01e7, 01e8) lives in BE
	// bytes [2..3] of the datagram (= bytes [0..1] of the fixed header).
	// We pull it out directly here; the rest of the fixed-header
	// bit layout is still being reversed.
	const observed = [
		{ pkt: [0xd2, 0x19, 0x01, 0xd5, 0x06, 0x02], seq: 0x01d5 },
		{ pkt: [0xd1, 0x21, 0x01, 0xe8, 0x29, 0x0f], seq: 0x01e8 },
		{ pkt: [0xd1, 0x1f, 0x01, 0xe9, 0x29, 0x0d], seq: 0x01e9 },
		{ pkt: [0xd1, 0x53, 0x01, 0xea, 0x39, 0x41], seq: 0x01ea },
		{ pkt: [0xd0, 0x1c, 0x01, 0xe6, 0x48, 0x0a], seq: 0x01e6 },
	];
	for (const c of observed) {
		const seq = (c.pkt[2] << 8) | c.pkt[3];
		assertEquals(seq, c.seq);
	}
});
