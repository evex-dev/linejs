import { assert } from "@std/assert";
import { Polling } from "./mod.ts";

// A response without `operationResponse.operations` used to hit an early
// `continue`, skipping the sleep AND the abort check — a hot spin that
// hammered talk.sync and ignored the AbortSignal.
Deno.test("_listenTalkEvents sleeps between polls and honors abort", async () => {
	let syncCalls = 0;
	const client = {
		authToken: "token",
		talk: {
			sync() {
				syncCalls++;
				return Promise.resolve({});
			},
		},
		log() {},
	};
	const polling = new Polling(client as never);

	const controller = new AbortController();
	setTimeout(() => controller.abort(), 150);

	const start = Date.now();
	for await (
		const _ of polling._listenTalkEvents({
			signal: controller.signal,
			pollingInterval: 50,
		})
	) {
		// no events expected
	}
	const elapsed = Date.now() - start;

	assert(
		syncCalls <= 8,
		`expected a bounded number of polls, got ${syncCalls}`,
	);
	assert(elapsed >= 100, `loop ended too early (${elapsed}ms)`);
});
