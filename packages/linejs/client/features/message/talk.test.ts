import { assertEquals, assertRejects } from "@std/assert";
import { TalkMessage } from "./talk.ts";
import type { Client } from "../../client.ts";

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

function makeRaw(opts: {
	to: string;
	from: string;
	toType: string;
	id?: string;
}) {
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

// `chatMid` must be the chat id. In group chats `from` is the sender's USER
// mid, so marking a received group message read previously targeted a
// non-existent 1:1 chat.
Deno.test("read marks the group chat itself as read for received group messages", async () => {
	const { client, chatCheckedCalls } = makeClient();
	const msg = new TalkMessage({
		client,
		raw: makeRaw({ to: "g-group", from: "u-them", toType: "GROUP" }),
	});

	await msg.read();

	assertEquals(chatCheckedCalls[0], {
		chatMid: "g-group",
		lastMessageId: "msg-1",
		seq: 1,
	});
});

Deno.test("read keeps 1:1 behavior (counterpart mid) for received DMs", async () => {
	const { client, chatCheckedCalls } = makeClient();
	const msg = new TalkMessage({
		client,
		raw: makeRaw({ to: "u-self", from: "u-them", toType: "USER" }),
	});

	await msg.read();

	assertEquals(chatCheckedCalls[0], {
		chatMid: "u-them",
		lastMessageId: "msg-1",
		seq: 1,
	});
});
