import {
	assert,
	assertEquals,
	assertRejects,
	assertStrictEquals,
} from "@std/assert";
import { BaseClient } from "../core/mod.ts";
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

Deno.test("failed pusher initialization resets listening state for retry", async () => {
	const failure = new Error("connection failed");
	const base = new BaseClient({ device: "IOSIPAD" });
	base.authToken = "token";
	let attempts = 0;
	base.push.initializeConn = () => {
		attempts++;
		return Promise.reject(failure);
	};
	const polling = new Polling(base);
	await assertRejects(() => polling.initLegyPusher());
	assertEquals(polling.islisten, false);
	await assertRejects(() => polling.initLegyPusher());
	assertEquals(attempts, 2);
});

Deno.test("pusher failure reaches the stream reader instead of hanging", async () => {
	const failure = new Error("connection failed");
	const base = new BaseClient({ device: "IOSIPAD" });
	base.authToken = "token";
	base.push.initializeConn = () => Promise.reject(failure);
	const polling = new Polling(base);
	const reader = polling.listenTalkEvents().getReader();
	let timer: ReturnType<typeof setTimeout> | undefined;
	try {
		const error = await assertRejects(() =>
			Promise.race([
				reader.read(),
				new Promise((_, reject) => {
					timer = setTimeout(() => reject(new Error("reader hung")), 100);
				}),
			])
		);
		assertStrictEquals(error, failure);
	} finally {
		clearTimeout(timer);
		await reader.cancel().catch(() => {});
		reader.releaseLock();
	}
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

Deno.test("shared pusher failure rejects both streams even when logging throws", async () => {
	const failure = new Error("original connect failure");
	const base = new BaseClient({ device: "IOSIPAD" });
	base.authToken = "token";
	base.on("log", () => {
		throw new Error("log failure");
	});
	let attempts = 0;
	base.push.initializeConn = () => {
		attempts++;
		return Promise.reject(failure);
	};
	const polling = new Polling(base);
	const talk = polling.listenTalkEvents().getReader();
	const square = polling.listenSquareEvents().getReader();
	try {
		const errors = await Promise.all([
			assertRejects(() => talk.read()),
			assertRejects(() => square.read()),
		]);
		for (const error of errors) assertStrictEquals(error, failure);
		assertEquals(polling.islisten, false);
		assertEquals(attempts, 1);
	} finally {
		talk.releaseLock();
		square.releaseLock();
	}
});
