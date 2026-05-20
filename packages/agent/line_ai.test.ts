import { assertEquals } from "@std/assert";
import { LineAiClient, LineAiEndpoints } from "./line_ai.ts";

function mockFetch(): {
	fetch: typeof fetch;
	calls: { url: string; method: string; headers: Record<string, string>; body: string | null }[];
	next: (body: unknown, headers?: Record<string, string>, status?: number) => void;
} {
	const calls: {
		url: string;
		method: string;
		headers: Record<string, string>;
		body: string | null;
	}[] = [];
	let nextBody: unknown = { ok: true };
	let nextHeaders: Record<string, string> = {};
	let nextStatus = 200;
	const fakeFetch = ((url: unknown, init?: RequestInit) => {
		const hdrs: Record<string, string> = {};
		new Headers(init?.headers).forEach((v, k) => { hdrs[k] = v; });
		calls.push({
			url: String(url),
			method: init?.method ?? "GET",
			headers: hdrs,
			body: (init?.body as string | null) ?? null,
		});
		return Promise.resolve(
			new Response(JSON.stringify(nextBody), {
				status: nextStatus,
				headers: {
					"content-type": "application/json",
					...nextHeaders,
				},
			}),
		);
	}) as unknown as typeof fetch;
	return {
		fetch: fakeFetch,
		calls,
		next(body, headers = {}, status = 200) {
			nextBody = body;
			nextHeaders = headers;
			nextStatus = status;
		},
	};
}

Deno.test("LineAiClient — defaults to release host from smali", async () => {
	const m = mockFetch();
	const c = new LineAiClient({
		accessToken: "tok",
		lineVersion: "26.6.2",
		fetch: m.fetch,
	});
	await c.getServiceInfo();
	assertEquals(m.calls[0].url, "https://line-x-openai.line-apps.com/v2/service-info");
});

Deno.test("LineAiClient.query — POST /v2/query-ai with X-ACCESS-TOKEN + X-LINE-VERSION", async () => {
	const m = mockFetch();
	const c = new LineAiClient({
		host: "https://ai-gw.example",
		accessToken: "tok-xyz",
		lineVersion: "26.6.2",
		fetch: m.fetch,
	});
	m.next({ runId: "RUN-1", text: "hi" }, {
		"x-ratelimit-limit": "100",
		"x-ratelimit-remaining": "99",
		"x-ratelimit-usage": "1",
	});
	const r = await c.query({ message: "hello", threadId: null, imageUrl: null });
	assertEquals(m.calls[0].url, "https://ai-gw.example/v2/query-ai");
	assertEquals(m.calls[0].method, "POST");
	assertEquals(m.calls[0].headers["x-access-token"], "tok-xyz");
	assertEquals(m.calls[0].headers["x-line-version"], "26.6.2");
	const body = JSON.parse(m.calls[0].body!);
	assertEquals(body.message, "hello");
	assertEquals(body.threadId, null);
	assertEquals(body.imageUrl, null);
	assertEquals(r.rateLimit.remaining, "99");
	assertEquals(typeof r.body, "object");
});

Deno.test("LineAiClient.getThread — GET /v2/thread/<id>", async () => {
	const m = mockFetch();
	const c = new LineAiClient({
		host: "https://ai-gw.example",
		accessToken: "tok",
		lineVersion: "26.6.2",
		fetch: m.fetch,
	});
	await c.getThread("THREAD/abc?foo");
	assertEquals(m.calls[0].url, "https://ai-gw.example/v2/thread/THREAD%2Fabc%3Ffoo");
	assertEquals(m.calls[0].method, "GET");
});

Deno.test("LineAiClient — endpoint catalog matches smali (#157)", () => {
	assertEquals(LineAiEndpoints.query, "/v2/query-ai");
	assertEquals(LineAiEndpoints.cancelQuery, "/v2/query-ai/cancel");
	assertEquals(LineAiEndpoints.serviceInfo, "/v2/service-info");
	assertEquals(LineAiEndpoints.threadList, "/v2/thread");
	assertEquals(LineAiEndpoints.userAgreement, "/v2/user/agreement");
	assertEquals(LineAiEndpoints.promptPreset, "/prompt-preset");
});
