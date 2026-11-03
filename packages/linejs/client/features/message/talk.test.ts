import { assert, test } from "vite-plus/test";
import type { Message } from "@evex-dev/linejs-types";
import type { Client } from "../../client.ts";
import { TalkMessage } from "./talk.ts";

function message(raw: Partial<Message>): TalkMessage {
	return new TalkMessage({ client: {} as Client, raw: raw as Message });
}

test("TalkMessage.isEdited — never edited", () => {
	assert.deepEqual(message({ text: "hi" }).isEdited, false);
	assert.deepEqual(message({ text: "hi", updatedTime: 0 }).isEdited, false);
	assert.deepEqual(message({ text: "hi", updatedTime: 0n }).isEdited, false);
	assert.deepEqual(message({ text: "hi", contentMetadata: { e2eeVersion: "2" } }).isEdited, false);
});

test("TalkMessage.isEdited — edit operation metadata", () => {
	const m = message({
		id: "1234567890123456789",
		contentMetadata: {
			e2eeVersion: "2",
			EDITED: "true",
			UPDATED_TIME: "1787927539000",
		},
	});
	assert.deepEqual(m.isEdited, true);
	assert.deepEqual(m.updatedTime, 1787927539000);
});

test("TalkMessage.isEdited — updatedTime field", () => {
	assert.deepEqual(message({ text: "hi", updatedTime: 1700000000000 }).isEdited, true);
	assert.deepEqual(message({ text: "hi", updatedTime: 1700000000000n }).isEdited, true);
});

// Messages fetched from the message box (getRecentMessagesV2 and friends) carry
// only UPDATED_TIME — no EDITED flag and no `updatedTime` field. Shape taken
// from a live getRecentMessagesV2 response.
test("TalkMessage.isEdited — message box metadata (UPDATED_TIME only)", () => {
	const m = message({
		id: "1234567890123456789",
		contentMetadata: { UPDATED_TIME: "1788432321630" },
	});
	assert.deepEqual(m.isEdited, true);
	assert.deepEqual(m.updatedTime, 1788432321630);
});

test("TalkMessage.updatedTime", () => {
	assert.deepEqual(message({ text: "hi" }).updatedTime, null);
	assert.deepEqual(message({ text: "hi", updatedTime: 0 }).updatedTime, null);
	assert.deepEqual(message({ text: "hi", updatedTime: 1700000000000 }).updatedTime, 1700000000000);
	assert.deepEqual(
		message({
			updatedTime: 1700000000000,
			contentMetadata: { UPDATED_TIME: "1787927539000" },
		}).updatedTime,
		1787927539000,
	);
});

function makeClient() {
	const chatCheckedCalls: unknown[] = [];
	const client = {
		base: {
			profile: { mid: "u-self" },
			getReqseq: () => Promise.resolve(1),
			talk: {
				sendChatChecked(opts: unknown) {
					chatCheckedCalls.push(opts);
					return Promise.resolve({});
				},
			},
		},
	} as never as Client;
	return { client, chatCheckedCalls };
}

function makeRaw(opts: { to: string; from: string; toType: string; id?: string }) {
	return {
		id: opts.id ?? "msg-1",
		to: opts.to,
		from: opts.from,
		toType: opts.toType,
		contentType: "NONE",
		contentMetadata: {},
		text: "hi",
	} as never;
}

test("read marks the group chat itself as read for received group messages", async () => {
	const { client, chatCheckedCalls } = makeClient();
	const msg = new TalkMessage({
		client,
		raw: makeRaw({ to: "g-group", from: "u-them", toType: "GROUP" }),
	});
	await msg.read();
	assert.deepEqual(chatCheckedCalls[0], {
		chatMid: "g-group",
		lastMessageId: "msg-1",
		seq: 1,
	});
});

test("read keeps 1:1 behavior (counterpart mid) for received DMs", async () => {
	const { client, chatCheckedCalls } = makeClient();
	const msg = new TalkMessage({
		client,
		raw: makeRaw({ to: "u-self", from: "u-them", toType: "USER" }),
	});
	await msg.read();
	assert.deepEqual(chatCheckedCalls[0], {
		chatMid: "u-them",
		lastMessageId: "msg-1",
		seq: 1,
	});
});
