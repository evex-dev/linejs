import { assert, test } from "vite-plus/test";
import { BaseClient } from "./mod.ts";
import { createNodeFetch, isNodeRuntime } from "./node_fetch.ts";

test("Node dispatchers are used on Node", async () => {
	assert.deepEqual(isNodeRuntime(), true);
	assert.deepEqual(typeof (await createNodeFetch(false)(30_000)), "function");
	assert.deepEqual(typeof (await createNodeFetch(true)(30_000)), "function");
});

test("custom fetch handles both RPC and PUSH with cancellation intact", async () => {
	const requests: Request[] = [];
	const client = new BaseClient({
		device: "DESKTOPWIN",
		fetch: (info) => {
			requests.push(new Request(info));
			return Promise.resolve(new Response("ok"));
		},
	});
	const controller = new AbortController();
	await client.fetch("https://example.invalid/rpc", {
		signal: controller.signal,
	});
	await client.fetchPush("https://example.invalid/push", {
		signal: controller.signal,
	});
	assert.deepEqual(requests.length, 2);
	controller.abort();
	assert.deepEqual(
		requests.map((r) => r.signal.aborted),
		[true, true],
	);
});
