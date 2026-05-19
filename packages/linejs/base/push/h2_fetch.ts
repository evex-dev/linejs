/**
 * @description Provide an HTTP/2-capable fetch for the LINE push endpoint on
 * Node.js, without affecting the user's global fetch or BaseClient's
 * normal RPC fetch.
 *
 * **Why this exists.** LINE's push endpoint serves bidirectional streaming
 * over HTTP/2. The browser's native fetch, Deno's fetch, and Bun's fetch
 * all negotiate h2 via TLS ALPN automatically. **Node.js's native fetch
 * does not** — its bundled undici client defaults to HTTP/1.1 unless an
 * h2-enabled Agent is installed as the dispatcher. Without that, the push
 * subscription appears to connect but the server never starts the stream
 * and consumers hang.
 *
 * Historically this was worked around in user code:
 *
 *     // example/node/allow_h2_for_push.ts
 *     undici.setGlobalDispatcher(new undici.Agent({ allowH2: true }));
 *
 * That works but mutates the user's global fetch dispatcher, which is
 * intrusive. This module replaces that pattern with a scoped solution: we
 * lazily import undici only on Node, build an h2-enabled Agent, and
 * expose a fetch wrapped to use that dispatcher per request. The push
 * connection picks this up automatically; nothing else in the user's
 * program is affected.
 *
 * **Runtime gates.**
 *
 *   - Deno / Bun / browser: native fetch already does h2 — we return null
 *     and the caller falls back to client.fetch.
 *   - Node without undici reachable: we return null. Push will degrade to
 *     h1 (same as before) — the install just isn't fully fixed for that
 *     user. They can either `npm i undici`, or pass a custom fetch to
 *     BaseClient that already enables h2.
 */
import type { Fetch } from "../types.ts";

let cached: Promise<Fetch | null> | null = null;

function isNodeRuntime(): boolean {
	if (typeof globalThis === "undefined") return false;
	// Bun and Deno both set globals; checking those first avoids false
	// positives on Bun, which exposes process.versions.node for compatibility.
	if ("Bun" in globalThis) return false;
	if ("Deno" in globalThis) return false;
	const p = (globalThis as unknown as { process?: { versions?: { node?: string } } }).process;
	return !!p?.versions?.node;
}

/** Returns an h2-capable fetch for Node, or null on every other runtime
 *  (or on Node if undici can't be loaded). The result is cached for the
 *  lifetime of the process; the Agent it wires up keeps an h2 connection
 *  pool alive across push reconnects, which matches what the user code
 *  in `example/node/allow_h2_for_push.ts` was doing with the global
 *  dispatcher. */
export function getH2EnabledFetchForNode(): Promise<Fetch | null> {
	if (!isNodeRuntime()) return Promise.resolve(null);
	if (cached) return cached;
	cached = (async () => {
		try {
			// Dynamic import keeps undici out of the Deno/browser bundle and
			// only pulls it in if push is actually used on Node.
			const undici = await import("undici");
			// We treat undici's surface as `unknown` and re-narrow because
			// its Response/Request types diverge from the global Web ones
			// (e.g. undici@7's Response lacks the WHATWG `bytes()` method
			// declared in Deno's lib.deno.fetch.d.ts). The push consumer
			// only ever reads `.body`, which both shapes implement.
			const u = undici as unknown as {
				Agent: new (opts: { allowH2: boolean }) => unknown;
				fetch: (
					input: unknown,
					init?: Record<string, unknown>,
				) => Promise<unknown>;
			};
			const agent = new u.Agent({ allowH2: true });
			const wrap: Fetch = (info, init) =>
				u.fetch(info, {
					...(init as Record<string, unknown> | undefined),
					dispatcher: agent,
				}) as unknown as Promise<Response>;
			return wrap;
		} catch {
			return null;
		}
	})();
	return cached;
}
