import { assert, test } from "vite-plus/test";
import { SquareChat } from "./mod.ts";

function received(id: string, contentType: string, text?: string) {
	return {
		type: "RECEIVE_MESSAGE",
		payload: {
			receiveMessage: {
				squareMessage: {
					fromType: "SQUARE_MEMBER",
					message: {
						id,
						from: "p-sender",
						to: "m-chat",
						contentType,
						contentMetadata: {},
						text,
					},
				},
			},
		},
	};
}

/**
 * A SquareChat whose first fetch returns `events`. listen() moves syncToken
 * past a batch before dispatching it, so the test aborts after that batch.
 */
function listenTo(events: unknown[]) {
	const controller = new AbortController();
	const syncTokens: (string | undefined)[] = [];
	const client = {
		base: {
			authToken: "token",
			profile: { mid: "u-me" },
			square: {
				fetchSquareChatEvents(request: { syncToken?: string }) {
					syncTokens.push(request.syncToken);
					controller.abort();
					return Promise.resolve({ syncToken: "S1", events });
				},
			},
		},
	};
	const chat = new SquareChat({
		client: client as never,
		raw: { squareChatMid: "m-chat" } as never,
	});
	return { chat, controller, syncTokens };
}

// getTextDecorations() throws for anything but text. It ran for every
// received message, and the throw dropped the rest of the batch while
// syncToken had already moved past it, so those events never came back.
test("SquareChat.listen — a sticker does not drop the rest of the batch", async () => {
	const { chat, controller, syncTokens } = listenTo([
		received("1", "STICKER"),
		received("2", "NONE", "hello"),
	]);
	const ids: string[] = [];
	const errors: unknown[] = [];
	chat.on("message", (message) => {
		ids.push(message.raw.message.id);
	});

	await chat.listen({
		syncToken: "S0",
		signal: controller.signal,
		onError: (error) => errors.push(error),
	});

	assert.deepEqual(ids, ["1", "2"]);
	assert.deepEqual(errors, []);
	assert.deepEqual(syncTokens, ["S0"]);
});

test("SquareChat.listen — a throwing listener is reported and the batch goes on", async () => {
	const { chat, controller } = listenTo([
		received("1", "NONE", "first"),
		received("2", "NONE", "second"),
	]);
	const ids: string[] = [];
	const errors: unknown[] = [];
	chat.on("message", (message) => {
		ids.push(message.raw.message.id);
		if (message.raw.message.id === "1") throw new Error("listener failed");
	});

	await chat.listen({
		syncToken: "S0",
		signal: controller.signal,
		onError: (error) => errors.push(error),
	});

	assert.deepEqual(ids, ["1", "2"]);
	assert.strictEqual(errors.length, 1);
	assert.strictEqual((errors[0] as Error).message, "listener failed");
});
