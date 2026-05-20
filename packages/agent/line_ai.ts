// Native LINE AI ("Agent i" home-tab) REST client.
// All endpoints/methods/bodies pinned from LINE Android 26.6.2 smali
// (smali_classes8/fk2/*, de8/c). Live-verified against
// https://line-x-openai.line-apps.com — see scripts/linejs_smoke/test_lineai.ts.

export const LINE_AI_HOST_RELEASE = "https://line-x-openai.line-apps.com";
export const LINE_AI_HOST_ALPHA = "https://line-x-openai.line-apps-alpha.com";

/** Known valid context-types for {@link LineAiClient.getPromptPresets}. */
export type LineAiPromptContext = "trending" | "image-attached";

/** LINE AI gateway channel id (smali sj2/a;->g()). The `accessToken`
 *  this client takes is the channel-scoped token minted via
 *  `Channel.issueChannelToken({ channelId: LINE_AI_CHANNEL_ID })`,
 *  NOT the user's primary LINE access token. */
export const LINE_AI_CHANNEL_ID = "2006890580";

export interface LineAiOptions {
	/** Channel-scoped token for channel {@link LINE_AI_CHANNEL_ID}. */
	accessToken: string;
	lineVersion: string;
	/** Accept-Language for /prompt-preset (e.g. "ja-JP"). */
	acceptLanguage?: string;
	host?: string;
	fetch?: typeof fetch;
	userAgent?: string;
}

/** POST /v2/query-ai body (smali fk2/a$a$a $$serializer). */
export interface LineAiQueryRequest {
	threadId: string | null;
	message: string;
	imageUrl: string | null;
}

/** One SSE chunk from /v2/query-ai. */
export interface LineAiQueryChunk {
	/** SSE `event:` line (e.g. "run.started", "run.completed"). */
	event?: string;
	/** SSE `data:` parsed as JSON if it looks like JSON, else raw text. */
	data: unknown;
}

/** POST /v2/query-ai/cancel body (smali fk2/b JsonObject builder). */
export interface LineAiCancelQueryRequest {
	threadId: string;
	runId: string;
}

export interface LineAiResponse<T = unknown> {
	status: number;
	rateLimit: { limit?: string; remaining?: string; usage?: string };
	body: T;
}

export class LineAiClient {
	#host: string;
	#accessToken: string;
	#lineVersion: string;
	#acceptLanguage: string;
	#fetch: typeof fetch;
	#userAgent: string;

	constructor(opts: LineAiOptions) {
		this.#host = (opts.host ?? LINE_AI_HOST_RELEASE).replace(/\/+$/, "");
		this.#accessToken = opts.accessToken;
		this.#lineVersion = opts.lineVersion;
		this.#acceptLanguage = opts.acceptLanguage ?? "ja-JP";
		this.#fetch = opts.fetch ?? fetch;
		this.#userAgent = opts.userAgent ??
			`Line/${opts.lineVersion}/LineAi`;
	}

	/** GET /v2/service-info — list of AI services + help URLs. */
	getServiceInfo(): Promise<LineAiResponse> {
		return this.#get("/v2/service-info");
	}

	/** GET /v2/{contextType}/prompt-preset — suggested prompts per context.
	 *  Live-verified context types: "trending", "image-attached" (smali
	 *  zk2/a + zk2/d). The path segment is the context type, NOT a locale
	 *  (server error message confirms parsing). */
	getPromptPresets(opts: {
		contextType: LineAiPromptContext | string;
		acceptLanguage?: string;
	}): Promise<LineAiResponse> {
		return this.#get(`/v2/${encodeURIComponent(opts.contextType)}/prompt-preset`, {
			"Accept-Language": opts.acceptLanguage ?? this.#acceptLanguage,
		});
	}

	/** POST /v2/thread (empty body) — create a new conversation thread. */
	createThread(): Promise<LineAiResponse> {
		return this.#postEmpty("/v2/thread");
	}

	/** GET /v2/thread/{id} — fetch a single thread. */
	getThread(threadId: string): Promise<LineAiResponse> {
		return this.#get(`/v2/thread/${encodeURIComponent(threadId)}`);
	}

	/** DELETE /v2/thread/{id} */
	deleteThread(threadId: string): Promise<LineAiResponse> {
		return this.#req(
			`/v2/thread/${encodeURIComponent(threadId)}`,
			"DELETE",
		);
	}

	/** POST /v2/user/agreement (empty body) — one-time consent. */
	submitAgreement(): Promise<LineAiResponse> {
		return this.#postEmpty("/v2/user/agreement");
	}

	/** POST /v2/query-ai — send a user message; streams SSE chunks back.
	 *  The endpoint REQUIRES `accept: text/event-stream`; sending it as
	 *  plain JSON returns 500 from the upstream. */
	async *query(req: LineAiQueryRequest): AsyncGenerator<LineAiQueryChunk> {
		const res = await this.#fetch(this.#host + "/v2/query-ai", {
			method: "POST",
			headers: this.#headers({
				"content-type": "application/json; charset=utf-8",
				accept: "text/event-stream",
			}),
			body: JSON.stringify(req),
		});
		if (!res.ok || !res.body) {
			const errBody = await res.text();
			throw new Error(`LineAi.query: ${res.status} ${res.statusText} body=${errBody.slice(0, 200)}`);
		}
		yield* parseSseStream(res.body);
	}

	/** POST /v2/query-ai/cancel — cancel an in-flight query. */
	cancelQuery(req: LineAiCancelQueryRequest): Promise<LineAiResponse> {
		return this.#postJson("/v2/query-ai/cancel", req);
	}

	#headers(extra: Record<string, string> = {}): Record<string, string> {
		return {
			accept: "application/json",
			"user-agent": this.#userAgent,
			"X-ACCESS-TOKEN": this.#accessToken,
			"X-LINE-VERSION": this.#lineVersion,
			...extra,
		};
	}

	async #get(path: string, extra?: Record<string, string>): Promise<LineAiResponse> {
		return this.#req(path, "GET", undefined, extra);
	}
	async #postEmpty(path: string): Promise<LineAiResponse> {
		// smali fk2/a.f = RequestBody.create("", "application/json")
		return this.#req(path, "POST", "", {
			"content-type": "application/json; charset=utf-8",
		});
	}
	async #postJson(path: string, body: unknown): Promise<LineAiResponse> {
		return this.#req(path, "POST", JSON.stringify(body), {
			"content-type": "application/json; charset=utf-8",
		});
	}
	async #req(
		path: string,
		method: string,
		body?: string,
		extra?: Record<string, string>,
	): Promise<LineAiResponse> {
		const res = await this.#fetch(this.#host + path, {
			method,
			headers: this.#headers(extra),
			body,
		});
		return await this.#wrap(res);
	}
	async #wrap(res: Response): Promise<LineAiResponse> { return wrapResponse(res); }
}

async function wrapResponse(res: Response): Promise<LineAiResponse> {
		const text = await res.text();
		let parsed: unknown = null;
		if (text) {
			try { parsed = JSON.parse(text); } catch { parsed = text; }
		}
	return {
		status: res.status,
		rateLimit: {
			limit: res.headers.get("x-ratelimit-limit") ?? undefined,
			remaining: res.headers.get("x-ratelimit-remaining") ?? undefined,
			usage: res.headers.get("x-ratelimit-usage") ?? undefined,
		},
		body: parsed,
	};
}

async function* parseSseStream(
	stream: ReadableStream<Uint8Array>,
): AsyncGenerator<LineAiQueryChunk> {
	const reader = stream.pipeThrough(new TextDecoderStream()).getReader();
	let buffer = "";
	try {
		while (true) {
			const { value, done } = await reader.read();
			if (done) break;
			buffer += value;
			let nl: number;
			while ((nl = buffer.indexOf("\n\n")) !== -1) {
				const block = buffer.slice(0, nl);
				buffer = buffer.slice(nl + 2);
				yield parseSseBlock(block);
			}
		}
		if (buffer.trim().length) yield parseSseBlock(buffer);
	} finally {
		reader.releaseLock();
	}
}

function parseSseBlock(block: string): LineAiQueryChunk {
	let event: string | undefined;
	const dataLines: string[] = [];
	for (const line of block.split("\n")) {
		if (line.startsWith("event:")) event = line.slice(6).trim();
		else if (line.startsWith("data:")) dataLines.push(line.slice(5).trim());
	}
	const raw = dataLines.join("\n");
	let data: unknown = raw;
	if (raw) {
		try { data = JSON.parse(raw); } catch { /* keep raw */ }
	}
	return { event, data };
}
