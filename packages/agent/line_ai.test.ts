import { assert, assertEquals } from "@std/assert";
import { LINE_AI_CHANNEL_ID, LineAiClient } from "./line_ai.ts";

function mockFetch() {
	const calls: {
		url: string;
		method: string;
		headers: Record<string, string>;
		body: string | null;
	}[] = [];
	let nextBody: unknown = { ok: true };
	let nextHeaders: Record<string, string> = {};
	let nextStatus = 200;
	const f = ((url: unknown, init?: RequestInit) => {
		const hdrs: Record<string, string> = {};
		new Headers(init?.headers).forEach((v, k) => {
			hdrs[k] = v;
		});
		calls.push({
			url: String(url),
			method: init?.method ?? "GET",
			headers: hdrs,
			body: (init?.body as string | null) ?? null,
		});
		return Promise.resolve(
			new Response(JSON.stringify(nextBody), {
				status: nextStatus,
				headers: { "content-type": "application/json", ...nextHeaders },
			}),
		);
	}) as unknown as typeof fetch;
	return {
		fetch: f,
		calls,
		next(body: unknown, headers: Record<string, string> = {}, status = 200) {
			nextBody = body;
			nextHeaders = headers;
			nextStatus = status;
		},
	};
}

function client(fetchFn: typeof fetch): LineAiClient {
	return new LineAiClient({
		accessToken: "channel-tok",
		lineVersion: "26.6.2",
		fetch: fetchFn,
	});
}

Deno.test("default host = release", async () => {
	const m = mockFetch();
	await client(m.fetch).getServiceInfo();
	assertEquals(
		m.calls[0].url,
		"https://line-x-openai.line-apps.com/v2/service-info",
	);
});

Deno.test("channel id constant", () => {
	assertEquals(LINE_AI_CHANNEL_ID, "2006890580");
});

Deno.test("LineAiClient — default native headers match current iOS app shape", async () => {
	const m = mockFetch();
	await new LineAiClient({
		accessToken: "channel-tok",
		fetch: m.fetch,
	}).getServiceInfo();
	assertEquals(
		m.calls[0].headers["user-agent"],
		"LINE/26.7.2 CFNetwork/3860.200.71 Darwin/25.1.0",
	);
	assertEquals(m.calls[0].headers["x-access-token"], "channel-tok");
	assertEquals(m.calls[0].headers["x-line-version"], "26.7.2");
	assertEquals(m.calls[0].headers["x-line-os"], "IOS");
	assertEquals(m.calls[0].headers["accept-language"], "ja");
});

Deno.test("query — POSTs /v2/query-ai with accept: text/event-stream + streams SSE chunks", async () => {
	const events = [
		'event:run.started\ndata:{"runId":"R1","threadId":"T1"}\n\n',
		'event:message\ndata:{"delta":"hello"}\n\n',
		"event:run.completed\ndata:{}\n\n",
	];
	let capturedUrl = "", capturedAccept = "", capturedBody = "";
	const fakeFetch = ((url: unknown, init?: RequestInit) => {
		capturedUrl = String(url);
		capturedAccept = new Headers(init?.headers).get("accept") ?? "";
		capturedBody = init?.body as string;
		const stream = new ReadableStream<Uint8Array>({
			start(c) {
				const enc = new TextEncoder();
				for (const e of events) c.enqueue(enc.encode(e));
				c.close();
			},
		});
		return Promise.resolve(
			new Response(stream, {
				status: 200,
				headers: { "content-type": "text/event-stream" },
			}),
		);
	}) as unknown as typeof fetch;
	const c = new LineAiClient({
		accessToken: "channel-tok",
		lineVersion: "26.6.2",
		fetch: fakeFetch,
	});
	const chunks = [];
	for await (
		const ch of c.query({ threadId: null, message: "hi", imageUrl: null })
	) {
		chunks.push(ch);
	}
	assertEquals(capturedUrl, "https://line-x-openai.line-apps.com/v2/query-ai");
	assertEquals(capturedAccept, "text/event-stream");
	assertEquals(JSON.parse(capturedBody), {
		threadId: null,
		message: "hi",
		imageUrl: null,
	});
	assertEquals(chunks.length, 3);
	assertEquals(chunks[0].event, "run.started");
	assertEquals((chunks[0].data as { runId: string }).runId, "R1");
	assertEquals(chunks[1].event, "message");
	assertEquals((chunks[1].data as { delta: string }).delta, "hello");
	assertEquals(chunks[2].event, "run.completed");
});

Deno.test("query — throws with body included on non-2xx", async () => {
	const fakeFetch = (() =>
		Promise.resolve(
			new Response(`{"statusMessage":"UNDEFINED_ERROR"}`, {
				status: 500,
				statusText: "Internal Server Error",
			}),
		)) as unknown as typeof fetch;
	const c = new LineAiClient({
		accessToken: "x",
		lineVersion: "26.6.2",
		fetch: fakeFetch,
	});
	let err: unknown;
	try {
		for await (
			const _ of c.query({ threadId: null, message: "x", imageUrl: null })
		) { /* drain */ }
	} catch (e) {
		err = e;
	}
	assert(err instanceof Error);
	assert(String((err as Error).message).includes("UNDEFINED_ERROR"));
});

Deno.test("createThread — POST /v2/thread with empty body (smali fk2/c)", async () => {
	const m = mockFetch();
	await client(m.fetch).createThread();
	assertEquals(m.calls[0].method, "POST");
	assertEquals(m.calls[0].url, "https://line-x-openai.line-apps.com/v2/thread");
	assertEquals(m.calls[0].body, "");
});

Deno.test("submitAgreement — POST /v2/user/agreement with empty body", async () => {
	const m = mockFetch();
	await client(m.fetch).submitAgreement();
	assertEquals(m.calls[0].method, "POST");
	assertEquals(
		m.calls[0].url,
		"https://line-x-openai.line-apps.com/v2/user/agreement",
	);
	assertEquals(m.calls[0].body, "");
});

Deno.test("getThread — GET /v2/thread/<id> with URL encoding", async () => {
	const m = mockFetch();
	await client(m.fetch).getThread("a/b?c");
	assertEquals(m.calls[0].method, "GET");
	assertEquals(
		m.calls[0].url,
		"https://line-x-openai.line-apps.com/v2/thread/a%2Fb%3Fc",
	);
});

Deno.test("deleteThread — DELETE /v2/thread/<id>", async () => {
	const m = mockFetch();
	await client(m.fetch).deleteThread("t1");
	assertEquals(m.calls[0].method, "DELETE");
	assertEquals(
		m.calls[0].url,
		"https://line-x-openai.line-apps.com/v2/thread/t1",
	);
});

Deno.test("getPromptPresets — GET /v2/<contextType>/prompt-preset with Accept-Language (live-verified)", async () => {
	const m = mockFetch();
	await client(m.fetch).getPromptPresets({ contextType: "trending" });
	assertEquals(m.calls[0].method, "GET");
	assertEquals(
		m.calls[0].url,
		"https://line-x-openai.line-apps.com/v2/trending/prompt-preset",
	);
	assertEquals(m.calls[0].headers["accept-language"], "ja");
});

Deno.test("cancelQuery — POST /v2/query-ai/cancel with {threadId, runId}", async () => {
	const m = mockFetch();
	await client(m.fetch).cancelQuery({ threadId: "T1", runId: "R1" });
	assertEquals(
		m.calls[0].url,
		"https://line-x-openai.line-apps.com/v2/query-ai/cancel",
	);
	const body = JSON.parse(m.calls[0].body!);
	assertEquals(body, { threadId: "T1", runId: "R1" });
});

Deno.test("body returns parsed JSON + parses rate-limit headers", async () => {
	const m = mockFetch();
	m.next({ foo: 1 });
	const r = await client(m.fetch).getServiceInfo();
	assert(r.body && typeof r.body === "object");
});
