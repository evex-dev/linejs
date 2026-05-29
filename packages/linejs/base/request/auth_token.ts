import { Buffer } from "node:buffer";
import { createHmac } from "node:crypto";

export interface AuthTokenCredential {
	accessToken: string;
	refreshToken?: string;
	expire?: number;
}

export type AuthTokenInput = string | AuthTokenCredential;

export function parseAuthTokenInput(
	input: AuthTokenInput,
): AuthTokenCredential {
	if (typeof input !== "string") {
		return {
			accessToken: input.accessToken.trim(),
			refreshToken: input.refreshToken?.trim(),
			expire: input.expire,
		};
	}
	const value = input.trim();
	if (!value) return { accessToken: value };

	const lines = value.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
	if (lines.length >= 2 && isJwt(lines[0]) && isJwt(lines[1])) {
		return { accessToken: lines[0], refreshToken: lines[1] };
	}

	if (value.startsWith("{")) {
		const parsed = JSON.parse(value) as Record<string, unknown>;
		const nested = parsed.tokenV3IssueResult as
			| Record<string, unknown>
			| undefined;
		const accessToken = stringField(parsed.accessToken) ??
			stringField(parsed.authToken) ??
			(nested ? stringField(nested.accessToken) : undefined);
		if (!accessToken) {
			throw new Error("auth token JSON must contain accessToken");
		}
		const refreshToken = stringField(parsed.refreshToken) ??
			(nested ? stringField(nested.refreshToken) : undefined);
		const expire = numberField(parsed.expire);
		return { accessToken, refreshToken, expire };
	}

	return { accessToken: value };
}

export function resolveLineAccessToken(token: string): string {
	const value = token.trim();
	const colon = value.indexOf(":");
	if (colon === -1) return value;

	const payload = value.slice(colon + 1);
	if (isJwt(payload)) return payload;
	if (isPrimaryAccessToken(value)) return value;
	if (looksLikeAuthKey(value)) return createPrimaryAccessToken(value);
	return value;
}

export function shouldUseLegyEncryptedAccess(
	token: string | undefined,
): boolean {
	if (!token) return false;
	const value = token.trim();
	if (isJwt(value)) return true;
	const colon = value.indexOf(":");
	if (colon === -1) return false;
	const payload = value.slice(colon + 1);
	return isJwt(payload) || isPrimaryAccessToken(value) ||
		looksLikeAuthKey(value);
}

export function isJwt(value: string): boolean {
	const parts = value.split(".");
	if (parts.length !== 3) return false;
	try {
		const header = JSON.parse(base64UrlDecode(parts[0]).toString("utf-8")) as {
			alg?: unknown;
		};
		const payload = JSON.parse(
			base64UrlDecode(parts[1]).toString("utf-8"),
		) as Record<string, unknown>;
		return typeof header.alg === "string" && (
			typeof payload.ver !== "undefined" ||
			typeof payload.scp !== "undefined" ||
			typeof payload.exp !== "undefined" ||
			typeof payload.iat !== "undefined" ||
			typeof payload.sub !== "undefined" ||
			typeof payload.iss !== "undefined" ||
			typeof payload.aud !== "undefined"
		);
	} catch {
		return false;
	}
}

export function isPrimaryAccessToken(value: string): boolean {
	const colon = value.indexOf(":");
	if (colon === -1) return false;
	const payload = value.slice(colon + 1);
	const first = payload.split(".")[0];
	try {
		return Buffer.from(first, "base64").toString("utf-8").startsWith("iat:");
	} catch {
		return false;
	}
}

export function createPrimaryAccessToken(
	authKey: string,
	now = Date.now(),
): string {
	const colon = authKey.indexOf(":");
	if (colon === -1) return authKey;
	const mid = authKey.slice(0, colon);
	const key = Buffer.from(authKey.slice(colon + 1), "base64");
	const iat = Buffer.from(
		`iat: ${Math.floor(now / 1000) * 60}\n`,
		"utf-8",
	).toString("base64") + ".";
	const digest = createHmac("sha1", key).update(iat).digest("base64");
	return `${mid}:${iat}.${digest}`;
}

function looksLikeAuthKey(value: string): boolean {
	const colon = value.indexOf(":");
	if (colon === -1) return false;
	const mid = value.slice(0, colon);
	const payload = value.slice(colon + 1);
	if (!/^[a-z][0-9a-f]{32}$/i.test(mid)) return false;
	try {
		return Buffer.from(payload, "base64").length > 0;
	} catch {
		return false;
	}
}

function stringField(value: unknown): string | undefined {
	return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function numberField(value: unknown): number | undefined {
	return typeof value === "number" && Number.isFinite(value)
		? value
		: undefined;
}

function base64UrlDecode(value: string): Buffer {
	const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
	const padded = normalized + "=".repeat((4 - normalized.length % 4) % 4);
	return Buffer.from(padded, "base64");
}
