import { assertEquals } from "@std/assert";
import { TMoreCompactProtocol } from "./tmc.ts";

Deno.test("decodeZigZag matches standard thrift zigzag for positive values", () => {
	const tmc = new TMoreCompactProtocol();
	assertEquals(tmc.decodeZigZag(0), 0);
	assertEquals(tmc.decodeZigZag(2), 1);
	assertEquals(tmc.decodeZigZag(4), 2);
	assertEquals(tmc.decodeZigZag(100), 50);
	assertEquals(tmc.decodeZigZag(200), 100);
});

Deno.test("decodeZigZag matches standard thrift zigzag for negative values", () => {
	const tmc = new TMoreCompactProtocol();
	assertEquals(tmc.decodeZigZag(1), -1);
	assertEquals(tmc.decodeZigZag(3), -2);
	assertEquals(tmc.decodeZigZag(5), -3);
	assertEquals(tmc.decodeZigZag(7), -4);
	assertEquals(tmc.decodeZigZag(199), -100);
});

Deno.test("decodeZigZag round-trips with standard zigzag encode", () => {
	const tmc = new TMoreCompactProtocol();
	function zigzagEncode(n: number): number {
		return (n << 1) ^ (n >> 31);
	}
	for (const v of [-1000, -100, -3, -2, -1, 0, 1, 2, 3, 100, 1000]) {
		assertEquals(tmc.decodeZigZag(zigzagEncode(v)), v);
	}
});
