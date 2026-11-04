import { assert, test } from "vite-plus/test";
import { TMoreCompactProtocol } from "./tmc.ts";

test("decodeZigZag matches standard thrift zigzag for positive values", () => {
	const tmc = new TMoreCompactProtocol();
	assert.deepEqual(tmc.decodeZigZag(0), 0);
	assert.deepEqual(tmc.decodeZigZag(2), 1);
	assert.deepEqual(tmc.decodeZigZag(4), 2);
	assert.deepEqual(tmc.decodeZigZag(100), 50);
	assert.deepEqual(tmc.decodeZigZag(200), 100);
});

test("decodeZigZag matches standard thrift zigzag for negative values", () => {
	const tmc = new TMoreCompactProtocol();
	assert.deepEqual(tmc.decodeZigZag(1), -1);
	assert.deepEqual(tmc.decodeZigZag(3), -2);
	assert.deepEqual(tmc.decodeZigZag(5), -3);
	assert.deepEqual(tmc.decodeZigZag(7), -4);
	assert.deepEqual(tmc.decodeZigZag(199), -100);
});

test("decodeZigZag round-trips with standard zigzag encode", () => {
	const tmc = new TMoreCompactProtocol();
	function zigzagEncode(n: number): number {
		return (n << 1) ^ (n >> 31);
	}
	for (const v of [-1000, -100, -3, -2, -1, 0, 1, 2, 3, 100, 1000]) {
		assert.deepEqual(tmc.decodeZigZag(zigzagEncode(v)), v);
	}
});
