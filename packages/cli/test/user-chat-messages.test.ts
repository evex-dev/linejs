import { test } from "vite-plus/test";
import assert from "node:assert/strict";
import {
	fetchTalkMessages,
	fetchUserTalkMessages,
	isUserMid,
	userChatSummary,
} from "../src/commands/shared.ts";
import type { Client } from "@evex-dev/linejs";

function userClient() {
	const calls: string[] = [];
	const client = {
		getChat: async () => {
			calls.push("getChat");
			throw new Error("getChat must not be called for user mids");
		},
		base: {
			talk: {
				async getMessageBoxes() {
					return {
						messageBoxes: [
							{
								id: "u-user",
								lastDeliveredMessageId: {
									deliveredTime: 200,
									messageId: 300,
								},
							},
						],
					};
				},
				async getPreviousMessagesV2WithRequest({ request }: never) {
					const req = request as {
						messageBoxId: string;
						endMessageId: { messageId: unknown; deliveredTime: unknown };
						messagesCount: number;
					};
					assert.equal(req.messageBoxId, "u-user");
					assert.equal(req.messagesCount, 10);
					assert.deepEqual(req.endMessageId, { messageId: 300, deliveredTime: 200 });
					return [
						{
							id: "111",
							deliveredTime: 200,
							contentType: "NONE",
							contentMetadata: {},
							text: "hello",
						},
						{
							id: "222",
							deliveredTime: 201,
							contentType: "NONE",
							contentMetadata: {},
							text: "world",
						},
					];
				},
			},
		},
	} as never as Client;
	return { client, calls };
}

test("isUserMid only matches u... mids", () => {
	assert.equal(isUserMid("u123"), true);
	assert.equal(isUserMid("c123"), false);
	assert.equal(isUserMid("r123"), false);
	assert.equal(isUserMid("m123"), false);
});

test("userChatSummary reports a USER chat", () => {
	assert.deepEqual(userChatSummary("u123"), { mid: "u123", type: "USER" });
});

test("fetchUserTalkMessages uses the message-box path", async () => {
	const { client, calls } = userClient();
	const messages = await fetchUserTalkMessages(client, "u-user", 10);
	assert.equal(calls.length, 0);
	assert.equal(messages.length, 2);
	assert.equal(messages[0].raw.id, "111");
	assert.equal(messages[1].raw.id, "222");
});

test("fetchUserTalkMessages throws NOT_FOUND for an unknown box", async () => {
	const { client } = userClient();
	await assert.rejects(() => fetchUserTalkMessages(client, "u-missing", 10), /was not found/);
});

test("fetchTalkMessages routes user mids away from getChat", async () => {
	const { client, calls } = userClient();
	const messages = await fetchTalkMessages(client, "u-user", 10);
	assert.equal(calls.length, 0);
	assert.equal(messages.length, 2);
});

test("fetchTalkMessages keeps the getChat path for group mids", async () => {
	let fetchedLimit = 0;
	const client = {
		async getChat(chatMid: string) {
			assert.equal(chatMid, "c-group");
			return {
				async fetchMessages(limit: number) {
					fetchedLimit = limit;
					return [{ raw: { id: "999" } }];
				},
			};
		},
		base: {
			talk: {
				async getMessageBoxes(): Promise<never> {
					throw new Error("getMessageBoxes must not be called for group mids");
				},
				async getPreviousMessagesV2WithRequest(): Promise<never> {
					throw new Error("getPreviousMessagesV2WithRequest must not be called for group mids");
				},
			},
		},
	} as never as Client;
	const messages = await fetchTalkMessages(client, "c-group", 5);
	assert.equal(fetchedLimit, 5);
	assert.equal(messages.length, 1);
});
