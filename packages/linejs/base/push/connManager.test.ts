import { assert, test } from "vite-plus/test";
import { ConnManager } from "./connManager.ts";

interface LogEntry {
	type: string;
	data: Record<string, unknown>;
}

function timeoutError(): DOMException {
	return new DOMException("The operation was aborted due to timeout", "TimeoutError");
}

function stubClient(options: {
	noop?: () => Promise<unknown>;
	fetchMyEvents?: () => Promise<unknown>;
	onLog?: (type: string) => void;
}) {
	const logs: LogEntry[] = [];
	const emitted: string[] = [];
	let settle!: () => void;
	// The handlers report asynchronously, so tests wait for the report rather
	// than guessing at a number of microtask turns.
	const logged = new Promise<void>((resolve) => {
		settle = resolve;
	});
	const client = {
		authToken: null,
		talk: {
			noop: options.noop ?? (() => Promise.resolve()),
		},
		square: {
			fetchMyEvents:
				options.fetchMyEvents ?? (() => Promise.reject(new Error("unexpected fetchMyEvents"))),
		},
		thrift: {
			readThriftStruct: () => ({ 1: 1 }),
		},
		poll: {
			sync: { square: "before" } as Record<string, unknown>,
		},
		emit(event: string) {
			emitted.push(event);
		},
		log(type: string, data: Record<string, unknown>) {
			logs.push({ type, data });
			if (type.endsWith(" failed") || type.endsWith("SQ_fetchMyEvents")) {
				settle();
			}
			options.onLog?.(type);
		},
	};
	return { client, logs, emitted, logged };
}

// A listener that breaks only on the failure report, the log call the fix
// guards.
function throwOnFailureReport(type: string): void {
	if (type.endsWith(" failed")) {
		throw new Error("log listener failed");
	}
}

// Gives a stray rejection a macrotask turn to surface, so test's
// sanitizers can report it as "Uncaught (in promise)" before the test ends.
function nextTask(): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, 0));
}

const squarePush = {
	serviceType: 3,
	pushPayload: new Uint8Array([0]),
} as never;

// `_OnPingCallback` fires `talk.noop()` every third ping and nothing awaits
// it. A timed-out noop used to reject with nobody watching, which Deno
// reports as "Uncaught (in promise) TimeoutError" and which takes the host
// process down.
test("_OnPingCallback reports a failed noop instead of crashing", async () => {
	const error = timeoutError();
	const stub = stubClient({ noop: () => Promise.reject(error) });
	const manager = new ConnManager(stub.client as never);

	manager._OnPingCallback(3);
	await stub.logged;
	await nextTask();

	assert.deepEqual(
		stub.logs.map((entry) => entry.type),
		["[LEGY/PUSH] noop failed"],
	);
	assert.strictEqual(stub.logs[0].data.error, error);
});

// `log` fans out to user-supplied listeners, so it can throw. That throw must
// not reject the handler that exists to stop an unhandled rejection.
test("_OnPingCallback survives a log listener that throws", async () => {
	const stub = stubClient({
		noop: () => Promise.reject(timeoutError()),
		onLog: throwOnFailureReport,
	});
	const manager = new ConnManager(stub.client as never);

	manager._OnPingCallback(3);
	await stub.logged;
	await nextTask();

	assert.deepEqual(
		stub.logs.map((entry) => entry.type),
		["[LEGY/PUSH] noop failed"],
	);
});

// Conn calls `_OnPushResponse` without awaiting it, so a failed
// fetchMyEvents used to become an unhandled rejection as well.
test("_OnPushResponse reports a failed fetchMyEvents instead of crashing", async () => {
	const error = timeoutError();
	const stub = stubClient({ fetchMyEvents: () => Promise.reject(error) });
	const manager = new ConnManager(stub.client as never);

	manager._OnPushResponse(squarePush);
	await stub.logged;
	await nextTask();

	assert.deepEqual(
		stub.logs.map((entry) => entry.type),
		["[LEGY/PUSH] _OnPushResponse", "[LEGY/PUSH] fetchMyEvents failed"],
	);
	assert.strictEqual(stub.logs[1].data.error, error);
	// The sync state is left as it was, so the next push retries from there.
	assert.deepEqual(stub.client.poll.sync.square, "before");
	assert.deepEqual(manager.subscriptionId, 1);
	assert.deepEqual(stub.emitted, []);
});

test("_OnPushResponse survives a log listener that throws", async () => {
	const stub = stubClient({
		fetchMyEvents: () => Promise.reject(timeoutError()),
		onLog: throwOnFailureReport,
	});
	const manager = new ConnManager(stub.client as never);

	manager._OnPushResponse(squarePush);
	await stub.logged;
	await nextTask();

	assert.deepEqual(
		stub.logs.map((entry) => entry.type),
		["[LEGY/PUSH] _OnPushResponse", "[LEGY/PUSH] fetchMyEvents failed"],
	);
});

test("_OnPushResponse still delivers events when fetchMyEvents succeeds", async () => {
	const event = { type: "NOTIFICATION_MESSAGE" };
	const stub = stubClient({
		fetchMyEvents: () =>
			Promise.resolve({
				events: [event],
				syncToken: "after",
				subscription: { subscriptionId: 42 },
			}),
	});
	const manager = new ConnManager(stub.client as never);
	const reader = manager.sqStream.stream.getReader();

	manager._OnPushResponse(squarePush);
	await stub.logged;

	assert.deepEqual(await reader.read(), { value: event as never, done: false });
	reader.releaseLock();
	assert.deepEqual(stub.client.poll.sync.square, "after");
	assert.deepEqual(manager.subscriptionId, 42);
	assert.deepEqual(stub.emitted, ["update:syncdata"]);
	assert.deepEqual(
		stub.logs.map((entry) => entry.type),
		["[LEGY/PUSH] _OnPushResponse", "[LEGY/PUSH] SQ_fetchMyEvents"],
	);
});
