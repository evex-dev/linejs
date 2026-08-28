import { assertEquals, assertRejects } from "@std/assert";
import { SquareMessage } from "./square.ts";
import type { Client } from "../../client.ts";

// `isMyMessage` is an async *method*, but `unsend()` tested it as a property
// — a function object is always truthy, so the ownership guard never fired.
Deno.test("unsend rejects messages that are not mine", async () => {
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
