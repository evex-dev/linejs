import { assert, assertEquals } from "@std/assert";
import { getH2EnabledFetchForNode } from "./h2_fetch.ts";

// On Deno (which is what this test runs under), getH2EnabledFetchForNode
// must return null — Deno's native fetch already negotiates h2 via ALPN
// and we explicitly skip the undici detour on non-Node runtimes.
Deno.test("h2_fetch: returns null on Deno", async () => {
	const f = await getH2EnabledFetchForNode();
	assertEquals(f, null);
});

// Cached: invoking twice must not change the answer (and must not race —
// the second call awaits the same Promise).
Deno.test("h2_fetch: lookup is idempotent and stable", async () => {
	const a = await getH2EnabledFetchForNode();
	const b = await getH2EnabledFetchForNode();
	assertEquals(a, b);
	// On Deno both are null; the assertion above already covers that case.
	// If we ever extend the function to also serve a Deno-specific fetch,
	// this test stays meaningful as a stability check.
	assert(a === null || typeof a === "function");
});
