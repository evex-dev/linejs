/**
 * VOOM (timeline / myhome) REST helpers.
 *
 * VOOM lives on a separate REST gateway under
 * `https://gw.line.naver.jp/mh/api/v{34,40,52,57}/...` rather than the
 * Thrift binary protocol used by Talk/Square.  Confirmed dynamically
 * against LINE 26.6.2 — every documented path returns JSON envelopes
 * of the form `{ code, message, result }`.
 *
 * **Auth status (provisional, see evex-dev/linejs#151):** the gateway
 * rejects the raw `X-Line-Access` primaryToken with `code: 401
 * "Renewing user verification..."`.  It expects a channel-scoped token
 * for the TIMELINE channel (id `1341209950`), which on DESKTOPWIN
 * cannot be minted via `Channel.issueChannelToken` — that returns
 * `ILLEGAL_ARGUMENT: invalid channelId`.  ANDROID-typed clients may
 * succeed; this helper exposes the wire shape so callers who *can*
 * mint the right token can drive the gateway.
 *
 * Source of truth:
 *   `decompiled/base/smali/smali/t98/a$b.smali`  — channel id enum
 *   gateway base path family confirmed by live HTTP probing.
 */
import type { Client } from "../mod.ts";

/** Channel-id constants for LINE's MH-family services. */
export const VoomChannelId = {
	TIMELINE: "1341209950",
	HOME: "1341209850",
	HOME26: "2007835442",
	NOTE: "1655599932",
	SQUARE_NOTE: "1657618623",
	ALBUM: "1375220249",
} as const;

export interface VoomRestOptions {
	/** Path under `/mh/api/`, leading slash included. */
	path: string;
	method?: "GET" | "POST" | "PUT" | "DELETE";
	body?: unknown;
	/** Override the channel token used in `X-Line-ChannelToken`.  When
	 *  unset, falls back to the client's primaryToken in `X-Line-Access`
	 *  (which currently 401s on the MH gateway — see #151). */
	channelToken?: string;
	/** Additional headers to send. */
	extraHeaders?: Record<string, string>;
	/** Override the gateway hostname. */
	host?: string;
}

export interface VoomRestResponse<T = unknown> {
	code: number;
	message?: string;
	result: T | null;
}

/**
 * Low-level VOOM REST call.  Hands you the JSON envelope verbatim so
 * you can iterate against the gateway while we sort out the auth
 * story (#151).
 */
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
		"x-line-access": client.authToken,
		...(opts.channelToken
			? { "X-Line-ChannelToken": opts.channelToken }
			: {}),
		...(opts.extraHeaders ?? {}),
	};
	if (opts.body !== undefined) headers["content-type"] = "application/json";

	const res = await client.base.fetch(url, {
		method,
		headers,
		body: opts.body === undefined ? undefined : JSON.stringify(opts.body),
	});
	const json = await res.json() as VoomRestResponse<T>;
	return json;
}
