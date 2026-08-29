import type { BaseClient } from "../../core/mod.ts";
import { InternalError } from "../../core/mod.ts";

/**
 * Channel id used by the LINE Album (Moa) subsystem. Every Moa REST request
 * must include a `X-Line-ChannelToken` issued for this channel.
 */
export const MOA_CHANNEL_ID = "1375220249";

const LEGY_MOA_PREFIX = "/ext/album";

export interface MoaAlbum {
	albumId: string;
	chatId: string;
	title?: string;
	photoCount?: number;
	createTime?: number;
	updateTime?: number;
}

export interface MoaAlbumsResult {
	albums: MoaAlbum[];
	cursor?: string;
	nextCursor?: string;
	hasMore?: boolean;
}

export interface MoaAlbumsResponse {
	code?: number;
	message?: string;
	result?: MoaAlbumsResult;
}

export interface AlbumPhoto {
	id?: string | number;
	photoId?: string | number;
	oid?: string;
	obsResourceId?: { oid?: string; svc?: string; sid?: string };
	shotTime?: number;
	createUserMid?: string;
	ownerMid?: string;
	resourceType?: string;
	width?: number;
	height?: number;
}

export interface AlbumPhotosResult {
	photos: AlbumPhoto[];
	nextCursor?: string;
}

export interface AlbumPhotosResponse {
	code?: number;
	message?: string;
	result?: AlbumPhotosResult;
}

/**
 * Build a fully-qualified Moa REST URL from `pathSuffix` (relative to
 * `/ext/album`) and a params object. `undefined` values are dropped so
 * callers can pass optional parameters directly.
 *
 * @example
 * ```ts
 * buildMoaUrl("/moa/v2/albums", { cursor: "", orderBy: "createTimeDesc" })
 * // -> "https://legy.line-apps.com/ext/album/moa/v2/albums?cursor=&orderBy=createTimeDesc"
 * ```
 */
export function buildMoaUrl(
	endpoint: string,
	pathSuffix: string,
	params: Record<string, string | number | undefined>,
): string {
	const base = `https://${endpoint}${LEGY_MOA_PREFIX}${pathSuffix}`;
	const entries = Object.entries(params).filter(([, v]) => v !== undefined) as [
		string,
		string | number,
	][];
	if (entries.length === 0) return base;
	const q = entries
		.map(([k, v]) =>
			`${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`
		)
		.join("&");
	return `${base}?${q}`;
}

/**
 * Client for the LINE Album (Moa) REST API.
 *
 * Unlike Talk / Square, Moa speaks plain HTTP JSON on top of the LEGY proxy
 * — not Thrift — so this service uses `client.fetch` directly with an
 * `X-Line-ChannelToken` obtained from `channel.approveChannelAndIssueChannelToken`.
 *
 * @example
 * ```ts
 * const first = await client.moa.getAlbums({});
 * for (const album of first.result?.albums ?? []) {
 *   console.log(album.title, album.photoCount);
 * }
 * ```
 */
export class MoaService {
	client: BaseClient;
	#cachedChannelToken: string | undefined;

	constructor(client: BaseClient) {
		this.client = client;
	}

	/**
	 * Issue (and memoise) the album channel token. Every subsequent Moa REST
	 * call uses this token via the `X-Line-ChannelToken` header.
	 */
	async getAlbumChannelToken(): Promise<string> {
		if (this.#cachedChannelToken) return this.#cachedChannelToken;
		const resp = await this.client.channel.approveChannelAndIssueChannelToken({
			channelId: MOA_CHANNEL_ID,
		});
		const token = resp?.channelAccessToken;
		if (!token) {
			throw new InternalError(
				"MoaError",
				"approveChannelAndIssueChannelToken returned no channelAccessToken",
			);
		}
		this.#cachedChannelToken = token;
		return token;
	}

	async #fetch<T extends { code?: number; message?: string }>(
		pathSuffix: string,
		params: Record<string, string | number | undefined>,
		extraHeaders: Record<string, string> = {},
	): Promise<T> {
		const mid = this.client.profile?.mid;
		if (!mid) {
			throw new InternalError(
				"MoaError",
				"client.profile.mid not populated — login must complete before calling Moa",
			);
		}
		const token = await this.getAlbumChannelToken();
		// Moa is JSON REST. The linejs default getHeader("GET") returns
		// accept/content-type application/x-thrift which triggers a
		// {"code":102001,"message":"一時的なエラーが発生しました。"} rejection.
		const headers: Record<string, string> = {
			...this.client.request.getHeader("GET"),
			accept: "application/json",
			"content-type": "application/json; charset=UTF-8",
			"X-Line-ChannelToken": token,
			"X-Line-Mid": mid,
			...extraHeaders,
		};
		const url = buildMoaUrl(this.client.endpoint, pathSuffix, params);
		const res = await this.client.fetch(url, {
			method: "POST",
			headers,
			body: new Uint8Array(),
		});
		if (!res.ok) {
			throw new InternalError(
				"MoaError",
				`Moa ${pathSuffix} HTTP ${res.status}`,
				{ status: res.status },
			);
		}
		const json = (await res.json()) as T;
		if (json.code !== undefined && json.code !== 0) {
			throw new InternalError(
				"MoaError",
				`Moa ${pathSuffix} code=${json.code} message=${json.message}`,
				{ code: json.code, message: json.message },
			);
		}
		return json;
	}

	/**
	 * Get the caller's album list, one page at a time. Pass `cursor` from the
	 * previous response to paginate.
	 */
	getAlbums(
		options: { cursor?: string; orderBy?: string; include?: string } = {},
	): Promise<MoaAlbumsResponse> {
		return this.#fetch<MoaAlbumsResponse>("/moa/v2/albums", {
			cursor: options.cursor ?? "",
			orderBy: options.orderBy ?? "createTimeDesc",
			include: options.include ?? "",
		});
	}

	/**
	 * Get photos inside a specific album (identified by `albumId` in the given
	 * `chatId`). Paginate via `cursor`.
	 */
	getPhotos(options: {
		chatId: string;
		albumId: string | number;
		cursor?: string;
		pageSize?: number;
		orderBy?: string;
		include?: string;
		filterType?: string;
		targetUser?: string;
	}): Promise<AlbumPhotosResponse> {
		return this.#fetch<AlbumPhotosResponse>(
			`/api/v6/albums/${options.albumId}/photos`,
			{
				cursor: options.cursor ?? "",
				pageSize: options.pageSize ?? 100,
				orderBy: options.orderBy ?? "createTimeDesc",
				include: options.include ?? "all",
				filterType: options.filterType ?? "",
				targetUser: options.targetUser,
			},
			{ "X-Line-Chat-Id": options.chatId },
		);
	}

	/**
	 * Download the original bytes of an album photo. Returns the response bytes
	 * so the caller can save them to disk or process them further.
	 *
	 * `prefix` defaults to `"album/a"` (still image). For videos, pass
	 * `"album/v"` (that is what `obsResourceId.sid === "v"` maps to).
	 */
	async downloadPhoto(options: {
		chatId: string;
		albumId: string | number;
		oid: string;
		prefix?: string;
	}): Promise<Uint8Array> {
		const token = await this.getAlbumChannelToken();
		const headers: Record<string, string> = {
			...this.client.request.getHeader("GET"),
			"X-Line-ChannelToken": token,
			"X-Line-Album": String(options.albumId),
			"X-Line-Mid": options.chatId,
		};
		const prefix = options.prefix ?? "album/a";
		const url =
			`https://${this.client.endpoint}/oa/r/${prefix}/${options.oid}`;
		const res = await this.client.fetch(url, {
			method: "POST",
			headers,
			body: new Uint8Array(),
		});
		if (!res.ok) {
			throw new InternalError(
				"MoaError",
				`OBS ${options.oid} HTTP ${res.status}`,
				{ status: res.status },
			);
		}
		return new Uint8Array(await res.arrayBuffer());
	}
}
