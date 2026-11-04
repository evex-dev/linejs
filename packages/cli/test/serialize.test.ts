import { test } from "vite-plus/test";
import assert from "node:assert/strict";
import { serialize, formatJson } from "../src/output.ts";

test("serializes bigint, Date, Map, Set, and typed arrays", () => {
	const date = new Date("2026-01-02T03:04:05.000Z");
	const value = serialize({
		id: 9007199254740993n,
		date,
		map: new Map([["a", 1]]),
		set: new Set([1, 2]),
		bytes: new Uint8Array([1, 2, 3]),
		none: undefined,
	});
	assert.deepEqual(value, {
		id: "9007199254740993",
		date: "2026-01-02T03:04:05.000Z",
		map: { a: 1 },
		set: [1, 2],
		bytes: { type: "Uint8Array", byteLength: 3 },
	});
});

test("handles circular references", () => {
	const value: Record<string, unknown> = { name: "x" };
	value.self = value;
	assert.deepEqual(serialize(value), { name: "x", self: "[Circular]" });
});

test("formatJson omits undefined object values", () => {
	const parsed = JSON.parse(formatJson({ a: 1, b: undefined }));
	assert.deepEqual(parsed, { a: 1 });
});

test("serializes Blob metadata without bytes", () => {
	const blob = new Blob(["hello"], { type: "text/plain" });
	assert.deepEqual(serialize(blob), { type: "text/plain", size: 5 });
});
