/**
 * VOOM (timeline / myhome) REST helpers.
 *
 * VOOM lives on a separate REST gateway under
 * `https://gw.line.naver.jp/mh/api/v{34,40,52,57}/...` rather than the
 * Thrift binary protocol used by Talk/Square.  Confirmed dynamically
 * against LINE 26.6.2 — every documented path returns JSON envelopes
 * of the form `{ code, message, result }`.
 *
 * **Auth (live-verified):** the gateway expects a channel-scoped
 * token sent as `Authorization: Bearer <token>`, plus `X-Line-Mid`.
 * Mint the channel token with
 * `client.base.channel.issueChannelToken({ channelId })` — the wrapper
 * takes an **object**, not a positional string (the JSON Thrift
 * codegen emits `{ channelId }`; passing a string yields
 * `ILLEGAL_ARGUMENT: invalid channelId. channelid: "null"`).
 *
 * `DESKTOPWIN` device type cannot create QR-login sessions, but
 * **`ANDROIDSECONDARY`** can (verified) and successfully mints
 * channel tokens for TIMELINE / HOME / HOME26 / NOTE / SQUARE_NOTE /
 * ALBUM.  After moving from `X-Line-Access` to `Authorization: Bearer
 * <channelToken>` the gateway moves from `code:401 "Renewing user
 * verification..."` to `code:504` (temporary downstream error) —
 * meaning the auth surface is now correct but the upstream "myhome"
 * service still doesn't deliver from this client context.  The
 * remaining 504 is tracked in #151.
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

	// MH gateway auth shape (live-verified against LINE 26.6.2):
	//   - `Authorization: Bearer <channelToken>` — the channel-scoped
	//     OAuth-style token minted via Channel.issueChannelToken.  The
	//     RPC wrapper takes `{ channelId: "..." }` (object), NOT a
	//     positional string — passing a string yields `ILLEGAL_ARGUMENT:
	//     invalid channelId. channelid: "null"`.
	//   - `X-Line-Mid: <mid>` — the account's own mid; without this the
	//     gateway returns `code:405 "No results were found for the
	//     requested user information."`.
	//   - `X-Line-Application` and a Line/<ver> UA — kept for consistency
	//     with LINE Android's traffic shape.
	//
	// Channel tokens are minted per channel — TIMELINE / HOME / NOTE /
	// SQUARE_NOTE / ALBUM, see `VoomChannelId`.  Mint with:
	//   client.base.channel.issueChannelToken({ channelId: VoomChannelId.TIMELINE })
	const headers: Record<string, string> = {
		accept: "application/json",
		"x-line-application": client.base.request.systemType,
		"user-agent": client.base.request.userAgent,
		"X-Line-Mid": client.base.profile?.mid ?? "",
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
	const json = await res.json() as VoomRestResponse<T>;
	return json;
}
