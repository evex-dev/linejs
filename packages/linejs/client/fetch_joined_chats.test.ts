import { assert, test } from "vite-plus/test";
import { Client } from "./client.ts";

function buildClient(chatMids: string[]) {
	const calls: string[][] = [];
	const base = {
		profile: { mid: "u-self" },
		talk: {
			getAllChatMids: () => Promise.resolve({ memberChatMids: chatMids }),
			getChats: ({ chatMids: mids }: { chatMids: string[] }) => {
				if (mids.length > 100) throw new Error("INVALID_LENGTH");
				calls.push(mids);
				return Promise.resolve({ chats: mids.map((chatMid) => ({ chatMid })) });
			},
		},
	};
	return { client: new Client(base as never), calls };
}

test("fetchJoinedChats — no joined chats makes no getChats call", async () => {
	const { client, calls } = buildClient([]);
	assert.deepEqual((await client.fetchJoinedChats()).length, 0);
	assert.deepEqual(calls.length, 0);
});

// getChats rejects more than 100 MIDs per request (#265).
test("fetchJoinedChats — splits more than 100 chats into batches of 100", async () => {
	const mids = Array.from({ length: 250 }, (_, i) => `c-${i}`);
	const { client, calls } = buildClient(mids);
	const chats = await client.fetchJoinedChats();
	assert.deepEqual(
		calls.map((batch) => batch.length),
		[100, 100, 50],
	);
	assert.deepEqual(
		chats.map((chat) => chat.mid),
		mids,
	);
});
