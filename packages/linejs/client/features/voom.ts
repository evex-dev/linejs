// VOOM / MyHome / Note / Album REST helpers. Routing prefix table +
// X-Line-ChannelToken auth — all from smali (m98/v$a, ps5/j) and
// live-verified against gw.line.naver.jp.
import type { Client } from "../mod.ts";

/** Channel ids from smali t98.a$b. */
export const VoomChannelId = {
	TIMELINE: "1341209950",
	HOME: "1341209850",
	HOME26: "2007835442",
	NOTE: "1655599932",
	SQUARE_NOTE: "1657618623",
	ALBUM: "1375220249",
} as const;

/**
 * Routing prefix per MH-family service, from smali ps5/j enum.
 * All 11 prefixes live-verified against gw.line.naver.jp — gateway
 * routes the request and returns a structured response (LINE code or
 * Spring error from the right upstream).
 */
export const VoomRoutingPrefix = {
	MYHOME: "/mh",
	MYHOME_RENEWAL: "/hm",
	TIMELINE: "/tl",
	TIMELINE_GATEWAY: "/ext/timeline/tlgw",
	NOTE: "/ext/note/nt",
	HOMEAPI: "/ma",
	SQUARE_NOTE: "/sn",
	ALBUM: "/ext/album",
	STORY: "/st",
	SOCIAL_NOTIFICATION: "/eg",
	TRANSLATION: "/ds",
} as const;

export type VoomRouting = keyof typeof VoomRoutingPrefix;

export interface VoomRestOptions {
	/** Path under the routing prefix, e.g. "/api/v57/post/list.json". */
	path: string;
	/** Which routing prefix to apply. Defaults to MYHOME. */
	routing?: VoomRouting;
	method?: "GET" | "POST" | "PUT" | "DELETE";
	body?: unknown;
	channelToken?: string;
	extraHeaders?: Record<string, string>;
	/** Full host override (default gw.line.naver.jp). */
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
	const prefix = VoomRoutingPrefix[opts.routing ?? "MYHOME"];
	const method = opts.method ?? (opts.body !== undefined ? "POST" : "GET");
	const path = opts.path.startsWith("/") ? opts.path : "/" + opts.path;
	const url = `https://${host}${prefix}${path}`;
	const headers: Record<string, string> = {
		accept: "application/json",
		"X-Line-Application": client.base.request.systemType,
		"user-agent": client.base.request.userAgent,
		"X-Line-Mid": client.base.profile?.mid ?? "",
		"x-lal": "ja-JP",
		"X-Line-BDBTemplateVersion": "v1",
		// Channel-scoped → X-Line-ChannelToken (smali m98/v$a). Primary
		// session → X-Line-Access. NOT Authorization: Bearer.
		...(opts.channelToken
			? { "X-Line-ChannelToken": opts.channelToken }
			: { "X-Line-Access": client.authToken }),
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

export async function getChannelToken(
	client: Client,
	channelId: string,
): Promise<string> {
	const r = await client.base.channel.issueChannelToken({ channelId });
	const t = (r as unknown as { token?: string }).token;
	if (!t) throw new Error("issueChannelToken returned no token");
	return t;
}

/**
 * Curated MH-family REST paths from LINE Android 26.6.2 smali.
 * Each path is paired with its routing prefix in {@link VoomEndpointRouting}.
 */
export const VoomEndpoints = {
	// VOOM feed / posts → MYHOME prefix
	feed: "/api/v57/post/list.json",
	createPost: "/api/v57/post/create.json",
	updatePost: "/api/v57/post/update.json",
	deletePost: "/api/v57/post/delete.json",
	getPost: "/api/v57/post/get.json",
	sharePost: "/api/v57/post/share.json",
	sendPostToTalk: "/api/v57/post/sendPostToTalk.json",
	getShareLink: "/api/v57/post/getShareLink.json",
	reportPost: "/api/v57/post/report.json",
	createComment: "/api/v57/comment/create.json",
	deleteComment: "/api/v57/comment/delete.json",
	getComment: "/api/v57/comment/get.json",
	listComments: "/api/v57/comment/getList.json",
	reportComment: "/api/v57/comment/report.json",
	createLike: "/api/v57/like/create.json",
	cancelLike: "/api/v57/like/cancel.json",
	getLike: "/api/v57/like/get.json",
	listLikes: "/api/v57/like/getList.json",
	hashtagPosts: "/api/v57/hashtag/posts.json",
	hashtagSearch: "/api/v57/hashtag/search.json",
	hashtagSuggestPopular: "/api/v57/hashtag/suggest/popular.json",
	groupHomeInit: "/api/v57/grouphome/init.json",
	// TIMELINE prefix
	timelineStatus: "/api/v57/timeline/tab/status.json",
	timelineContents: "/api/v57/timeline/tab/contents.json",
	// HOMEAPI prefix
	homeProfile: "/api/v1/home/profile.json",
	homeCover: "/api/v1/home/cover.json",
} as const;

export interface VoomClient {
	getToken(channel: keyof typeof VoomChannelId): Promise<string>;
	/** Low-level call. Auto-mints channel token + applies routing prefix. */
	call<T = unknown>(
		channel: keyof typeof VoomChannelId,
		opts: Omit<VoomRestOptions, "channelToken">,
	): Promise<VoomRestResponse<T>>;
	/** GET /mh/api/v57/post/list.json — VOOM feed. Live-verified (#151). */
	feed(opts?: { postLimit?: number; followingMaxPage?: number }): Promise<VoomRestResponse>;
	/** GET /tl/api/v57/timeline/tab/status.json. Live-verified. */
	timelineStatus(): Promise<VoomRestResponse>;
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
			routing: "MYHOME",
			path:
				`${VoomEndpoints.feed}?postLimit=${postLimit}&followingMaxPage=${followingMaxPage}`,
		});
	}
	async timelineStatus() {
		return await this.call("TIMELINE", {
			routing: "TIMELINE",
			path: VoomEndpoints.timelineStatus,
		});
	}
}

export function createVoomClient(client: Client): VoomClient {
	return new ClientVoom(client);
}
