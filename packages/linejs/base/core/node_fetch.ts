import type { Fetch } from "../types.ts";

export function isNodeRuntime(): boolean {
	if ("Deno" in globalThis || "Bun" in globalThis) return false;
	return !!(
		globalThis as unknown as {
			process?: { versions?: { node?: string } };
		}
	).process?.versions?.node;
}

/** One dispatcher per client/protocol. Config changes drain the previous pool. */
export function createNodeFetch(allowH2: boolean): (timeout: number) => Promise<Fetch | null> {
	let current:
		| {
				timeout: number;
				agent: { close(): Promise<void> };
				fetch: Fetch;
		  }
		| undefined;
	return async (timeout) => {
		if (!isNodeRuntime()) return null;
		if (!Number.isFinite(timeout) || timeout < 0) {
			throw new RangeError("Node connect timeout must be a finite non-negative number");
		}
		// Use the declared dependency and surface import failures, rather than silently
		// reverting to Node's unrelated ten-second connection timeout.
		const { Agent } = await import("undici");
		if (current?.timeout === timeout) return current.fetch;
		const agent = new Agent({ allowH2, connectTimeout: timeout });
		const fetch: Fetch = (info, init) => {
			// Native Node fetch accepts undici dispatchers and its own Request objects.
			// Using undici.fetch here would reject native Request objects (different brand).
			const options = { ...init, dispatcher: agent };
			return globalThis.fetch(info, options);
		};
		const previous = current;
		current = { timeout, agent, fetch };
		if (previous) void previous.agent.close().catch(() => {});
		return fetch;
	};
}
