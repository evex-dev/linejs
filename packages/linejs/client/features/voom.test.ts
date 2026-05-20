import { assertEquals } from "@std/assert";
import { VoomChannelId } from "./voom.ts";

Deno.test("VoomChannelId — TIMELINE id matches LINE Android smali", () => {
	// From decompiled/base/smali/smali/t98/a$b.smali (release id).
	assertEquals(VoomChannelId.TIMELINE, "1341209950");
	assertEquals(VoomChannelId.HOME, "1341209850");
	assertEquals(VoomChannelId.NOTE, "1655599932");
	assertEquals(VoomChannelId.SQUARE_NOTE, "1657618623");
});
