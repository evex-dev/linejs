// Run with Node >= 22.18 after `pnpm install`: node scripts/test_node_transport.mts
import { test } from "node:test";
import assert from "node:assert/strict";
import net from "node:net";
import { once } from "node:events";
import { createNodeFetch } from "../packages/linejs/base/core/node_fetch.ts";

for (const allowH2 of [false, true]) {
	test(`Node ${allowH2 ? "PUSH" : "RPC"} honors connect timeout and later config changes`, async () => {
		const sockets = new Set<net.Socket>();
		// Accept TCP without completing TLS: deterministic connection timeout.
		const server = net.createServer((socket) => {
			sockets.add(socket);
			socket.on("error", () => {});
			socket.on("close", () => sockets.delete(socket));
		});
		server.listen(0, "127.0.0.1");
		await once(server, "listening");
		try {
			const address = server.address() as net.AddressInfo;
			const url = `https://127.0.0.1:${address.port}`;
			const getFetch = createNodeFetch(allowH2);
			const short = (await getFetch(50))!;
			assert.equal(await getFetch(50), short);
			await assert.rejects(short(new Request(url)), (err: unknown) => {
				assert.equal(
					(err as { cause?: { code?: string } }).cause?.code,
					"UND_ERR_CONNECT_TIMEOUT",
				);
				return true;
			});
			const longer = (await getFetch(30_000))!;
			assert.notEqual(longer, short);
			const controller = new AbortController();
			const timer = setTimeout(() => controller.abort(), 200);
			try {
				await assert.rejects(
					longer(new Request(url, { signal: controller.signal })),
					{ name: "AbortError" },
				);
			} finally {
				clearTimeout(timer);
			}
			await assert.rejects(getFetch(-1), RangeError);
		} finally {
			for (const socket of sockets) socket.destroy();
			await new Promise<void>((resolve) => server.close(() => resolve()));
		}
	});
}
