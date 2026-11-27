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

function captureSend(raw: Record<string, unknown> = {}) {
	const sent: Record<string, unknown>[] = [];
	const client = {
		base: {
			profile: { mid: "u-self" },
			talk: {
				sendMessage(opts: Record<string, unknown>) {
					sent.push(opts);
					return Promise.resolve({});
				},
			},
		},
	} as never as Client;
	const msg = new TalkMessage({
		client,
		raw: {
			...(makeRaw({ to: "g-group", from: "u-them", toType: "GROUP" }) as object),
			...raw,
		} as never,
	});
	return { msg, sent };
}

// send(object) used to forward only `to` and `e2ee`, so the text, content
// type, metadata, reply target and location were all dropped.
test("send forwards the given content", async () => {
	const { msg, sent } = captureSend();
	const location = { title: "here", address: "addr", latitude: 1, longitude: 2 };

	await msg.send({
		text: "hello",
		contentType: "STICKER",
		contentMetadata: { STKID: "1" },
		relatedMessageId: "msg-0",
		location: location as never,
	});

	assert.deepEqual(sent, [
		{
			to: "g-group",
			text: "hello",
			contentType: "STICKER",
			contentMetadata: { STKID: "1" },
			relatedMessageId: "msg-0",
			location,
			e2ee: undefined,
		},
	]);
});

// send("text") used to call reply(), so it quoted the message.
test("send(string) sends a plain message, not a reply", async () => {
	const { msg, sent } = captureSend();

	await msg.send("hello");

	assert.strictEqual(sent[0]!.text, "hello");
	assert.strictEqual(sent[0]!.relatedMessageId, undefined);
});

test("reply forwards the content type and quotes the message", async () => {
	const { msg, sent } = captureSend();

	await msg.reply({ contentType: "STICKER", contentMetadata: { STKID: "1" } });

	assert.strictEqual(sent[0]!.contentType, "STICKER");
	assert.deepEqual(sent[0]!.contentMetadata, { STKID: "1" });
	assert.strictEqual(sent[0]!.relatedMessageId, "msg-1");
});

// talk.sendMessage retries encrypted on an E2EE error only while `e2ee` is
// unset. reply() always passed a boolean, so that retry never ran.
test("reply leaves e2ee unset for a plain message and keeps an explicit choice", async () => {
	const plain = captureSend();
	await plain.msg.reply("hi");
	assert.strictEqual(plain.sent[0]!.e2ee, undefined);

	const encrypted = captureSend({ chunks: ["a", "b"] });
	await encrypted.msg.reply("hi");
	await encrypted.msg.reply({ text: "hi", e2ee: false });
	assert.strictEqual(encrypted.sent[0]!.e2ee, true);
	assert.strictEqual(encrypted.sent[1]!.e2ee, false);
});

test("send answers an encrypted message encrypted unless told otherwise", async () => {
	const { msg, sent } = captureSend({ chunks: ["a", "b"] });

	await msg.send("hi");
	await msg.send({ text: "hi", e2ee: false });

	assert.deepEqual(
		sent.map((opts) => opts.e2ee),
		[true, false],
	);
});
