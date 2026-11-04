import { createHmac } from "node:crypto";
import { lookup as dnsLookup } from "node:dns/promises";
import { request as httpsRequest } from "node:https";
import { isIP } from "node:net";

/**
 * Webhook delivery for the MCP Events extension.
 *
 * Deliveries follow the Standard Webhooks profile described by
 * https://github.com/modelcontextprotocol/experimental-ext-triggers-events and
 * are hardened against SSRF: the hostname is resolved and validated on every
 * attempt, the connection is pinned to the validated address, and redirects
 * are never followed.
 */

export const WEBHOOK_SECRET_PREFIX = "whsec_";
export const MAX_WEBHOOK_BODY_BYTES = 256 * 1024;

const MAX_RESPONSE_BYTES = 64 * 1024;
const DEFAULT_TIMEOUT_MS = 10_000;

export type WebhookErrorCategory =
	| "connection_refused"
	| "timeout"
	| "tls_error"
	| "http_4xx"
	| "http_5xx"
	| "challenge_failed";

export class WebhookDeliveryError extends Error {
	readonly category: WebhookErrorCategory;

	constructor(category: WebhookErrorCategory, message: string) {
		super(message);
		this.name = "WebhookDeliveryError";
		this.category = category;
	}
}

export interface WebhookRequest {
	url: string;
	headers: Record<string, string>;
	body: string;
	timeoutMs?: number;
}

export interface WebhookResponse {
	status: number;
	/** Response body, truncated to 64 KiB. */
	body: string;
}

export interface WebhookTransport {
	post(request: WebhookRequest): Promise<WebhookResponse>;
}

export interface ResolvedAddress {
	address: string;
	family: number;
}

/** Returns a human-readable problem when `value` is not a Standard Webhooks secret. */
export function webhookSecretProblem(value: unknown): string | null {
	if (typeof value !== "string") return "delivery.secret must be a string";
	if (!value.startsWith(WEBHOOK_SECRET_PREFIX)) {
		return `delivery.secret must start with ${WEBHOOK_SECRET_PREFIX}`;
	}
	const encoded = value.slice(WEBHOOK_SECRET_PREFIX.length);
	if (!/^[A-Za-z0-9+/]+={0,2}$/.test(encoded)) {
		return "delivery.secret must be base64 after the whsec_ prefix";
	}
	const bytes = Buffer.from(encoded, "base64");
	if (bytes.length < 24 || bytes.length > 64) {
		return "delivery.secret must decode to 24-64 bytes";
	}
	return null;
}

export function decodeWebhookSecret(secret: string): Buffer {
	const encoded = secret.startsWith(WEBHOOK_SECRET_PREFIX)
		? secret.slice(WEBHOOK_SECRET_PREFIX.length)
		: secret;
	return Buffer.from(encoded, "base64");
}

/**
 * Standard Webhooks signature: `v1,<base64 HMAC-SHA256(secret, id.timestamp.body)>`.
 * The body must be the exact bytes sent on the wire.
 */
export function signWebhook(
	secret: string,
	webhookId: string,
	timestampSeconds: number,
	body: string,
): string {
	const digest = createHmac("sha256", decodeWebhookSecret(secret))
		.update(`${webhookId}.${timestampSeconds}.${body}`, "utf8")
		.digest("base64");
	return `v1,${digest}`;
}

/** Space-delimited multi-signature header, used for secret rotation. */
export function webhookSignatureHeader(
	secrets: readonly string[],
	webhookId: string,
	timestampSeconds: number,
	body: string,
): string {
	return secrets
		.filter((secret): secret is string => typeof secret === "string" && secret.length > 0)
		.map((secret) => signWebhook(secret, webhookId, timestampSeconds, body))
		.join(" ");
}

export function webhookErrorCategory(status: number): WebhookErrorCategory {
	return status >= 500 ? "http_5xx" : "http_4xx";
}

/** Parse and enforce the `https` requirement for callback URLs. */
export function parseCallbackUrl(value: unknown): URL {
	if (typeof value !== "string" || !value.trim()) {
		throw new Error("delivery.url must be a non-empty string");
	}
	let url: URL;
	try {
		url = new URL(value);
	} catch {
		throw new Error("delivery.url must be an absolute URL");
	}
	if (url.protocol !== "https:") throw new Error("delivery.url must use https");
	if (!url.hostname) throw new Error("delivery.url must include a hostname");
	if (url.username || url.password) throw new Error("delivery.url must not embed credentials");
	if (url.hash) throw new Error("delivery.url must not include a fragment");
	return url;
}

const V4_BLOCKLIST: ReadonlyArray<readonly [string, number]> = [
	["0.0.0.0", 8],
	["10.0.0.0", 8],
	["100.64.0.0", 10],
	["127.0.0.0", 8],
	["169.254.0.0", 16],
	["172.16.0.0", 12],
	["192.0.0.0", 24],
	["192.0.2.0", 24],
	["192.88.99.0", 24],
	["192.168.0.0", 16],
	["198.18.0.0", 15],
	["198.51.100.0", 24],
	["203.0.113.0", 24],
	["224.0.0.0", 4],
	["240.0.0.0", 4],
];

function ipv4ToInt(address: string): number {
	return address
		.split(".")
		.reduce((total, part) => ((total << 8) | (Number(part) & 0xff)) >>> 0, 0);
}

function inV4Range(value: number, base: string, prefix: number): boolean {
	const mask = prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0;
	return (value & mask) >>> 0 === (ipv4ToInt(base) & mask) >>> 0;
}

function isPublicV4(address: string): boolean {
	const value = ipv4ToInt(address);
	return !V4_BLOCKLIST.some(([base, prefix]) => inV4Range(value, base, prefix));
}

function isPublicV6(address: string): boolean {
	const normalized =
		address
			.toLowerCase()
			.replace(/^\[|\]$/g, "")
			.split("%")[0] ?? "";
	if (normalized === "::" || normalized === "::1") return false;
	const mapped = /^::ffff:(\d+\.\d+\.\d+\.\d+)$/.exec(normalized);
	if (mapped?.[1]) return isPublicV4(mapped[1]);
	const first = normalized.split(":")[0] ?? "";
	if (!first) return false;
	const prefix = Number.parseInt(first.padEnd(4, "0"), 16);
	if (Number.isNaN(prefix)) return false;
	// fc00::/7 (unique local), fe80::/10 (link local), ff00::/8 (multicast),
	// 2001:db8::/32 (documentation), 100::/64 (discard-only).
	if ((prefix & 0xfe00) === 0xfc00) return false;
	if ((prefix & 0xffc0) === 0xfe80) return false;
	if ((prefix & 0xff00) === 0xff00) return false;
	if (normalized.startsWith("2001:db8:")) return false;
	if (normalized === "100::" || normalized.startsWith("100::")) return false;
	return true;
}

/** True when the address is globally routable per the IANA special-purpose registries. */
export function isPublicAddress(address: string): boolean {
	const family = isIP(address);
	if (family === 4) return isPublicV4(address);
	if (family === 6) return isPublicV6(address);
	return false;
}

export interface WebhookTransportOptions {
	/** Resolve a hostname to candidate addresses. Defaults to dns.lookup({ all: true }). */
	resolve?(hostname: string): Promise<ResolvedAddress[]>;
	timeoutMs?: number;
}

/**
 * Deliveries resolve the callback host on every attempt and connect to the
 * validated address while keeping the original hostname for TLS verification.
 */
export function createWebhookTransport(options: WebhookTransportOptions = {}): WebhookTransport {
	const resolve =
		options.resolve ?? (async (hostname: string) => dnsLookup(hostname, { all: true }));
	const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;

	return {
		async post(request: WebhookRequest): Promise<WebhookResponse> {
			const url = new URL(request.url);
			const hostname = url.hostname.replace(/^\[|\]$/g, "");

			let addresses: ResolvedAddress[];
			try {
				addresses = await resolve(hostname);
			} catch {
				throw new WebhookDeliveryError("connection_refused", `could not resolve ${hostname}`);
			}
			if (!addresses.length) {
				throw new WebhookDeliveryError("connection_refused", `${hostname} did not resolve`);
			}
			// Reject the whole callback when any candidate is non-public: the
			// address actually used must not be attacker-selected at connect time.
			if (addresses.some((entry) => !isPublicAddress(entry.address))) {
				throw new WebhookDeliveryError(
					"connection_refused",
					`${hostname} resolves to a non-public address`,
				);
			}
			const target = addresses[0]!;
			const body = request.body;

			return await new Promise<WebhookResponse>((resolveRequest, rejectRequest) => {
				const headers: Record<string, string> = {
					...request.headers,
					host: url.host,
					"content-length": String(Buffer.byteLength(body, "utf8")),
				};
				const signal = AbortSignal.timeout(request.timeoutMs ?? timeoutMs);
				const call = httpsRequest(
					{
						method: "POST",
						host: hostname,
						port: url.port ? Number(url.port) : 443,
						path: `${url.pathname}${url.search}`,
						headers,
						// SNI and certificate identity checks keep using the hostname
						// while the TCP connection goes to the validated address.
						...(isIP(hostname) ? {} : { servername: hostname }),
						lookup: (_host, lookupOptions, callback) => {
							if (lookupOptions?.all) {
								callback(null, [{ address: target.address, family: target.family }]);
								return;
							}
							callback(null, target.address, target.family);
						},
						signal,
					},
					(response) => {
						const chunks: Buffer[] = [];
						let size = 0;
						response.on("data", (chunk: Buffer) => {
							if (size >= MAX_RESPONSE_BYTES) return;
							const slice = chunk.subarray(0, MAX_RESPONSE_BYTES - size);
							chunks.push(slice);
							size += slice.length;
						});
						response.on("end", () => {
							resolveRequest({
								status: response.statusCode ?? 0,
								body: Buffer.concat(chunks).toString("utf8"),
							});
						});
						response.on("error", rejectRequest);
					},
				);
				call.on("error", rejectRequest);
				call.end(body);
			}).catch((error: unknown) => {
				throw toWebhookDeliveryError(error);
			});
		},
	};
}

const TLS_ERROR_CODES = [
	"ERR_TLS_CERT_ALTNAME_INVALID",
	"DEPTH_ZERO_SELF_SIGNED_CERT",
	"SELF_SIGNED_CERT_IN_CHAIN",
	"UNABLE_TO_VERIFY_LEAF_SIGNATURE",
	"UNABLE_TO_GET_ISSUER_CERT_LOCALLY",
	"CERT_HAS_EXPIRED",
	"ERR_SSL_WRONG_VERSION_NUMBER",
	"ERR_SSL_PACKET_LENGTH_MISMATCH",
	"EPROTO",
];

function toWebhookDeliveryError(error: unknown): WebhookDeliveryError {
	if (error instanceof WebhookDeliveryError) return error;
	if (error instanceof Error) {
		const code = (error as NodeJS.ErrnoException).code ?? "";
		if (error.name === "AbortError" || code === "ETIMEDOUT" || code === "UND_ERR_CONNECT_TIMEOUT") {
			return new WebhookDeliveryError("timeout", "callback endpoint timed out");
		}
		if (
			TLS_ERROR_CODES.includes(code) ||
			code.startsWith("ERR_TLS") ||
			code.startsWith("ERR_SSL")
		) {
			return new WebhookDeliveryError("tls_error", "callback endpoint failed TLS verification");
		}
		if (code === "ECONNREFUSED" || code === "ENOTFOUND" || code === "EHOSTUNREACH") {
			return new WebhookDeliveryError(
				"connection_refused",
				"callback endpoint refused the connection",
			);
		}
		return new WebhookDeliveryError("connection_refused", error.message);
	}
	return new WebhookDeliveryError("connection_refused", String(error));
}
