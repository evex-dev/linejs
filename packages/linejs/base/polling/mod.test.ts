import { assert, assertEquals } from "@std/assert";
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

// `listenTalkEvents` starts the pusher loop and hands back a stream without
// awaiting the loop. A first connect that fails makes `initLegyPusher` rethrow,
// and that rejection used to escape as "Uncaught (in promise)" — fatal to the
// host process, and a test failure under Deno.test's default sanitizers.
Deno.test("listenTalkEvents reports a pusher that cannot connect", async () => {
	const logs: string[] = [];
	let settle!: () => void;
	const reported = new Promise<void>((resolve) => {
		settle = resolve;
	});
	const stream = new ReadableStream();
	const client = {
		authToken: "token",
		push: {
			opStream: { renew() {}, stream },
			initializeConn: () => Promise.reject(new TypeError("connect failed")),
		},
		log(type: string) {
			logs.push(type);
			// The rethrow is reported after `_cannot_init`, so wait for both.
			if (logs.length === 2) settle();
		},
	};
	const polling = new Polling(client as never);

	// The caller still gets its stream; only the loop behind it gave up.
	assertEquals(polling.listenTalkEvents(), stream);
	await reported;

	assertEquals(logs, ["LegyPusherError_cannot_init", "LegyPusherError"]);
});

// `log` fans out to user-supplied listeners, so reporting outside a guard would
// let one of those throws reject the very handler that stops the crash.
Deno.test("listenSquareEvents survives a log listener that throws", async () => {
	const logs: string[] = [];
	let settle!: () => void;
	const reported = new Promise<void>((resolve) => {
		settle = resolve;
	});
	const client = {
		authToken: "token",
		push: {
			sqStream: { renew() {}, stream: new ReadableStream() },
			initializeConn: () => Promise.reject(new TypeError("connect failed")),
		},
		log(type: string) {
			logs.push(type);
			if (logs.length === 2) settle();
			if (type === "LegyPusherError") {
				throw new Error("log listener failed");
			}
		},
	};
	const polling = new Polling(client as never);

	polling.listenSquareEvents();
	await reported;

	assertEquals(logs, ["LegyPusherError_cannot_init", "LegyPusherError"]);
});
