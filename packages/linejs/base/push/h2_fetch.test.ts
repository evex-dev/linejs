import { assert, test } from "vite-plus/test";
import { getH2EnabledFetchForNode } from "./h2_fetch.ts";

// Under Node, getH2EnabledFetchForNode must return an undici-backed fetch so
// the client can negotiate HTTP/2 instead of relying on the native dispatcher.
test("h2_fetch: returns a fetch on Node", async () => {
	const f = await getH2EnabledFetchForNode();
	assert.deepEqual(typeof f, "function");
});

// Cached: invoking twice must not change the answer (and must not race —
// the second call awaits the same Promise).
test("h2_fetch: lookup is idempotent and stable", async () => {
	const a = await getH2EnabledFetchForNode();
	const b = await getH2EnabledFetchForNode();
	assert.deepEqual(a, b);
	assert.isOk(a === null || typeof a === "function");
});
