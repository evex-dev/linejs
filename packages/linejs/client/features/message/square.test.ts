import { assert, test } from "vite-plus/test";
import { assertRejects } from "../../../test/assert.ts";
import { SquareMessage } from "./square.ts";
import type { Client } from "../../client.ts";

// `isMyMessage` is an async *method*, but `unsend()` tested it as a property
// — a function object is always truthy, so the ownership guard never fired.
test("unsend rejects messages that are not mine", async () => {
	const client = {
		base: {
			profile: { mid: "u-self" },
			square: {
				async getSquareChat() {
					return { squareChatMember: { squareMemberMid: "u-owner" } };
				},
				unsendMessage() {
					throw new Error("must not be called");
				},
			},
		},
	} as never as Client;
	const msg = new SquareMessage({
		client,
		raw: {
			message: {
				id: "sq-1",
				to: "sq-chat",
				from: "u-other",
				toType: "SQUARE",
				contentType: "NONE",
				contentMetadata: {},
				text: "hi",
				createdTime: 0,
			},
			fromType: "USER",
		} as never,
	});

	await assertRejects(
		() => msg.unsend(),
		TypeError,
		"Cannot unsend the message which is not yours.",
	);
});

function captureSquareSend() {
	const sent: Record<string, unknown>[] = [];
	const client = {
		base: {
			square: {
				sendMessage(opts: Record<string, unknown>) {
					sent.push(opts);
					return Promise.resolve({});
				},
			},
		},
	} as never as Client;
	const msg = new SquareMessage({
		client,
		raw: {
			message: {
				id: "sq-1",
				to: "sq-chat",
				from: "p-other",
				toType: "SQUARE",
				contentType: "NONE",
				contentMetadata: {},
				text: "hi",
				createdTime: 0,
			},
			fromType: "SQUARE_MEMBER",
		} as never,
	});
	return { msg, sent };
}

// send() defaulted relatedMessageId to this message, so every send was a
// reply. reply() is the way to quote it.
test("send sends a plain message unless a reply target is given", async () => {
	const { msg, sent } = captureSquareSend();

	await msg.send("hello");
	await msg.send({ text: "hello", relatedMessageId: "sq-0" });
	await msg.reply("hello");

	assert.deepEqual(
		sent.map((opts) => opts.relatedMessageId),
		[undefined, "sq-0", "sq-1"],
	);
	assert.deepEqual(
		sent.map((opts) => opts.squareChatMid),
		["sq-chat", "sq-chat", "sq-chat"],
	);
});
