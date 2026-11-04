import { assert, test } from "vite-plus/test";
import { VoomChannelId } from "./voom.ts";

test("VoomChannelId — TIMELINE id matches LINE Android smali", () => {
	// From decompiled/base/smali/smali/t98/a$b.smali (release id).
	assert.deepEqual(VoomChannelId.TIMELINE, "1341209950");
	assert.deepEqual(VoomChannelId.HOME, "1341209850");
	assert.deepEqual(VoomChannelId.NOTE, "1655599932");
	assert.deepEqual(VoomChannelId.SQUARE_NOTE, "1657618623");
});
