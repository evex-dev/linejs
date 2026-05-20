/**
 * `@evex/linejs-agent` — a faithful client for LINE Android's **"Agent I"**
 * (アゲンティ) feature, the in-app AI agent surfaced from the chat-tab
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
 * Auth: the SSE endpoint requires Yahoo session cookies (`B`, `XB`,
 * `A`, `XA`).  LINE Android does not mint these — they come from
 * Yahoo's own auth (a separate Yahoo Japan login).  This library
 * accepts them as a `cookie` string; it makes no attempt to obtain
 * them on the caller's behalf.
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
 *     cookie: yahooSessionCookies, // "B=...; XB=...; A=...; XA=..."
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
