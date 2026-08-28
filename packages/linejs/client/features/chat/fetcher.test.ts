import { assertEquals } from "@std/assert";
import { createMessageFetcher } from "./fetcher.ts";
import type { Client } from "../../client.ts";

// Message ids are 64-bit values; parseInt silently rounds them beyond
// 2^53, corrupting the pagination cursor. Also, an empty page (end of
// history) previously crashed on `messages.at(-1)!`.
Deno.test("fetch uses a lossless bigint cursor and tolerates empty pages", async () => {
	const requests: unknown[] = [];
	const client = {
		base: {
			talk: {
				async getMessageBoxes() {
					return {
						messageBoxes: [
							{
								id: "c-chat",
								lastDeliveredMessageId: {
									deliveredTime: 100,
									messageId: 9007199254740993n,
								},
							},
						],
					};
				},
				async getPreviousMessagesV2WithRequest({
					request,
				}: {
					request: { endMessageId: { messageId: bigint | number } };
				}) {
					requests.push(request.endMessageId.messageId);
					if (requests.length === 1) {
						return [
							{
								id: "9007199254740993", // 2^53 + 1
								deliveredTime: 100,
								contentType: "NONE",
								contentMetadata: {},
								text: "hi",
							},
						];
					}
					return [];
				},
			},
		},
	} as never as Client;

	const chat = { mid: "c-chat" } as never;
	const fetcher = await createMessageFetcher(client, chat);

	const page1 = await fetcher.fetch(10);
	assertEquals(page1.length, 1);

	const page2 = await fetcher.fetch(10);
	assertEquals(page2.length, 0);

	assertEquals(requests[0], 9007199254740993n);
	assertEquals(requests[1], 9007199254740993n);
});
