import { assertEquals } from "@std/assert";
import { writeStruct, writeThrift } from "./write.ts";
import { readThrift } from "./read.ts";
import { type NestedArray, Protocols } from "./declares.ts";

// Thrift type id for I64.
const I64 = 10;

const hex = (data: Uint8Array): string =>
	Array.from(data).map((b) => b.toString(16).padStart(2, "0")).join("");

const i64Field = (fid: number, value: bigint): NestedArray =>
	[[I64, fid, value]] as NestedArray;

// Regression for #193: bigint I64 fields (e.g. a message ID in talk.react)
// were passed to node-int64 as a decimal string, which the library parses as
// hex, silently corrupting the value and making LINE return MESSAGE_NOT_FOUND.
Deno.test("writeThrift round-trips a large bigint I64 without corruption", () => {
	// 618946633287860670 > Number.MAX_SAFE_INTEGER, taken straight from #193.
	const messageId = 618946633287860670n;
	for (const protocol of [Protocols[3], Protocols[4]]) {
		const bytes = writeThrift(i64Field(1, messageId), "react", protocol);
		const parsed = readThrift(bytes, protocol);
		assertEquals(parsed.data[1], messageId);
	}
});

Deno.test("writeStruct encodes the exact 64-bit big-endian I64 octets", () => {
	// Binary protocol writes the field header (0a=I64, 0001=fid) followed by
	// the raw 8 bytes and a trailing field stop (00). The corrupt decimal-as-hex
	// path produced different bytes, so this pins the correct wire encoding.
	const bytes = writeStruct(i64Field(1, 618946633287860670n), Protocols[3]);
	assertEquals(hex(bytes), "0a0001" + "0896f0af040c01be" + "00");
});

Deno.test("writeStruct encodes negative I64 as two's complement", () => {
	// asUintN(64) keeps negative I64 values correct (full 0xff.. byte fill)
	// rather than zero-extending the low 32 bits.
	const bytes = writeStruct(i64Field(1, -5n), Protocols[3]);
	assertEquals(hex(bytes), "0a0001" + "fffffffffffffffb" + "00");
});

Deno.test("writeThrift round-trips a small bigint I64", () => {
	// Values within Number.MAX_SAFE_INTEGER come back as a number on read.
	const bytes = writeThrift(i64Field(1, 5n), "x", Protocols[4]);
	const parsed = readThrift(bytes, Protocols[4]);
	assertEquals(parsed.data[1], 5);
});
