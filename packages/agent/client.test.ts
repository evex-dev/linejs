import { assert, test } from "vite-plus/test";
import { AgentIClient, buildAgentIWebViewUrl, frcodeFor, frtypeFor } from "./client.ts";

test("frcodeFor / frtypeFor — values match LINE Android uk2.a.a", () => {
	assert.deepEqual(frcodeFor("chattab_searchbar"), "line_agenti_chattab_searchbar");
	assert.deepEqual(frtypeFor("chattab_searchbar"), "line_chattab_searchbar");
	assert.deepEqual(frcodeFor("hometab_searchbar"), "line_agenti_hometab_searchbar");
	assert.deepEqual(frtypeFor("hometab_searchbar"), "line_hometab_searchbar");
	assert.deepEqual(frcodeFor("newstab_searchbar"), "line_agenti_newstab_searchbar");
	assert.deepEqual(frtypeFor("newstab_searchbar"), "line_newstab_searchbar");
});

test("buildAgentIWebViewUrl — joins the canonical base with fr/frtype/q", () => {
	const url = buildAgentIWebViewUrl({
		source: "chattab_searchbar",
		query: "こんにちは",
	});
	const u = new URL(url);
	assert.deepEqual(u.origin + u.pathname, "https://search.yahoo.co.jp/chat");
	assert.deepEqual(u.searchParams.get("fr"), "line_agenti_chattab_searchbar");
	assert.deepEqual(u.searchParams.get("frtype"), "line_chattab_searchbar");
	assert.deepEqual(u.searchParams.get("q"), "こんにちは");
});

test("buildAgentIWebViewUrl — omits q when not given, allows baseUrl override", () => {
	const url = buildAgentIWebViewUrl({
		source: "hometab_searchbar",
		baseUrl: "https://example.test/agent",
	});
	const u = new URL(url);
	assert.deepEqual(u.origin + u.pathname, "https://example.test/agent");
	assert.deepEqual(u.searchParams.get("q"), null);
	assert.deepEqual(u.searchParams.get("fr"), "line_agenti_hometab_searchbar");
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

test("AgentIClient — parses SSE chunks and accumulates history", async () => {
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
	assert.deepEqual(collected.join(""), "Hello!");
	assert.deepEqual(client.history.length, 2);
	assert.deepEqual(client.history[0].role, "user");
	assert.deepEqual(client.history[0].contents[0].text, "Hi");
	assert.deepEqual(client.history[1].role, "assistant");
	assert.deepEqual(client.history[1].contents[0].text, "Hello!");
});

test("AgentIClient — empty assistant reply does not pollute history", async () => {
	const client = new AgentIClient({
		cookie: "x=y",
		fetch: makeMockFetch([`event: ping\ndata: {}\n\n`]),
	});
	for await (const _c of client.chat("Hi")) {
		/* drain */
	}
	assert.deepEqual(client.history.length, 1);
	assert.deepEqual(client.history[0].role, "user");
});

test("AgentIClient — raw-string data payloads (non-JSON) round-trip", async () => {
	const client = new AgentIClient({
		cookie: "x=y",
		fetch: makeMockFetch([`data: just a string\n\n`, `data: {"text":"and then json"}\n\n`]),
	});
	const chunks: unknown[] = [];
	for await (const c of client.chat("Hi")) chunks.push(c);
	assert.deepEqual((chunks[0] as { text: string }).text, "just a string");
	assert.deepEqual((chunks[1] as { text: string }).text, "and then json");
});

test("AgentIClient — extracts composite message text object shape", async () => {
	const client = new AgentIClient({
		cookie: "x=y",
		fetch: makeMockFetch([
			`event: message\ndata: {"type":"compositeMessage-delta","value":{"message":{"text":"nested"}}}\n\n`,
		]),
	});
	const chunks = [];
	for await (const c of client.chat("Hi")) chunks.push(c);
	assert.deepEqual((chunks[0] as { text: string }).text, "nested");
});

test("AgentIClient — surfaces server errors with status code", async () => {
	const client = new AgentIClient({
		cookie: "x=y",
		fetch: (() =>
			Promise.resolve(
				new Response(null, { status: 401, statusText: "Unauthorized" }),
			)) as unknown as typeof fetch,
	});
	let err: unknown;
	try {
		for await (const _c of client.chat("Hi")) {
			/* drain */
		}
	} catch (e) {
		err = e;
	}
	assert.isOk(err instanceof Error);
	assert.isOk(/401/.test((err as Error).message));
});

test("AgentIClient — reset clears history", async () => {
	const client = new AgentIClient({
		cookie: "x=y",
		fetch: makeMockFetch([`data: {"text":"ok"}\n\n`]),
	});
	for await (const _c of client.chat("hi")) {
		/* drain */
	}
	assert.isOk(client.history.length > 0);
	client.reset();
	assert.deepEqual(client.history.length, 0);
});

test("AgentIClient — sends the right request shape", async () => {
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
					new ReadableStream({
						start(c) {
							c.close();
						},
					}),
					{ status: 200, headers: { "content-type": "text/event-stream" } },
				),
			);
		}) as unknown as typeof fetch,
	});
	for await (const _c of client.chat("hi")) {
		/* drain */
	}
	assert.deepEqual(capturedUrl, "https://search-agent.yahoo.co.jp/v2/chat");
	const ua = capturedHeaders?.get("user-agent") ?? "";
	assert.isOk(/Line\/26\.7\.0\/Agenti/.test(ua), `UA mismatch: ${ua}`);
	assert.deepEqual(capturedHeaders?.get("cookie"), "B=anon");
	assert.deepEqual(capturedHeaders?.get("accept"), "text/event-stream");
	assert.deepEqual(capturedHeaders?.get("origin"), "https://search.yahoo.co.jp");
	const body = JSON.parse(capturedBody!);
	assert.deepEqual(body.context.agentMode, "multi");
	assert.deepEqual(body.context.frcode, "line_agenti_chattab_searchbar");
	assert.deepEqual(body.context.frtype, "line_chattab_searchbar");
	assert.deepEqual(body.context.requestType, "free_text");
	assert.deepEqual(body.chats[0].role, "user");
	assert.deepEqual(body.chats[0].contents[0].text, "hi");
});

test("AgentIClient — no-cookie option auto-mints anonymous yahoo cookies (#152)", async () => {
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
						"set-cookie": "B=anon-b-value; Path=/; Domain=.yahoo.co.jp, XB=anon-xb-value; Path=/",
					},
				}),
			);
		}
		// SSE POST
		sseCookie = new Headers((init as { headers?: HeadersInit } | undefined)?.headers).get("cookie");
		return Promise.resolve(
			new Response(
				new ReadableStream({
					start(c) {
						c.close();
					},
				}),
				{
					status: 200,
					headers: { "content-type": "text/event-stream" },
				},
			),
		);
	}) as unknown as typeof fetch;
	const client = new AgentIClient({ fetch: fakeFetch });
	for await (const _c of client.chat("hi")) {
		/* drain */
	}
	assert.deepEqual(mintCalled, 1);
	// Both B and XB cookies passed through; comma-separated Set-Cookie
	// merged into a single Cookie header.
	assert.deepEqual(sseCookie, "B=anon-b-value; XB=anon-xb-value");
});

test("AgentIClient.mintAnonymousCookies — public helper round-trips Set-Cookie", async () => {
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
	assert.deepEqual(cookie, "B=anon; XB=anon");
});
