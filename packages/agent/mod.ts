/**
 * `@evex/linejs-agent` — a faithful client for LINE Android's **"Agent I"**
 * (エージェント アイ) feature, the in-app AI agent surfaced from the chat-tab
 * search bar.
 *
 * Agent I in LINE Android (verified by reverse-engineering 26.6.2,
 * `com.linecorp.line.ai.agent` / `uk2.a` / `km2.a`) is *not* a LINE
 * Thrift RPC — it is Yahoo's **search-agent** product, opened by LINE in
 * a WebView at `https://search.yahoo.co.jp/chat?...`.  The page in turn
 * streams responses from `https://search-agent.yahoo.co.jp/v2/chat`
 * over Server-Sent Events.  This package wraps *exactly* that — same
 * URL, same body shape, same `fr` / `frtype` codes — so a linejs user
 * can drive Agent I from outside the LINE app provided they hold a
 * valid Yahoo session.
 *
 * Auth (provisional, **see issue evex-dev/linejs#152**): the SSE
 * endpoint expects a `Cookie` header.  The original capture that
 * seeded this work had `B` / `XB` / `A` / `XA` placeholders, but
 * **LINE Android itself can use Agent I without the user logging
 * into Yahoo**, which means the real auth shape is something
 * lighter than a full Yahoo login session — possibly anonymous
 * `B` / `XB` cookies issued by `search.yahoo.co.jp` on first GET,
 * possibly origin/referer alone, possibly a LINE-side handshake.
 * This client accepts any `cookie` string the caller can mint; until
 * #152 nails down the exact requirement, the simplest working
 * approach is to hit `https://search.yahoo.co.jp/chat` first to let
 * Yahoo set the anonymous cookies, then pass them in here.
 *
 * Source of truth: LINE Android 26.6.2 — see
 *   `decompiled/base/smali/smali_classes8/km2/a.smali`        (URL builder)
 *   `decompiled/base/smali/smali_classes8/uk2/a.smali`        (fr/frtype assembly)
 *   `decompiled/base/smali/smali_classes11/ni4/d$a.smali`     (frtype enum)
 *   `decompiled/base/smali/smali/fk4/c.smali`                 (server config)
 * in the EdamAme-x/android-reverse workspace.
 *
 * @example
 *   import { AgentIClient } from "@evex/linejs-agent";
 *   const agent = new AgentIClient({
 *     cookie: cookies, // see #152 — Yahoo anonymous cookies usually suffice
 *     lineVersion: "26.6.0",
 *     source: "chattab_searchbar",
 *   });
 *   for await (const chunk of agent.chat("やあ！")) {
 *     process.stdout.write(chunk.text ?? "");
 *   }
 */
export { AgentIClient, type AgentIOptions, type AgentIChunk } from "./client.ts";
export {
	type AgentISource,
	type AgentRole,
	buildAgentIWebViewUrl,
	frcodeFor,
	frtypeFor,
} from "./client.ts";
export {
	LINE_AI_CHANNEL_ID,
	LINE_AI_HOST_ALPHA,
	LINE_AI_HOST_RELEASE,
	LineAiClient,
	type LineAiCancelQueryRequest,
	type LineAiOptions,
	type LineAiPromptContext,
	type LineAiQueryChunk,
	type LineAiQueryRequest,
	type LineAiResponse,
} from "./line_ai.ts";
