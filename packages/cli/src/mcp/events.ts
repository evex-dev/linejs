import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { VERSION } from "../version.ts";
import {
	MAX_WEBHOOK_BODY_BYTES,
	WebhookDeliveryError,
	type WebhookTransport,
	createWebhookTransport,
	isPublicAddress,
	parseCallbackUrl,
	webhookErrorCategory,
	webhookSecretProblem,
	webhookSignatureHeader,
} from "./webhook.ts";

/**
 * MCP Events (webhook delivery), following the draft extension in
 * https://github.com/modelcontextprotocol/experimental-ext-triggers-events and
 * the subset ChatGPT implements (events/list, events/subscribe,
 * events/unsubscribe, signed webhook deliveries, callback verification).
 */

export const EVENT_ERROR_NOT_FOUND = -32023;
export const EVENT_ERROR_FORBIDDEN = -32024;
export const EVENT_ERROR_RESOURCE_EXHAUSTED = -32025;
export const EVENT_ERROR_UNSUPPORTED = -32026;
export const EVENT_ERROR_CALLBACK = -32027;
export const EVENT_ERROR_INVALID_PARAMS = -32602;

export class EventRpcError extends Error {
	readonly code: number;
	readonly data?: Record<string, unknown>;

	constructor(code: number, message: string, data?: Record<string, unknown>) {
		super(message);
		this.name = "EventRpcError";
		this.code = code;
		this.data = data;
	}
}

export interface McpEventDefinition {
	name: string;
	description: string;
	/** Delivery modes this server offers for the event. */
	delivery: readonly string[];
	inputSchema: Record<string, unknown>;
	payloadSchema: Record<string, unknown>;
}

interface SchemaProperty {
	type?: string;
	enum?: readonly unknown[];
}

const FILTER_PROPERTIES: Record<
	string,
	SchemaProperty & { description: string; default?: unknown }
> = {
	chatId: {
		type: "string",
		description:
			'Only deliver messages from chats whose id matches this glob pattern (e.g. "c0123456789abcdef"). Omit to match every chat.',
	},
	from: {
		type: "string",
		description:
			"Only deliver messages whose sender mid matches this glob pattern. Omit to match every sender.",
	},
	includeText: {
		type: "boolean",
		default: true,
		description:
			"Include a truncated text preview in the payload. Disable to keep user-authored text out of webhook infrastructure.",
	},
};

function inputSchema(): Record<string, unknown> {
	return {
		type: "object",
		properties: FILTER_PROPERTIES,
		additionalProperties: false,
	};
}

function payloadSchema(timestampKey: "receivedAt" | "updatedAt"): Record<string, unknown> {
	return {
		type: "object",
		properties: {
			messageId: { type: "string", description: "Stable LINE message id, usable for dedup." },
			chatId: { type: "string", description: "Chat (or OpenChat room) the message belongs to." },
			from: { type: "string", description: "Sender mid." },
			contentType: { type: "string", description: "LINE content type, e.g. TEXT or IMAGE." },
			text: {
				type: "string",
				description:
					"Truncated text preview. Omitted when includeText is false or the message has no text.",
			},
			[timestampKey]: {
				type: "string",
				format: "date-time",
				description: "When the message was sent (ISO 8601).",
			},
		},
		required: ["messageId", "chatId", "from", "contentType", timestampKey],
		additionalProperties: false,
	};
}

export const EVENT_DEFINITIONS: readonly McpEventDefinition[] = [
	{
		name: "line.message.received",
		description:
			"Fires when the connected LINE account receives a new talk message in a one-to-one or group chat.",
		delivery: ["webhook"],
		inputSchema: inputSchema(),
		payloadSchema: payloadSchema("receivedAt"),
	},
	{
		name: "line.message.edited",
		description: "Fires when a talk message the account can see is edited.",
		delivery: ["webhook"],
		inputSchema: inputSchema(),
		payloadSchema: payloadSchema("updatedAt"),
	},
	{
		name: "line.openchat.message.received",
		description: "Fires when a message arrives in an OpenChat (square) room.",
		delivery: ["webhook"],
		inputSchema: inputSchema(),
		payloadSchema: payloadSchema("receivedAt"),
	},
];

export type McpEventSourceKind = "talk" | "square";

/** A single occurrence produced by an event source before per-subscription filtering. */
export interface McpEventRecord {
	name: string;
	/** ISO 8601 timestamp of the occurrence. */
	occurredAt: string;
	data: Record<string, unknown>;
}

export interface McpEventSource {
	/** Resolve once the upstream listener is connected, reject when it cannot start. */
	start(onEvent: (record: McpEventRecord) => void): Promise<void>;
	stop(): Promise<void>;
}

export type McpEventSourceFactory = (kind: McpEventSourceKind) => McpEventSource;

export interface McpEventLimits {
	maxSubscriptions: number;
	maxQueue: number;
	maxAttempts: number;
	retryBaseMs: number;
	retryMaxDelayMs: number;
	suspendAfterFailures: number;
	defaultTtlMs: number;
	minTtlMs: number;
	maxTtlMs: number;
	verificationTtlMs: number;
}

/** Longest text preview kept in an event payload. */
export const PREVIEW_TEXT_LIMIT = 400;

/** Collapse whitespace and truncate user-authored text for payload minimality. */
export function previewText(value: unknown): string | undefined {
	if (typeof value !== "string" || !value) return undefined;
	const flat = value.replace(/\s+/g, " ").trim();
	if (!flat) return undefined;
	return flat.length > PREVIEW_TEXT_LIMIT ? `${flat.slice(0, PREVIEW_TEXT_LIMIT)}…` : flat;
}

const DEFAULT_LIMITS: McpEventLimits = {
	maxSubscriptions: 20,
	maxQueue: 50,
	maxAttempts: 4,
	retryBaseMs: 1_000,
	retryMaxDelayMs: 15_000,
	suspendAfterFailures: 5,
	defaultTtlMs: 15 * 60_000,
	minTtlMs: 60_000,
	maxTtlMs: 60 * 60_000,
	verificationTtlMs: 30 * 60_000,
};

export interface McpEventHubOptions {
	/** Canonical identity of the caller; the stdio transport uses the local LINE profile. */
	principal: string;
	definitions?: readonly McpEventDefinition[];
	transport?: WebhookTransport;
	/** Factory used to lazily start the LINE listener for a delivery kind. */
	sourceFactory?: McpEventSourceFactory;
	now?: () => number;
	delay?: (ms: number) => Promise<void>;
	log?: (message: string) => void;
	limits?: Partial<McpEventLimits>;
	/** Sweep expired subscriptions on an interval. Defaults to true. */
	autoSweep?: boolean;
}

export interface EventSubscribeResult {
	id: string;
	refreshBefore: string | null;
	cursor: null;
	truncated: boolean;
	deliveryStatus?: Record<string, unknown>;
}

interface DeliveryJob {
	occurrence: McpEventOccurrence;
	body: string;
}

interface McpEventOccurrence {
	eventId: string;
	name: string;
	timestamp: string;
	data: Record<string, unknown>;
	cursor: null;
}

interface Subscription {
	id: string;
	principal: string;
	name: string;
	arguments: Record<string, unknown>;
	url: string;
	secret: string;
	previousSecret?: string;
	previousSecretUntil?: number;
	expiresAt: number;
	active: boolean;
	lastDeliveryAt?: string;
	lastError?: string;
	failedSince?: string;
	consecutiveFailures: number;
	queue: DeliveryJob[];
	draining: boolean;
	removed: boolean;
}

function canonicalize(value: unknown): string {
	if (value === null || typeof value !== "object") return JSON.stringify(value) ?? "null";
	if (Array.isArray(value)) return `[${value.map(canonicalize).join(",")}]`;
	const entries = Object.entries(value as Record<string, unknown>)
		.filter(([, entry]) => entry !== undefined)
		.sort(([left], [right]) => (left < right ? -1 : left > right ? 1 : 0));
	return `{${entries.map(([key, entry]) => `${JSON.stringify(key)}:${canonicalize(entry)}`).join(",")}}`;
}

/** Canonical JSON with sorted keys, so equivalent arguments share one subscription. */
export function canonicalJson(value: unknown): string {
	return canonicalize(value ?? {});
}

function globToRegExp(pattern: string): RegExp {
	let source = "";
	for (const character of pattern) {
		if (character === "*") source += ".*";
		else if (character === "?") source += ".";
		else source += character.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
	}
	return new RegExp(`^${source}$`, "u");
}

function matchesFilters(filters: Record<string, unknown>, data: Record<string, unknown>): boolean {
	const chatId = typeof filters.chatId === "string" ? filters.chatId : undefined;
	if (chatId && !globToRegExp(chatId).test(String(data.chatId ?? ""))) return false;
	const from = typeof filters.from === "string" ? filters.from : undefined;
	if (from && !globToRegExp(from).test(String(data.from ?? ""))) return false;
	return true;
}

function validateArguments(
	definition: McpEventDefinition,
	value: unknown,
): Record<string, unknown> {
	if (value === undefined || value === null) return {};
	if (typeof value !== "object" || Array.isArray(value)) {
		throw new EventRpcError(EVENT_ERROR_INVALID_PARAMS, "params.arguments must be an object");
	}
	const properties = (definition.inputSchema.properties ?? {}) as Record<string, SchemaProperty>;
	const entries = value as Record<string, unknown>;
	for (const key of Object.keys(entries)) {
		if (!(key in properties)) {
			throw new EventRpcError(
				EVENT_ERROR_INVALID_PARAMS,
				`Unknown argument for ${definition.name}: ${key}`,
				{ argument: key },
			);
		}
	}
	for (const [key, schema] of Object.entries(properties)) {
		const entry = entries[key];
		if (entry === undefined) continue;
		const invalid = () => {
			throw new EventRpcError(
				EVENT_ERROR_INVALID_PARAMS,
				`Argument ${key} must be ${schema.type}`,
				{ argument: key },
			);
		};
		if (schema.type === "string") {
			if (typeof entry !== "string" || entry.length > 512) invalid();
		} else if (schema.type === "boolean") {
			if (typeof entry !== "boolean") invalid();
		} else if (schema.type === "integer") {
			if (!Number.isInteger(entry)) invalid();
		} else if (schema.type === "number") {
			if (typeof entry !== "number" || !Number.isFinite(entry)) invalid();
		}
		if (schema.enum && !schema.enum.includes(entry)) invalid();
	}
	return entries;
}

function constantTimeEqual(left: string, right: string): boolean {
	const a = Buffer.from(left, "utf8");
	const b = Buffer.from(right, "utf8");
	if (a.length !== b.length) return false;
	return timingSafeEqual(a, b);
}

export class McpEventHub {
	readonly principal: string;
	readonly definitions: readonly McpEventDefinition[];
	readonly limits: McpEventLimits;

	private readonly transport: WebhookTransport;
	private readonly sourceFactory: McpEventSourceFactory | undefined;
	private readonly clock: () => number;
	private readonly delay: (ms: number) => Promise<void>;
	private readonly log: (message: string) => void;
	private readonly subscriptions = new Map<string, Subscription>();
	private readonly sources = new Map<McpEventSourceKind, McpEventSource>();
	private readonly verified = new Map<string, number>();
	private readonly workers = new Set<Promise<void>>();
	private timer: NodeJS.Timeout | undefined;
	private closed = false;

	constructor(options: McpEventHubOptions) {
		this.principal = options.principal;
		this.definitions = options.definitions ?? EVENT_DEFINITIONS;
		this.limits = { ...DEFAULT_LIMITS, ...options.limits };
		this.transport = options.transport ?? createWebhookTransport();
		this.sourceFactory = options.sourceFactory;
		this.clock = options.now ?? Date.now;
		this.delay =
			options.delay ??
			((ms) =>
				new Promise<void>((resolve) => {
					const timer = setTimeout(resolve, ms);
					timer.unref?.();
				}));
		this.log = options.log ?? (() => {});
		if (options.autoSweep !== false) {
			this.timer = setInterval(() => this.sweep(), 30_000);
			this.timer.unref?.();
		}
	}

	get activeSubscriptionCount(): number {
		return this.subscriptions.size;
	}

	list(params: Record<string, unknown> = {}): Record<string, unknown> {
		const cursor = params.cursor;
		if (cursor !== undefined && cursor !== null && typeof cursor !== "string") {
			throw new EventRpcError(EVENT_ERROR_INVALID_PARAMS, "params.cursor must be a string");
		}
		// The catalogue is small enough to return in a single page.
		return {
			events: this.definitions.map((definition) => ({
				name: definition.name,
				description: definition.description,
				delivery: [...definition.delivery],
				inputSchema: definition.inputSchema,
				payloadSchema: definition.payloadSchema,
			})),
		};
	}

	async subscribe(params: Record<string, unknown>): Promise<EventSubscribeResult> {
		const definition = this.definitionFor(params.name);
		const filters = validateArguments(definition, params.arguments);
		const delivery = this.validateDelivery(params.delivery);
		const ttlMs = this.grantTtl(params.ttlMs);
		const id = this.subscriptionId(delivery.url, definition.name, filters);
		const existing = this.subscriptions.get(id);
		if (!existing && this.subscriptions.size >= this.limits.maxSubscriptions) {
			throw new EventRpcError(
				EVENT_ERROR_RESOURCE_EXHAUSTED,
				`At most ${this.limits.maxSubscriptions} webhook subscriptions are supported`,
				{ limit: "subscriptions", max: this.limits.maxSubscriptions },
			);
		}

		await this.verifyEndpoint(delivery.url, delivery.secret, id);

		const now = this.clock();
		// Report the state the refresh replaces: `active: false` tells the client
		// deliveries had been suspended and that this refresh reactivates them.
		const previousStatus = existing
			? {
					active: existing.active,
					lastDeliveryAt: existing.lastDeliveryAt ?? null,
					lastError: existing.lastError ?? null,
					...(existing.failedSince ? { failedSince: existing.failedSince } : {}),
				}
			: undefined;
		const subscription: Subscription = existing ?? {
			id,
			principal: this.principal,
			name: definition.name,
			arguments: filters,
			url: delivery.url,
			secret: delivery.secret,
			expiresAt: now + ttlMs,
			active: true,
			consecutiveFailures: 0,
			queue: [],
			draining: false,
			removed: false,
		};
		subscription.secret = delivery.secret;
		if (existing?.secret && existing.secret !== delivery.secret) {
			// Standard Webhooks multi-signature grace window for secret rotation.
			subscription.previousSecret = existing.secret;
			subscription.previousSecretUntil = now + 5 * 60_000;
		}
		subscription.expiresAt = now + ttlMs;
		subscription.active = true;
		subscription.consecutiveFailures = 0;
		subscription.removed = false;
		this.subscriptions.set(id, subscription);

		try {
			await this.ensureSources();
		} catch (error) {
			// A refresh keeps the existing subscription; only a brand-new one is rolled back.
			if (!existing) this.dropSubscription(subscription);
			throw error;
		}

		if (existing) this.scheduleDrain(subscription);
		return {
			id,
			refreshBefore: new Date(subscription.expiresAt).toISOString(),
			cursor: null,
			truncated: false,
			...(previousStatus ? { deliveryStatus: previousStatus } : {}),
		};
	}

	unsubscribe(params: Record<string, unknown>): Record<string, never> {
		const definition = this.definitionFor(params.name);
		const filters = validateArguments(definition, params.arguments);
		const delivery = this.validateDelivery(params.delivery, { requireSecret: false });
		const id = this.subscriptionId(delivery.url, definition.name, filters);
		const subscription = this.subscriptions.get(id);
		// Idempotent: an unknown key is not an error.
		if (subscription) this.dropSubscription(subscription);
		void this.stopUnusedSources();
		return {};
	}

	/** Deliver one occurrence to every active, matching subscription. */
	emit(record: McpEventRecord): void {
		if (this.closed) return;
		const timestamp = record.occurredAt || new Date(this.clock()).toISOString();
		for (const subscription of this.subscriptions.values()) {
			if (subscription.removed || !subscription.active) continue;
			if (subscription.name !== record.name) continue;
			if (!matchesFilters(subscription.arguments, record.data)) continue;
			const stampKey = subscription.name === "line.message.edited" ? "updatedAt" : "receivedAt";
			const data = this.projectPayload(subscription.name, record.data, stampKey, timestamp);
			if (subscription.arguments.includeText === false) delete data.text;
			this.enqueue(subscription, {
				eventId: this.eventIdFor(subscription.name, data, timestamp),
				name: subscription.name,
				timestamp,
				data,
				cursor: null,
			});
		}
	}

	/** Keep only the fields advertised by the event's payloadSchema. */
	private projectPayload(
		name: string,
		source: Record<string, unknown>,
		stampKey: "receivedAt" | "updatedAt",
		timestamp: string,
	): Record<string, unknown> {
		const definition = this.definitions.find((entry) => entry.name === name);
		const properties = (definition?.payloadSchema.properties ?? {}) as Record<string, unknown>;
		const data: Record<string, unknown> = {};
		for (const key of Object.keys(properties)) {
			const value = key === stampKey ? timestamp : source[key];
			if (value !== undefined && value !== null) data[key] = value;
		}
		return data;
	}

	/** Wait for queued deliveries to finish (used by tests and graceful shutdown). */
	async flushDeliveries(): Promise<void> {
		while (this.workers.size) {
			await Promise.allSettled(this.workers);
		}
	}

	/** Drop expired subscriptions. Returns the ids that were removed. */
	sweep(): string[] {
		const now = this.clock();
		const removed: string[] = [];
		for (const subscription of this.subscriptions.values()) {
			if (subscription.expiresAt <= now) {
				this.dropSubscription(subscription);
				removed.push(subscription.id);
			}
		}
		for (const [key, expiresAt] of this.verified) {
			if (expiresAt <= now) this.verified.delete(key);
		}
		void this.stopUnusedSources();
		return removed;
	}

	async close(): Promise<void> {
		this.closed = true;
		if (this.timer) clearInterval(this.timer);
		this.timer = undefined;
		for (const subscription of this.subscriptions.values()) this.dropSubscription(subscription);
		const sources = [...this.sources.values()];
		this.sources.clear();
		await Promise.all(sources.map(async (source) => await source.stop().catch(() => {})));
	}

	private definitionFor(name: unknown): McpEventDefinition {
		if (typeof name !== "string" || !name) {
			throw new EventRpcError(EVENT_ERROR_INVALID_PARAMS, "params.name must be a string");
		}
		const definition = this.definitions.find((entry) => entry.name === name);
		if (!definition) {
			throw new EventRpcError(EVENT_ERROR_NOT_FOUND, `Unknown event: ${name}`, {
				kind: "event",
			});
		}
		return definition;
	}

	private validateDelivery(
		value: unknown,
		options: { requireSecret?: boolean } = {},
	): { url: string; secret: string } {
		const requireSecret = options.requireSecret ?? true;
		if (!value || typeof value !== "object" || Array.isArray(value)) {
			throw new EventRpcError(EVENT_ERROR_INVALID_PARAMS, "params.delivery must be an object");
		}
		const delivery = value as Record<string, unknown>;
		if (delivery.mode !== undefined && delivery.mode !== "webhook") {
			throw new EventRpcError(
				EVENT_ERROR_UNSUPPORTED,
				`Unsupported delivery mode: ${String(delivery.mode)}`,
				{ feature: "deliveryMode", value: delivery.mode ?? null },
			);
		}
		let url: URL;
		try {
			url = parseCallbackUrl(delivery.url);
		} catch (error) {
			throw new EventRpcError(
				EVENT_ERROR_INVALID_PARAMS,
				error instanceof Error ? error.message : String(error),
			);
		}
		const hostname = url.hostname.replace(/^\[|\]$/g, "");
		if (/^\d+\.\d+\.\d+\.\d+$/.test(hostname) || hostname.includes(":")) {
			if (!isPublicAddress(hostname)) {
				throw new EventRpcError(
					EVENT_ERROR_INVALID_PARAMS,
					"delivery.url must point at a globally routable address",
				);
			}
		}
		let secret = "";
		if (requireSecret || delivery.secret !== undefined) {
			const problem = webhookSecretProblem(delivery.secret);
			if (problem) throw new EventRpcError(EVENT_ERROR_INVALID_PARAMS, problem);
			secret = delivery.secret as string;
		}
		return { url: url.toString(), secret };
	}

	private grantTtl(requested: unknown): number {
		if (requested === null) {
			// No-expiry grants would require durable storage; this server keeps
			// subscriptions in memory and answers a finite grant instead.
			return this.limits.maxTtlMs;
		}
		if (requested === undefined) return this.limits.defaultTtlMs;
		if (typeof requested !== "number" || !Number.isFinite(requested) || requested <= 0) {
			throw new EventRpcError(
				EVENT_ERROR_INVALID_PARAMS,
				"params.ttlMs must be a positive integer",
			);
		}
		const floored = Math.max(Math.floor(requested), this.limits.minTtlMs);
		return Math.min(floored, this.limits.maxTtlMs);
	}

	private subscriptionId(url: string, name: string, filters: Record<string, unknown>): string {
		const digest = createHash("sha256")
			.update(canonicalJson({ principal: this.principal, url, name, arguments: filters }))
			.digest("hex");
		return `sub_${digest.slice(0, 16)}`;
	}

	private async verifyEndpoint(url: string, secret: string, subscriptionId: string): Promise<void> {
		const key = `${this.principal}\u0000${url}`;
		const cached = this.verified.get(key);
		if (cached !== undefined && cached > this.clock()) return;

		const challenge = randomBytes(24).toString("base64url");
		const body = JSON.stringify({ type: "verification", challenge });
		const webhookId = `msg_verification_${randomBytes(8).toString("hex")}`;
		const timestamp = Math.floor(this.clock() / 1000);
		let response;
		try {
			response = await this.transport.post({
				url,
				body,
				headers: {
					"content-type": "application/json",
					"webhook-id": webhookId,
					"webhook-timestamp": String(timestamp),
					"webhook-signature": webhookSignatureHeader([secret], webhookId, timestamp, body),
					"x-mcp-subscription-id": subscriptionId,
					"user-agent": `linejs-cli/${VERSION}`,
				},
			});
		} catch (error) {
			const reason = error instanceof WebhookDeliveryError ? error.category : "connection_refused";
			throw new EventRpcError(EVENT_ERROR_CALLBACK, "Could not verify the callback endpoint", {
				reason,
			});
		}
		if (response.status < 200 || response.status >= 300) {
			throw new EventRpcError(EVENT_ERROR_CALLBACK, "Could not verify the callback endpoint", {
				reason: webhookErrorCategory(response.status),
			});
		}
		let echoed: unknown;
		try {
			echoed = (JSON.parse(response.body) as Record<string, unknown>).challenge;
		} catch {
			echoed = undefined;
		}
		if (typeof echoed !== "string" || !constantTimeEqual(echoed, challenge)) {
			throw new EventRpcError(EVENT_ERROR_CALLBACK, "Could not verify the callback endpoint", {
				reason: "challenge_failed",
			});
		}
		this.verified.set(key, this.clock() + this.limits.verificationTtlMs);
	}

	private eventIdFor(name: string, data: Record<string, unknown>, timestamp: string): string {
		const messageId = typeof data.messageId === "string" ? data.messageId : undefined;
		if (!messageId) return `evt_${randomBytes(12).toString("hex")}`;
		const digest = createHash("sha256")
			.update(`${name}\u0000${messageId}\u0000${timestamp}`)
			.digest("hex");
		return `evt_${digest.slice(0, 24)}`;
	}

	private enqueue(subscription: Subscription, occurrence: McpEventOccurrence): void {
		const body = JSON.stringify(occurrence);
		if (Buffer.byteLength(body, "utf8") > MAX_WEBHOOK_BODY_BYTES) {
			this.log(`dropped oversized event ${occurrence.eventId} (${occurrence.name})`);
			return;
		}
		if (subscription.queue.length >= this.limits.maxQueue) {
			const dropped = subscription.queue.shift();
			if (dropped) {
				this.log(
					`delivery queue full for ${subscription.id}; dropped ${dropped.occurrence.eventId}`,
				);
			}
		}
		subscription.queue.push({ occurrence, body });
		this.scheduleDrain(subscription);
	}

	private scheduleDrain(subscription: Subscription): void {
		if (subscription.draining) return;
		const worker: Promise<void> = this.drain(subscription).finally(() => {
			this.workers.delete(worker);
		});
		this.workers.add(worker);
	}

	private async drain(subscription: Subscription): Promise<void> {
		if (subscription.draining || this.closed) return;
		subscription.draining = true;
		try {
			while (
				!this.closed &&
				!subscription.removed &&
				subscription.active &&
				subscription.queue.length
			) {
				const job = subscription.queue.shift()!;
				await this.deliver(subscription, job);
			}
		} finally {
			subscription.draining = false;
		}
	}

	private async deliver(subscription: Subscription, job: DeliveryJob): Promise<void> {
		for (let attempt = 1; attempt <= this.limits.maxAttempts; attempt += 1) {
			if (this.closed || subscription.removed || !subscription.active) return;
			const timestamp = Math.floor(this.clock() / 1000);
			const secrets = [subscription.secret];
			if (subscription.previousSecret) secrets.push(subscription.previousSecret);
			let status = 0;
			try {
				const response = await this.transport.post({
					url: subscription.url,
					body: job.body,
					headers: {
						"content-type": "application/json",
						"webhook-id": job.occurrence.eventId,
						"webhook-timestamp": String(timestamp),
						"webhook-signature": webhookSignatureHeader(
							secrets,
							job.occurrence.eventId,
							timestamp,
							job.body,
						),
						"x-mcp-subscription-id": subscription.id,
						"user-agent": `linejs-cli/${VERSION}`,
					},
				});
				status = response.status;
			} catch (error) {
				const reason =
					error instanceof WebhookDeliveryError ? error.category : "connection_refused";
				this.recordFailure(subscription, reason);
				if (attempt >= this.limits.maxAttempts) return;
				await this.backoff(attempt);
				continue;
			}
			if (status >= 200 && status < 300) {
				subscription.lastDeliveryAt = new Date(this.clock()).toISOString();
				subscription.lastError = undefined;
				subscription.failedSince = undefined;
				subscription.consecutiveFailures = 0;
				if (
					subscription.previousSecretUntil !== undefined &&
					this.clock() >= subscription.previousSecretUntil
				) {
					subscription.previousSecret = undefined;
					subscription.previousSecretUntil = undefined;
				}
				return;
			}
			this.recordFailure(subscription, webhookErrorCategory(status));
			// 410 Gone and 413 Payload Too Large are deliberately final.
			if (status === 410 || status === 413) return;
			if (attempt >= this.limits.maxAttempts) return;
			await this.backoff(attempt);
		}
	}

	private async backoff(attempt: number): Promise<void> {
		const delay = Math.min(
			this.limits.retryBaseMs * 2 ** (attempt - 1),
			this.limits.retryMaxDelayMs,
		);
		await this.delay(delay);
	}

	private recordFailure(subscription: Subscription, reason: string): void {
		subscription.consecutiveFailures += 1;
		subscription.lastError = reason;
		subscription.failedSince ??= new Date(this.clock()).toISOString();
		if (subscription.consecutiveFailures >= this.limits.suspendAfterFailures) {
			subscription.active = false;
			this.log(`suspended webhook delivery for ${subscription.id} after repeated failures`);
		}
	}

	private dropSubscription(subscription: Subscription): void {
		subscription.removed = true;
		subscription.active = false;
		subscription.queue.length = 0;
		this.subscriptions.delete(subscription.id);
		void this.stopUnusedSources();
	}

	private requiredSourceKinds(): Set<McpEventSourceKind> {
		const kinds = new Set<McpEventSourceKind>();
		for (const subscription of this.subscriptions.values()) {
			if (subscription.name === "line.openchat.message.received") kinds.add("square");
			else kinds.add("talk");
		}
		return kinds;
	}

	private async ensureSources(): Promise<void> {
		const required = this.requiredSourceKinds();
		for (const kind of ["talk", "square"] as const) {
			if (!required.has(kind)) continue;
			const existing = this.sources.get(kind);
			if (!existing) {
				await this.startSource(kind);
				continue;
			}
			// A refresh also gives a listener that died (network drop, expired
			// session) another chance to reconnect.
			await existing.start(this.sourceListener).catch((error: unknown) => {
				this.log(
					`could not restart the ${kind} LINE listener: ${error instanceof Error ? error.message : String(error)}`,
				);
			});
		}
		await this.stopUnusedSources();
	}

	private readonly sourceListener = (record: McpEventRecord): void => {
		this.emit(record);
	};

	private async startSource(kind: McpEventSourceKind): Promise<void> {
		if (!this.sourceFactory) {
			throw new EventRpcError(
				EVENT_ERROR_UNSUPPORTED,
				"Webhook delivery is not available: this server has no LINE event source",
				{ feature: "events" },
			);
		}
		const source = this.sourceFactory(kind);
		try {
			await source.start(this.sourceListener);
		} catch (error) {
			throw new EventRpcError(
				EVENT_ERROR_FORBIDDEN,
				`The LINE listener could not start: ${error instanceof Error ? error.message : String(error)}`,
				{ reason: "upstream_unavailable" },
			);
		}
		this.sources.set(kind, source);
	}

	private async stopUnusedSources(): Promise<void> {
		const required = this.requiredSourceKinds();
		for (const [kind, source] of this.sources) {
			if (required.has(kind)) continue;
			this.sources.delete(kind);
			await source.stop().catch(() => {});
		}
	}
}
