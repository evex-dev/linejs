import { assert, assertEquals } from "@std/assert";
import {
	AgentIClient,
	buildAgentIWebViewUrl,
	frcodeFor,
	frtypeFor,
} from "./client.ts";

Deno.test("frcodeFor / frtypeFor — values match LINE Android uk2.a.a", () => {
	assertEquals(frcodeFor("chattab_searchbar"), "line_agenti_chattab_searchbar");
	assertEquals(frtypeFor("chattab_searchbar"), "line_chattab_searchbar");
	assertEquals(frcodeFor("hometab_searchbar"), "line_agenti_hometab_searchbar");
	assertEquals(frtypeFor("hometab_searchbar"), "line_hometab_searchbar");
	assertEquals(frcodeFor("newstab_searchbar"), "line_agenti_newstab_searchbar");
	assertEquals(frtypeFor("newstab_searchbar"), "line_newstab_searchbar");
});

Deno.test("buildAgentIWebViewUrl — joins the canonical base with fr/frtype/q", () => {
	const url = buildAgentIWebViewUrl({
		source: "chattab_searchbar",
		query: "こんにちは",
	});
	const u = new URL(url);
	assertEquals(u.origin + u.pathname, "https://search.yahoo.co.jp/chat");
	assertEquals(u.searchParams.get("fr"), "line_agenti_chattab_searchbar");
	assertEquals(u.searchParams.get("frtype"), "line_chattab_searchbar");
	assertEquals(u.searchParams.get("q"), "こんにちは");
});

Deno.test("buildAgentIWebViewUrl — omits q when not given, allows baseUrl override", () => {
	const url = buildAgentIWebViewUrl({
		source: "hometab_searchbar",
		baseUrl: "https://example.test/agent",
	});
	const u = new URL(url);
	assertEquals(u.origin + u.pathname, "https://example.test/agent");
	assertEquals(u.searchParams.get("q"), null);
	assertEquals(u.searchParams.get("fr"), "line_agenti_hometab_searchbar");
});

function makeMockFetch(events: string[]): typeof fetch {
	return ((_url: unknown, _init?: unknown) => {
		const stream = new ReadableStream<Uint8Array>({
			start(controller) {
				const enc = new TextEncoder();
				for (const e of events) controller.enqueue(enc.encode(e));
				controller.close();
			},
		});
		return Promise.resolve(
			new Response(stream, {
				status: 200,
				statusText: "OK",
				headers: { "content-type": "text/event-stream" },
			}),
		);
	}) as unknown as typeof fetch;
}

Deno.test("AgentIClient — parses SSE chunks and accumulates history", async () => {
	const client = new AgentIClient({
		cookie: "x=y",
		source: "chattab_searchbar",
		fetch: makeMockFetch([
			`event: message\ndata: {"text":"Hel"}\n\n`,
			`event: message\ndata: {"text":"lo!"}\n\n`,
			`event: done\ndata: {}\n\n`,
		]),
	});
	const collected: string[] = [];
	for await (const c of client.chat("Hi")) {
		if (c.text) collected.push(c.text);
	}
	assertEquals(collected.join(""), "Hello!");
	assertEquals(client.history.length, 2);
	assertEquals(client.history[0].role, "user");
	assertEquals(client.history[0].contents[0].text, "Hi");
	assertEquals(client.history[1].role, "assistant");
	assertEquals(client.history[1].contents[0].text, "Hello!");
});

Deno.test("AgentIClient — empty assistant reply does not pollute history", async () => {
	const client = new AgentIClient({
		cookie: "x=y",
		fetch: makeMockFetch([`event: ping\ndata: {}\n\n`]),
	});
	for await (const _c of client.chat("Hi")) { /* drain */ }
	assertEquals(client.history.length, 1);
	assertEquals(client.history[0].role, "user");
});

Deno.test("AgentIClient — raw-string data payloads (non-JSON) round-trip", async () => {
	const client = new AgentIClient({
		cookie: "x=y",
		fetch: makeMockFetch([
			`data: just a string\n\n`,
			`data: {"text":"and then json"}\n\n`,
		]),
	});
	const chunks: unknown[] = [];
	for await (const c of client.chat("Hi")) chunks.push(c);
	assertEquals((chunks[0] as { text: string }).text, "just a string");
	assertEquals((chunks[1] as { text: string }).text, "and then json");
});

Deno.test("AgentIClient — surfaces server errors with status code", async () => {
	const client = new AgentIClient({
		cookie: "x=y",
		fetch: (() =>
			Promise.resolve(
				new Response(null, { status: 401, statusText: "Unauthorized" }),
			)) as unknown as typeof fetch,
	});
	let err: unknown;
	try {
		for await (const _c of client.chat("Hi")) { /* drain */ }
	} catch (e) {
		err = e;
	}
	assert(err instanceof Error);
	assert(/401/.test((err as Error).message));
});

Deno.test("AgentIClient — reset clears history", async () => {
	const client = new AgentIClient({
		cookie: "x=y",
		fetch: makeMockFetch([`data: {"text":"ok"}\n\n`]),
	});
	for await (const _c of client.chat("hi")) { /* drain */ }
	assert(client.history.length > 0);
	client.reset();
	assertEquals(client.history.length, 0);
});

Deno.test("AgentIClient — sends the right request shape", async () => {
	let capturedUrl: string | undefined;
	let capturedBody: string | undefined;
	let capturedHeaders: Headers | undefined;
	const client = new AgentIClient({
		cookie: "B=anon",
		source: "chattab_searchbar",
		lineVersion: "26.7.0",
		fetch: ((url: unknown, init?: { headers?: HeadersInit; body?: BodyInit }) => {
			capturedUrl = String(url);
			capturedHeaders = new Headers(init?.headers);
			capturedBody = init?.body as string;
			return Promise.resolve(
				new Response(
					new ReadableStream({ start(c) { c.close(); } }),
					{ status: 200, headers: { "content-type": "text/event-stream" } },
				),
			);
		}) as unknown as typeof fetch,
	});
	for await (const _c of client.chat("hi")) { /* drain */ }
	assertEquals(capturedUrl, "https://search-agent.yahoo.co.jp/v2/chat");
	const ua = capturedHeaders?.get("user-agent") ?? "";
	assert(/Line\/26\.7\.0\/Agenti/.test(ua), `UA mismatch: ${ua}`);
	assertEquals(capturedHeaders?.get("cookie"), "B=anon");
	assertEquals(capturedHeaders?.get("accept"), "text/event-stream");
	assertEquals(capturedHeaders?.get("origin"), "https://search.yahoo.co.jp");
	const body = JSON.parse(capturedBody!);
	assertEquals(body.context.agentMode, "multi");
	assertEquals(body.context.frcode, "line_agenti_chattab_searchbar");
	assertEquals(body.context.frtype, "line_chattab_searchbar");
	assertEquals(body.context.requestType, "free_text");
	assertEquals(body.chats[0].role, "user");
	assertEquals(body.chats[0].contents[0].text, "hi");
});

Deno.test("AgentIClient — no-cookie option auto-mints anonymous yahoo cookies (#152)", async () => {
	let mintCalled = 0;
	let sseCookie: string | null = null;
	const fakeFetch = ((url: unknown, init?: { method?: string }) => {
		const u = String(url);
		if (u.includes("search.yahoo.co.jp/chat") && (init?.method ?? "GET") === "GET") {
			mintCalled++;
			return Promise.resolve(
				new Response(null, {
					status: 200,
					headers: {
						"set-cookie":
							"B=anon-b-value; Path=/; Domain=.yahoo.co.jp, XB=anon-xb-value; Path=/",
					},
				}),
			);
		}
		// SSE POST
		sseCookie = new Headers(
			(init as { headers?: HeadersInit } | undefined)?.headers,
		).get("cookie");
		return Promise.resolve(
			new Response(new ReadableStream({ start(c) { c.close(); } }), {
				status: 200,
				headers: { "content-type": "text/event-stream" },
			}),
		);
	}) as unknown as typeof fetch;
	const client = new AgentIClient({ fetch: fakeFetch });
	for await (const _c of client.chat("hi")) { /* drain */ }
	assertEquals(mintCalled, 1);
	// Both B and XB cookies passed through; comma-separated Set-Cookie
	// merged into a single Cookie header.
	assertEquals(sseCookie, "B=anon-b-value; XB=anon-xb-value");
});

Deno.test("AgentIClient.mintAnonymousCookies — public helper round-trips Set-Cookie", async () => {
	const fakeFetch = ((_url: unknown) =>
		Promise.resolve(
			new Response(null, {
				status: 200,
				headers: {
					"set-cookie": "B=anon; Path=/, XB=anon; Path=/",
				},
			}),
		)) as unknown as typeof fetch;
	const cookie = await AgentIClient.mintAnonymousCookies({ fetch: fakeFetch });
	assertEquals(cookie, "B=anon; XB=anon");
});
