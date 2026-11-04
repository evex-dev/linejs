import { test } from "vite-plus/test";
import assert from "node:assert/strict";
import {
	EventRpcError,
	McpEventHub,
	type McpEventRecord,
	type McpEventSource,
} from "../src/mcp/events.ts";
import { toEventRecord } from "../src/mcp/listen-source.ts";
import { handleMcpMessage } from "../src/mcp/server.ts";
import {
	WebhookDeliveryError,
	type WebhookRequest,
	type WebhookResponse,
	type WebhookTransport,
	createWebhookTransport,
	isPublicAddress,
	parseCallbackUrl,
	signWebhook,
	webhookSecretProblem,
} from "../src/mcp/webhook.ts";

const SECRET = `whsec_${Buffer.alloc(32, 7).toString("base64")}`;
const CALLBACK = "https://hooks.example.com/mcp/events";

class FakeTransport implements WebhookTransport {
	readonly requests: WebhookRequest[] = [];
	handler: (request: WebhookRequest) => WebhookResponse | Promise<WebhookResponse> = (request) => {
		const parsed = JSON.parse(request.body) as Record<string, unknown>;
		if (parsed.type === "verification") {
			return { status: 200, body: JSON.stringify({ challenge: parsed.challenge }) };
		}
		return { status: 200, body: "{}" };
	};

	async post(request: WebhookRequest): Promise<WebhookResponse> {
		this.requests.push(request);
		return await this.handler(request);
	}

	get deliveries(): Array<{ headers: Record<string, string>; body: Record<string, unknown> }> {
		return this.requests
			.filter((request) => !request.body.includes('"type":"verification"'))
			.map((request) => ({
				headers: request.headers,
				body: JSON.parse(request.body) as Record<string, unknown>,
			}));
	}
}

class FakeSource implements McpEventSource {
	running = false;
	starts = 0;
	stops = 0;
	private listener: ((record: McpEventRecord) => void) | undefined;

	async start(onEvent: (record: McpEventRecord) => void): Promise<void> {
		if (this.running) return;
		this.starts += 1;
		this.running = true;
		this.listener = onEvent;
	}

	async stop(): Promise<void> {
		this.stops += 1;
		this.running = false;
		this.listener = undefined;
	}

	emit(record: McpEventRecord): void {
		this.listener?.(record);
	}
}

function createHub(overrides: { now?: () => number; limits?: Record<string, number> } = {}) {
	const transport = new FakeTransport();
	const source = new FakeSource();
	const hub = new McpEventHub({
		principal: "stdio:test",
		transport,
		sourceFactory: () => source,
		now: overrides.now,
		delay: async () => {},
		autoSweep: false,
		limits: overrides.limits,
	});
	return { hub, transport, source };
}

function record(overrides: Partial<McpEventRecord> & { data?: Record<string, unknown> } = {}) {
	return {
		name: "line.message.received",
		occurredAt: "2026-02-19T15:30:00.000Z",
		data: {
			messageId: "msg_1",
			chatId: "c123",
			from: "u456",
			contentType: "TEXT",
			text: "hello",
			...overrides.data,
		},
		...overrides,
	} satisfies McpEventRecord;
}

function subscribeParams(overrides: Record<string, unknown> = {}) {
	return {
		name: "line.message.received",
		arguments: {},
		delivery: { mode: "webhook", url: CALLBACK, secret: SECRET },
		...overrides,
	};
}

async function call(hub: McpEventHub, method: string, params: Record<string, unknown>) {
	return (await handleMcpMessage(
		{ jsonrpc: "2.0", id: 1, method, params },
		{ events: hub },
	)) as Record<string, unknown>;
}

test("initialize advertises the events capability", async () => {
	const response = (await handleMcpMessage({
		jsonrpc: "2.0",
		id: 1,
		method: "initialize",
		params: { protocolVersion: "2025-06-18" },
	})) as { result: { capabilities: Record<string, unknown> } };
	assert.deepEqual(response.result.capabilities.events, {});
});

test("events/list exposes the LINE event catalogue", async () => {
	const { hub } = createHub();
	const response = await call(hub, "events/list", {});
	const result = response.result as {
		events: Array<{
			name: string;
			delivery: string[];
			inputSchema: Record<string, unknown>;
			payloadSchema: Record<string, unknown>;
		}>;
	};
	assert.deepEqual(
		result.events.map((event) => event.name),
		["line.message.received", "line.message.edited", "line.openchat.message.received"],
	);
	for (const event of result.events) {
		assert.deepEqual(event.delivery, ["webhook"]);
		assert.equal(typeof event.inputSchema.properties, "object");
		assert.equal(typeof event.payloadSchema.properties, "object");
	}
});

test("events/subscribe verifies the callback and returns a deterministic id", async () => {
	const now = 1_700_000_000_000;
	const { hub, transport, source } = createHub({ now: () => now });
	const response = await call(hub, "events/subscribe", subscribeParams());
	const result = response.result as {
		id: string;
		refreshBefore: string;
		cursor: null;
		truncated: boolean;
	};
	assert.match(result.id, /^sub_[0-9a-f]{16}$/);
	assert.equal(result.refreshBefore, new Date(now + 15 * 60_000).toISOString());
	assert.equal(result.cursor, null);
	assert.equal(result.truncated, false);
	assert.equal(source.starts, 1);

	const verification = transport.requests[0]!;
	assert.match(verification.headers["webhook-id"]!, /^msg_verification_/);
	assert.equal(verification.headers["x-mcp-subscription-id"], result.id);
	const challenge = (JSON.parse(verification.body) as { challenge: string }).challenge;
	assert.equal(
		verification.headers["webhook-signature"],
		signWebhook(
			SECRET,
			verification.headers["webhook-id"]!,
			Number(verification.headers["webhook-timestamp"]),
			verification.body,
		),
	);
	assert.ok(challenge.length > 10);
});

test("events/subscribe is idempotent and canonicalizes arguments", async () => {
	let now = 1_700_000_000_000;
	const { hub, source, transport } = createHub({ now: () => now });
	const first = await call(hub, "events/subscribe", {
		...subscribeParams(),
		arguments: { chatId: "c*", includeText: false },
	});
	now += 60_000;
	const second = await call(hub, "events/subscribe", {
		...subscribeParams(),
		arguments: { includeText: false, chatId: "c*" },
	});
	const firstId = (first.result as { id: string }).id;
	const secondResult = second.result as {
		id: string;
		refreshBefore: string;
		deliveryStatus: { active: boolean; lastDeliveryAt: string | null; lastError: null };
	};
	assert.equal(secondResult.id, firstId);
	assert.equal(secondResult.refreshBefore, new Date(now + 15 * 60_000).toISOString());
	assert.deepEqual(secondResult.deliveryStatus, {
		active: true,
		lastDeliveryAt: null,
		lastError: null,
	});
	assert.equal(source.starts, 1);
	// Verification is cached per principal and URL, so refreshes do not re-challenge.
	assert.equal(transport.requests.filter((entry) => entry.body.includes("verification")).length, 1);
});

test("events/subscribe rejects invalid requests", async () => {
	const { hub } = createHub();
	const cases: Array<[Record<string, unknown>, number, Record<string, unknown>?]> = [
		[subscribeParams({ name: "line.unknown" }), -32023, { kind: "event" }],
		[subscribeParams({ arguments: { nope: true } }), -32602, { argument: "nope" }],
		[subscribeParams({ arguments: { chatId: 1 } }), -32602, { argument: "chatId" }],
		[
			subscribeParams({
				delivery: { mode: "webhook", url: "http://hooks.example.com/x", secret: SECRET },
			}),
			-32602,
		],
		[
			subscribeParams({
				delivery: { mode: "webhook", url: CALLBACK, secret: "whsec_short" },
			}),
			-32602,
		],
		[
			subscribeParams({
				delivery: { mode: "webhook", url: "https://127.0.0.1/hook", secret: SECRET },
			}),
			-32602,
		],
		[
			subscribeParams({
				delivery: { mode: "push", url: CALLBACK, secret: SECRET },
			}),
			-32026,
			{ feature: "deliveryMode" },
		],
	];
	for (const [params, code, data] of cases) {
		const response = await call(hub, "events/subscribe", params);
		const error = response.error as { code: number; data?: Record<string, unknown> };
		assert.equal(error.code, code, JSON.stringify(params));
		if (data) {
			for (const [key, value] of Object.entries(data)) {
				assert.equal(error.data?.[key], value);
			}
		}
	}
});

test("events/subscribe surfaces callback verification failures", async () => {
	const { hub, transport } = createHub();
	transport.handler = () => ({ status: 200, body: JSON.stringify({ challenge: "wrong" }) });
	const mismatch = await call(hub, "events/subscribe", subscribeParams());
	assert.equal((mismatch.error as { code: number }).code, -32027);
	assert.equal((mismatch.error as { data: { reason: string } }).data.reason, "challenge_failed");

	const failing = createHub();
	failing.transport.handler = () => ({ status: 503, body: "" });
	const unavailable = await call(failing.hub, "events/subscribe", subscribeParams());
	assert.equal((unavailable.error as { code: number }).code, -32027);
	assert.equal((unavailable.error as { data: { reason: string } }).data.reason, "http_5xx");
});

test("delivered events are signed, filtered, and shaped by arguments", async () => {
	const { hub, transport, source } = createHub();
	const subscribed = (
		await call(hub, "events/subscribe", subscribeParams({ arguments: { chatId: "c*" } }))
	).result as { id: string };

	source.emit(record());
	source.emit(record({ data: { chatId: "other", messageId: "msg_2" } }));
	await hub.flushDeliveries();

	assert.equal(transport.deliveries.length, 1);
	const delivery = transport.deliveries[0]!;
	assert.equal(delivery.headers["x-mcp-subscription-id"], subscribed.id);
	assert.equal(delivery.headers["webhook-id"], delivery.body.eventId);
	assert.equal(
		delivery.headers["webhook-signature"],
		signWebhook(
			SECRET,
			delivery.headers["webhook-id"]!,
			Number(delivery.headers["webhook-timestamp"]),
			JSON.stringify(delivery.body),
		),
	);
	assert.deepEqual(delivery.body, {
		eventId: delivery.body.eventId,
		name: "line.message.received",
		timestamp: "2026-02-19T15:30:00.000Z",
		data: {
			messageId: "msg_1",
			chatId: "c123",
			from: "u456",
			contentType: "TEXT",
			text: "hello",
			receivedAt: "2026-02-19T15:30:00.000Z",
		},
		cursor: null,
	});

	await call(hub, "events/unsubscribe", subscribeParams({ arguments: { chatId: "c*" } }));
	assert.equal(source.stops, 1);
});

test("includeText=false keeps user text out of the payload", async () => {
	const { hub, transport, source } = createHub();
	await call(hub, "events/subscribe", subscribeParams({ arguments: { includeText: false } }));
	source.emit(record());
	await hub.flushDeliveries();
	const body = transport.deliveries[0]!.body as { data: Record<string, unknown> };
	assert.equal("text" in body.data, false);
	assert.equal(body.data.messageId, "msg_1");
});

test("failed deliveries retry with a fresh signature, and 410 is final", async () => {
	const { hub, transport, source } = createHub();
	await call(hub, "events/subscribe", subscribeParams());
	let attempts = 0;
	transport.handler = (request) => {
		if (request.body.includes("verification")) {
			return { status: 200, body: "{}" };
		}
		attempts += 1;
		return attempts < 3 ? { status: 500, body: "" } : { status: 200, body: "" };
	};
	source.emit(record());
	await hub.flushDeliveries();
	assert.equal(attempts, 3);

	attempts = 0;
	transport.handler = () => {
		attempts += 1;
		return { status: 410, body: "" };
	};
	source.emit(record({ data: { messageId: "msg_2" } }));
	await hub.flushDeliveries();
	assert.equal(attempts, 1);
});

test("repeated failures suspend delivery until the next refresh", async () => {
	const { hub, transport, source } = createHub({
		limits: { maxAttempts: 1, suspendAfterFailures: 1 },
	});
	await call(hub, "events/subscribe", subscribeParams());
	transport.handler = () => ({ status: 500, body: "" });
	source.emit(record());
	await hub.flushDeliveries();

	const refresh = await call(hub, "events/subscribe", subscribeParams());
	const status = (refresh.result as { deliveryStatus: Record<string, unknown> }).deliveryStatus;
	assert.equal(status.active, false);
	assert.equal(status.lastError, "http_5xx");
	assert.equal(typeof status.failedSince, "string");

	transport.handler = () => ({ status: 200, body: "" });
	source.emit(record({ data: { messageId: "msg_3" } }));
	await hub.flushDeliveries();
	assert.ok(
		transport.deliveries.some(
			(entry) => (entry.body.data as { messageId?: string }).messageId === "msg_3",
		),
	);
});

test("subscriptions expire at the granted TTL and stop the listener", async () => {
	let now = 1_700_000_000_000;
	const { hub, source, transport } = createHub({ now: () => now });
	const id = (
		(await call(hub, "events/subscribe", subscribeParams({ ttlMs: 120_000 }))).result as {
			id: string;
		}
	).id;
	now += 121_000;
	assert.deepEqual(hub.sweep(), [id]);
	assert.equal(hub.activeSubscriptionCount, 0);
	assert.equal(source.stops, 1);

	source.emit(record());
	await hub.flushDeliveries();
	assert.equal(transport.deliveries.length, 0);
});

test("no-expiry requests are downgraded to a finite grant", async () => {
	const now = 1_700_000_000_000;
	const { hub } = createHub({ now: () => now });
	const result = (await call(hub, "events/subscribe", subscribeParams({ ttlMs: null }))).result as {
		refreshBefore: string;
	};
	assert.equal(result.refreshBefore, new Date(now + 60 * 60_000).toISOString());
});

test("events/unsubscribe is idempotent", async () => {
	const { hub } = createHub();
	await call(hub, "events/subscribe", subscribeParams());
	const first = await call(hub, "events/unsubscribe", subscribeParams());
	assert.deepEqual(first.result, {});
	const second = await call(hub, "events/unsubscribe", subscribeParams());
	assert.deepEqual(second.result, {});
});

test("event methods report method-not-found without a hub", async () => {
	const response = (await handleMcpMessage({
		jsonrpc: "2.0",
		id: 1,
		method: "events/list",
	})) as { error: { code: number } };
	assert.equal(response.error.code, -32601);
});

test("listen NDJSON records map onto MCP events", () => {
	const received = toEventRecord({
		type: "talk",
		id: "msg_1",
		chatMid: "c1",
		from: "u1",
		contentType: "TEXT",
		text: "  hello\nworld  ",
		createdTime: 1_700_000_000_000,
	});
	assert.deepEqual(received, {
		name: "line.message.received",
		occurredAt: "2023-11-14T22:13:20.000Z",
		data: {
			messageId: "msg_1",
			chatId: "c1",
			from: "u1",
			contentType: "TEXT",
			text: "hello world",
		},
	});
	assert.equal(
		toEventRecord({ type: "talk:edit", id: "m", chatMid: "c" })?.name,
		"line.message.edited",
	);
	assert.equal(
		toEventRecord({ type: "square", id: "m", chatMid: "c" })?.name,
		"line.openchat.message.received",
	);
	assert.equal(toEventRecord({ type: "summary", listening: false }), undefined);
	assert.equal(toEventRecord({ type: "talk", chatMid: "c" }), undefined);
});

test("webhook URL and address validation blocks SSRF targets", () => {
	assert.equal(isPublicAddress("8.8.8.8"), true);
	assert.equal(isPublicAddress("2606:4700:4700::1111"), true);
	assert.equal(isPublicAddress("127.0.0.1"), false);
	assert.equal(isPublicAddress("10.1.2.3"), false);
	assert.equal(isPublicAddress("172.16.0.1"), false);
	assert.equal(isPublicAddress("192.168.1.1"), false);
	assert.equal(isPublicAddress("169.254.169.254"), false);
	assert.equal(isPublicAddress("::1"), false);
	assert.equal(isPublicAddress("fd00::1"), false);
	assert.equal(isPublicAddress("fe80::1"), false);
	assert.equal(isPublicAddress("2001:db8::1"), false);
	assert.equal(isPublicAddress("::ffff:127.0.0.1"), false);
	assert.equal(isPublicAddress("example.com"), false);

	assert.throws(() => parseCallbackUrl("http://hooks.example.com/x"), /https/);
	assert.throws(() => parseCallbackUrl("https://user:pass@hooks.example.com/x"), /credentials/);
	assert.equal(parseCallbackUrl(CALLBACK).toString(), CALLBACK);
});

test("webhook transport refuses callbacks that resolve to private addresses", async () => {
	const transport = createWebhookTransport({
		resolve: async () => [{ address: "127.0.0.1", family: 4 }],
	});
	await assert.rejects(
		transport.post({ url: CALLBACK, headers: {}, body: "{}" }),
		(error: unknown) =>
			error instanceof WebhookDeliveryError && error.category === "connection_refused",
	);

	const unresolvable = createWebhookTransport({
		resolve: async () => {
			throw new Error("ENOTFOUND");
		},
	});
	await assert.rejects(
		unresolvable.post({ url: CALLBACK, headers: {}, body: "{}" }),
		(error: unknown) =>
			error instanceof WebhookDeliveryError && error.category === "connection_refused",
	);
});

test("webhook secrets must be Standard Webhooks values", () => {
	assert.equal(webhookSecretProblem(SECRET), null);
	assert.match(webhookSecretProblem("nope") ?? "", /whsec_/);
	assert.match(webhookSecretProblem(`whsec_${"a".repeat(8)}`) ?? "", /24-64 bytes/);
	assert.match(webhookSecretProblem(42) ?? "", /string/);
});

test("EventRpcError carries JSON-RPC codes", () => {
	const error = new EventRpcError(-32023, "Unknown event", { kind: "event" });
	assert.equal(error.code, -32023);
	assert.deepEqual(error.data, { kind: "event" });
});
