import { assertEquals, assertInstanceOf } from "@std/assert";
import { Client } from "./client.ts";

interface LogEntry {
	type: string;
	data: Record<string, unknown>;
}

function stubBase(options: {
	talk?: () => AsyncIterable<unknown>;
	square?: () => AsyncIterable<unknown>;
	onLog?: () => void;
}) {
	const logs: LogEntry[] = [];
	let settle!: () => void;
	// The listen loops report asynchronously, so tests wait for the report
	// rather than guessing at a number of microtask turns.
	const logged = new Promise<void>((resolve) => {
		settle = resolve;
	});
	const empty = async function* () {};
	const base = {
		createPolling: () => ({
			listenTalkEvents: options.talk ?? empty,
			listenSquareEvents: options.square ?? empty,
		}),
		push: {
			opStream: { close() {} },
			sqStream: { close() {} },
		},
		e2ee: {
			decryptE2EEMessage: (message: unknown) => Promise.resolve(message),
		},
		log(type: string, data: Record<string, unknown>) {
			logs.push({ type, data });
			settle();
			options.onLog?.();
		},
	};
	return { base, logs, logged };
}

// The listen loops are floating IIFEs: a throw from the event stream used to
// reject one with nobody watching, which Deno reports as "Uncaught (in
// promise)" and which takes the host process down. Deno.test's default
// sanitizers turn that same unhandled rejection into a test failure.
Deno.test("listen reports a talk stream failure instead of crashing", async () => {
	const seen: unknown[] = [];
	const stub = stubBase({
		async *talk() {
			yield { type: "NOTIFIED_READ_MESSAGE" };
			throw new TypeError("stream failed");
		},
	});
	const client = new Client(stub.base as never);
	client.on("event", (event) => {
		seen.push(event);
	});

	client.listen({ talk: true });
	await stub.logged;

	// Events delivered before the failure still reached the consumer.
	assertEquals(seen.length, 1);
	assertEquals(stub.logs.map((entry) => entry.type), ["LegyPusherError"]);
	assertInstanceOf(stub.logs[0].data.error, TypeError);
});

Deno.test("listen continues after one event handler failure", async () => {
	let finished!: () => void;
	const done = new Promise<void>((resolve) => finished = resolve);
	const stub = stubBase({
		async *talk() {
			try {
				yield { type: "NOTIFIED_READ_MESSAGE" };
				yield { type: "NOTIFIED_READ_MESSAGE" };
			} finally {
				finished();
			}
		},
	});
	const client = new Client(stub.base as never);
	let count = 0;
	client.on("event", () => {
		if (++count === 1) throw new Error("bad event");
	});
	client.listen({ talk: true });
	await done;
	assertEquals(count, 2);
});

Deno.test("listen continues after a decrypt failure and leaves Square running", async () => {
	let finished!: () => void;
	const done = new Promise<void>((resolve) => finished = resolve);
	let squareFinished!: () => void;
	const squareDone = new Promise<void>((resolve) => squareFinished = resolve);
	const stub = stubBase({
		async *talk() {
			try {
				yield { type: "RECEIVE_MESSAGE", message: {} };
				yield { type: "NOTIFIED_READ_MESSAGE" };
			} finally {
				finished();
			}
		},
		async *square() {
			try {
				yield { type: "OTHER" };
			} finally {
				squareFinished();
			}
		},
	});
	stub.base.e2ee.decryptE2EEMessage = () =>
		Promise.reject(new Error("bad ciphertext"));
	const client = new Client(stub.base as never);
	let talkEvents = 0;
	let squareEvents = 0;
	client.on("event", () => {
		talkEvents++;
	});
	client.on("square:event", () => {
		squareEvents++;
	});
	client.listen({ talk: true, square: true });
	await Promise.all([done, squareDone]);
	assertEquals(talkEvents, 2);
	assertEquals(squareEvents, 1);
	assertEquals(stub.logs.length, 1);
});

Deno.test("listen reports a square stream failure instead of crashing", async () => {
	const stub = stubBase({
		// deno-lint-ignore require-yield
		async *square() {
			throw new TypeError("stream failed");
		},
	});
	const client = new Client(stub.base as never);

	client.listen({ square: true });
	await stub.logged;

	assertEquals(stub.logs.map((entry) => entry.type), ["LegyPusherError"]);
	assertInstanceOf(stub.logs[0].data.error, TypeError);
});

// `emit` calls listeners synchronously and does not guard them, so a consumer
// that throws rejects the loop just like a transport failure does.
Deno.test("listen reports a throwing event listener instead of crashing", async () => {
	const stub = stubBase({
		async *talk() {
			yield { type: "NOTIFIED_READ_MESSAGE" };
		},
	});
	const client = new Client(stub.base as never);
	client.on("event", () => {
		throw new Error("listener failed");
	});

	client.listen({ talk: true });
	await stub.logged;

	assertEquals(stub.logs.map((entry) => entry.type), ["LegyPusherError"]);
	assertInstanceOf(stub.logs[0].data.error, Error);
	assertEquals(
		(stub.logs[0].data.error as Error).message,
		"listener failed",
	);
});

// `log` fans out to user-supplied listeners too. Reporting outside a guard
// would let one of those throws reject the very handler that exists to stop an
// unhandled rejection.
Deno.test("listen survives a log listener that throws", async () => {
	const stub = stubBase({
		// deno-lint-ignore require-yield
		async *talk() {
			throw new TypeError("stream failed");
		},
		onLog: () => {
			throw new Error("log listener failed");
		},
	});
	const client = new Client(stub.base as never);

	client.listen({ talk: true });
	await stub.logged;

	// The listener was still called; only its own failure was swallowed.
	assertEquals(stub.logs.map((entry) => entry.type), ["LegyPusherError"]);
	assertInstanceOf(stub.logs[0].data.error, TypeError);
});

Deno.test("Square continues after a handler failure even when its error logger throws", async () => {
	let finished!: () => void;
	const done = new Promise<void>((resolve) => finished = resolve);
	const stub = stubBase({
		async *square() {
			try {
				yield { type: "OTHER" };
				yield { type: "OTHER" };
			} finally {
				finished();
			}
		},
		onLog() {
			throw new Error("logger failed");
		},
	});
	const client = new Client(stub.base as never);
	let count = 0;
	client.on("square:event", () => {
		if (++count === 1) throw new Error("handler failed");
	});
	client.listen({ square: true });
	await done;
	assertEquals(count, 2);
	assertEquals(stub.logs.length, 1);
});
