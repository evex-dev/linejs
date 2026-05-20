/**
 * VOOM (timeline / myhome) REST helpers.
 *
 * Two surfaces:
 *   - `client.voom.*` — typed high-level wrappers that mint the right
 *     channel token + assemble the auth headers + call the gateway.
 *   - `client.voomRest({ path, channelToken })` — low-level for ad-hoc
 *     calls.
 *
 * Gateway: `https://gw.line.naver.jp/mh/api/v{34,40,52,57}/...`,
 * returning `{ code, message, result }`.
 *
 * Auth (live-verified): `Authorization: Bearer <channelToken>` +
 * `X-Line-Mid: <mid>`.  `client.base.channel.issueChannelToken({
 * channelId })` takes an **object** (not positional string).
 * `DESKTOPWIN` cannot mint these on LINE 26+ — use
 * `device: "ANDROIDSECONDARY"`.
 *
 * Source of truth:
 *   `decompiled/base/smali/smali/t98/a$b.smali` (channel id enum)
 *   gateway path family confirmed by live HTTP probing.
 */
import type { Client } from "../mod.ts";

/** Channel-id constants for the MH-family services.  Values verified
 *  from LINE Android 26.6.2 smali `t98.a$b` (the AccessTokenManager
 *  channel-type enum). */
export const VoomChannelId = {
	TIMELINE: "1341209950",
	HOME: "1341209850",
	HOME26: "2007835442",
	NOTE: "1655599932",
	SQUARE_NOTE: "1657618623",
	ALBUM: "1375220249",
} as const;

export interface VoomRestOptions {
	path: string;
	method?: "GET" | "POST" | "PUT" | "DELETE";
	body?: unknown;
	channelToken?: string;
	extraHeaders?: Record<string, string>;
	host?: string;
}

export interface VoomRestResponse<T = unknown> {
	code: number;
	message?: string;
	result: T | null;
}

export async function voomRest<T = unknown>(
	client: Client,
	opts: VoomRestOptions,
): Promise<VoomRestResponse<T>> {
	const host = opts.host ?? "gw.line.naver.jp";
	const method = opts.method ?? "GET";
	const url = `https://${host}${
		opts.path.startsWith("/") ? opts.path : "/" + opts.path
	}`;
	const headers: Record<string, string> = {
		accept: "application/json",
		"x-line-application": client.base.request.systemType,
		"user-agent": client.base.request.userAgent,
		"X-Line-Mid": client.base.profile?.mid ?? "",
		"x-lal": "ja-JP",
		"X-Line-BDBTemplateVersion": "v1",
		...(opts.channelToken
			? { authorization: `Bearer ${opts.channelToken}` }
			: { "x-line-access": client.authToken }),
		...(opts.extraHeaders ?? {}),
	};
	if (opts.body !== undefined) headers["content-type"] = "application/json";
	const res = await client.base.fetch(url, {
		method,
		headers,
		body: opts.body === undefined ? undefined : JSON.stringify(opts.body),
	});
	const text = await res.text();
	if (!text) {
		return { code: res.status, message: res.statusText, result: null };
	}
	return JSON.parse(text) as VoomRestResponse<T>;
}

/**
 * Mints + caches a channel-scoped token for one of the MH channels.
 * The token is bound to the current session and device; v2.8.x has
 * verified it works from `device: "ANDROIDSECONDARY"`.
 */
export async function getChannelToken(
	client: Client,
	channelId: string,
): Promise<string> {
	const r = await client.base.channel.issueChannelToken({ channelId });
	const t = (r as unknown as { token?: string }).token;
	if (!t) throw new Error("issueChannelToken returned no token");
	return t;
}

export interface VoomClient {
	/** Mints (or returns cached) channel token for the given channel. */
	getToken(channel: keyof typeof VoomChannelId): Promise<string>;
	/** Calls a path on the MH gateway using the auto-minted channel
	 *  token for the given channel. */
	call<T = unknown>(
		channel: keyof typeof VoomChannelId,
		opts: Omit<VoomRestOptions, "channelToken">,
	): Promise<VoomRestResponse<T>>;
	/** Convenience: fetch the user's VOOM feed (TIMELINE channel).
	 *  Wraps `/v57/post/list.json?postLimit=N&followingMaxPage=M`. */
	feed(opts?: { postLimit?: number; followingMaxPage?: number }): Promise<VoomRestResponse>;
}

class ClientVoom implements VoomClient {
	#client: Client;
	#tokenCache = new Map<string, string>();
	constructor(client: Client) {
		this.#client = client;
	}
	async getToken(channel: keyof typeof VoomChannelId): Promise<string> {
		let t = this.#tokenCache.get(channel);
		if (!t) {
			t = await getChannelToken(this.#client, VoomChannelId[channel]);
			this.#tokenCache.set(channel, t);
		}
		return t;
	}
	async call<T = unknown>(
		channel: keyof typeof VoomChannelId,
		opts: Omit<VoomRestOptions, "channelToken">,
	): Promise<VoomRestResponse<T>> {
		const channelToken = await this.getToken(channel);
		return await voomRest<T>(this.#client, { ...opts, channelToken });
	}
	async feed(opts: { postLimit?: number; followingMaxPage?: number } = {}) {
		const postLimit = opts.postLimit ?? 10;
		const followingMaxPage = opts.followingMaxPage ?? 2;
		return await this.call("TIMELINE", {
			path: `/v57/post/list.json?postLimit=${postLimit}&followingMaxPage=${followingMaxPage}`,
		});
	}
}

export function createVoomClient(client: Client): VoomClient {
	return new ClientVoom(client);
}
