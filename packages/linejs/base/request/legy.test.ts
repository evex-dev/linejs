import { assertEquals } from "@std/assert";
import { decodeLegyHeaders, encodeLegyHeaders, xxhash32 } from "./legy.ts";
import { Buffer } from "node:buffer";

Deno.test("LEGY header codec round-trips headers and body", () => {
	const body = Buffer.from([1, 2, 3]);
	const encoded = Buffer.concat([
		encodeLegyHeaders({ "x-lt": "token", "x-lpqs": "/S4" }),
		body,
	]);
	const decoded = decodeLegyHeaders(encoded);
	assertEquals(decoded.headers, { "x-lt": "token", "x-lpqs": "/S4" });
	assertEquals([...decoded.data], [1, 2, 3]);
});

Deno.test("xxhash32 matches canonical empty input", () => {
	assertEquals(xxhash32(new Uint8Array()), 0x02cc5d05);
});
