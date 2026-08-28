import { assertEquals } from "@std/assert";
import type { Message } from "@evex/linejs-types";
import type { Client } from "../../client.ts";
import { TalkMessage } from "./talk.ts";

function message(raw: Partial<Message>): TalkMessage {
	return new TalkMessage({
		client: {} as Client,
		raw: raw as Message,
	});
}

Deno.test("TalkMessage.isEdited — never edited", () => {
	assertEquals(message({ text: "hi" }).isEdited, false);
	assertEquals(message({ text: "hi", updatedTime: 0 }).isEdited, false);
	assertEquals(message({ text: "hi", updatedTime: 0n }).isEdited, false);
	assertEquals(
		message({ text: "hi", contentMetadata: { e2eeVersion: "2" } }).isEdited,
		false,
	);
});

// EDIT_MESSAGE / NOTIFIED_EDIT_MESSAGE operations mark the edit in
// contentMetadata, not in the `updatedTime` field. Shape taken from a live
// op 158 payload.
Deno.test("TalkMessage.isEdited — edit operation metadata", () => {
	const m = message({
		id: "1234567890123456789",
		contentMetadata: {
			e2eeVersion: "2",
			EDITED: "true",
			UPDATED_TIME: "1787927539000",
		},
	});
	assertEquals(m.isEdited, true);
	assertEquals(m.updatedTime, 1787927539000);
});

Deno.test("TalkMessage.isEdited — updatedTime field", () => {
	assertEquals(
		message({ text: "hi", updatedTime: 1700000000000 }).isEdited,
		true,
	);
	assertEquals(
		message({ text: "hi", updatedTime: 1700000000000n }).isEdited,
		true,
	);
});

Deno.test("TalkMessage.updatedTime", () => {
	assertEquals(message({ text: "hi" }).updatedTime, null);
	assertEquals(message({ text: "hi", updatedTime: 0 }).updatedTime, null);
	assertEquals(
		message({ text: "hi", updatedTime: 1700000000000 }).updatedTime,
		1700000000000,
	);
	// metadata wins over the field
	assertEquals(
		message({
			updatedTime: 1700000000000,
			contentMetadata: { UPDATED_TIME: "1787927539000" },
		}).updatedTime,
		1787927539000,
	);
});
