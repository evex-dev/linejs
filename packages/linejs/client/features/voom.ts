// VOOM/MH REST helpers — gw.line.naver.jp/mh, auth via channel-token
// (Bearer + X-Line-Mid). Needs ANDROIDSECONDARY device — DESKTOPWIN
// can't mint on LINE 26+.
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
	// Live probe: gw.line.naver.jp/<path> returns 404; the gateway prefix
	// is /mh. So host default = "gw.line.naver.jp/mh".
	const host = opts.host ?? "gw.line.naver.jp/mh";
	const method = opts.method ?? "GET";
	const url = `https://${host}${
		opts.path.startsWith("/") ? opts.path : "/" + opts.path
	}`;
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

/** MH-gateway REST paths from LINE Android 26.6.2 smali. */
export const VoomEndpoints = {
	// VOOM feed / posts (TIMELINE channel)
	feed: "/api/v57/post/list.json",
	createPost: "/api/v57/post/create.json",
	updatePost: "/api/v57/post/update.json",
	deletePost: "/api/v57/post/delete.json",
	getPost: "/api/v57/post/get.json",
	sharePost: "/api/v57/post/share.json",
	sendPostToTalk: "/api/v57/post/sendPostToTalk.json",
	getShareLink: "/api/v57/post/getShareLink.json",
	reportPost: "/api/v57/post/report.json",
	// Comments
	createComment: "/api/v57/comment/create.json",
	updateComment: "/api/v57/comment/get.json",
	deleteComment: "/api/v57/comment/delete.json",
	getComment: "/api/v57/comment/get.json",
	listComments: "/api/v57/comment/getList.json",
	reportComment: "/api/v57/comment/report.json",
	// Likes
	createLike: "/api/v57/like/create.json",
	cancelLike: "/api/v57/like/cancel.json",
	getLike: "/api/v57/like/get.json",
	listLikes: "/api/v57/like/getList.json",
	// Feed / timeline
	feedGet: "/api/v57/feed/get.json",
	feedNewfeed: "/api/v57/feed/newfeed.json",
	timelineStatus: "/api/v57/timeline/tab/status.json",
	timelineContents: "/api/v57/timeline/tab/contents.json",
	// Search
	searchNote: "/api/v57/search/note.json",
	hashtagPosts: "/api/v57/hashtag/posts.json",
	hashtagSearch: "/api/v57/hashtag/search.json",
	// Home / profile
	homeProfile: "/api/v1/home/profile.json",
	homeCover: "/api/v1/home/cover.json",
	homeGroupProfile: "/api/v1/home/groupprofile.json",
	// Chat Note (BDB = bulletin-board) — bound to the NOTE channel.
	noteBoardGet: "/api/v1/bdb/board/get",
	noteBoardDelete: "/api/v1/bdb/board/delete",
	noteBoardUpdateReadPermission: "/api/v1/bdb/board/update/readPermission",
	noteCardCreate: "/api/v1/bdb/card/create",
	noteCardUpdate: "/api/v1/bdb/card/update",
	noteCardDelete: "/api/v1/bdb/card/delete",
	noteCardList: "/api/v1/bdb/card/list",
	noteCardReport: "/api/v1/bdb/card/report",
	noteCardLikeCreate: "/api/v1/bdb/card/like/create",
	noteCardLikeCancel: "/api/v1/bdb/card/like/cancel",
	noteCardLikeList: "/api/v1/bdb/card/like/list",
} as const;

export type VoomEndpoint = keyof typeof VoomEndpoints;

export interface VoomClient {
	getToken(channel: keyof typeof VoomChannelId): Promise<string>;
	call<T = unknown>(
		channel: keyof typeof VoomChannelId,
		opts: Omit<VoomRestOptions, "channelToken">,
	): Promise<VoomRestResponse<T>>;
	feed(opts?: { postLimit?: number; followingMaxPage?: number }): Promise<VoomRestResponse>;
	noteList(opts: { boardId: string; limit?: number }): Promise<VoomRestResponse>;
	noteCreate(opts: { boardId: string; body: Record<string, unknown> }): Promise<VoomRestResponse>;
	noteLike(opts: { cardId: string }): Promise<VoomRestResponse>;
	noteUnlike(opts: { cardId: string }): Promise<VoomRestResponse>;
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
			path:
				`${VoomEndpoints.feed}?postLimit=${postLimit}&followingMaxPage=${followingMaxPage}`,
		});
	}
	async noteList(opts: { boardId: string; limit?: number }) {
		const q = new URLSearchParams({ boardId: opts.boardId });
		if (opts.limit !== undefined) q.set("limit", String(opts.limit));
		return await this.call("NOTE", {
			path: `${VoomEndpoints.noteCardList}?${q.toString()}`,
		});
	}
	async noteCreate(opts: { boardId: string; body: Record<string, unknown> }) {
		return await this.call("NOTE", {
			path: VoomEndpoints.noteCardCreate,
			method: "POST",
			body: { boardId: opts.boardId, ...opts.body },
		});
	}
	async noteLike(opts: { cardId: string }) {
		return await this.call("NOTE", {
			path: VoomEndpoints.noteCardLikeCreate,
			method: "POST",
			body: { cardId: opts.cardId },
		});
	}
	async noteUnlike(opts: { cardId: string }) {
		return await this.call("NOTE", {
			path: VoomEndpoints.noteCardLikeCancel,
			method: "POST",
			body: { cardId: opts.cardId },
		});
	}
}

export function createVoomClient(client: Client): VoomClient {
	return new ClientVoom(client);
}
