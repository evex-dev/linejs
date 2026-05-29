/**
 * LINE Android "Agent I" client — wraps Yahoo's search-agent SSE
 * endpoint with the exact URL / body / header shape LINE Android
 * emits.  See `./mod.ts` for the reverse-engineering provenance.
 */

/** Source identifier for the Agent I invocation.  Matches the
 *  values in LINE Android's `ni4.d$a` enum: each maps to the tab the
 *  user opened Agent I from. */
export type AgentISource =
	| "chattab_searchbar"
	| "hometab_searchbar"
	| "newstab_searchbar";

export type AgentRole = "user" | "assistant";

/** Build the URL LINE Android loads in its WebView when the user taps
 *  Agent I.  Mirrors `uk2.a.a(frBase, query)` joined with the base URL
 *  from `km2.a.a(ctx)` (= `https://search.yahoo.co.jp/chat`).
 *
 *  The returned URL is what gets passed to `WebView.loadUrl`; the page
 *  at that URL handles auth and SSE itself.  Outside of LINE you'd
 *  typically use {@link AgentIClient} instead to talk to the SSE
 *  backend directly. */
export function buildAgentIWebViewUrl(opts: {
	source: AgentISource;
	query?: string;
	/** Override the base URL.  Defaults to release-channel value. */
	baseUrl?: string;
}): string {
	const base = opts.baseUrl ?? "https://search.yahoo.co.jp/chat";
	const u = new URL(base);
	u.searchParams.set("fr", frcodeFor(opts.source));
	u.searchParams.set("frtype", frtypeFor(opts.source));
	if (opts.query !== undefined) u.searchParams.set("q", opts.query);
	return u.toString();
}

/** `frcode` value LINE Android sends to identify the Agent I traffic
 *  origin.  Matches the concatenation done in `uk2.a.a`:
 *  `"line_agenti_" + sourceName`. */
export function frcodeFor(source: AgentISource): string {
	return `line_agenti_${source}`;
}

/** `frtype` value LINE Android sends.  `"line_" + sourceName` per
 *  `uk2.a.a`. */
export function frtypeFor(source: AgentISource): string {
	return `line_${source}`;
}

export interface AgentIOptions {
	/** Optional; auto-mints anonymous yahoo cookies if omitted. */
	cookie?: string;
	/** LINE app version reported in the `Line/<ver>/Agenti` UA suffix.
	 *  Defaults to a recent value from the LINE iOS captures used to
	 *  derive this shape; bump when LINE bumps. */
	lineVersion?: string;
	/** Which tab the request claims to originate from.  Defaults to
	 *  `chattab_searchbar` (the canonical Agent I source). */
	source?: AgentISource;
	/** Override the SSE endpoint.  Defaults to
	 *  `https://search-agent.yahoo.co.jp/v2/chat`. */
	endpoint?: string;
	/** Override the `fetch` impl (test injection). */
	fetch?: typeof fetch;
	/** UA string overrider.  If unset, builds the iOS-shaped UA Yahoo's
	 *  service expects.  Override if you're driving Agent I from a
	 *  different platform fixture. */
	userAgent?: string;
}

/** Single SSE chunk yielded by {@link AgentIClient.chat}.  The exact
 *  field set depends on what Yahoo's stream emits per event; the most
 *  common payload is text-delta on `event:message`. */
export interface AgentIChunk {
	/** SSE `event:` line, if present. */
	event?: string;
	/** SSE `data:` payload parsed as JSON if it looks like JSON,
	 *  otherwise the raw text. */
	data: unknown;
	/** Convenience: the text delta extracted from common payload shapes,
	 *  if we can find one.  null when the chunk carries non-text data. */
	text: string | null;
}

interface ChatMessage {
	id: string;
	role: AgentRole;
	contents: { type: "text"; text: string }[];
}

/** Generates a 32-hex-char id matching the shape Agent I uses for
 *  per-chat and per-request identifiers. */
function randomId32(): string {
	const bytes = new Uint8Array(16);
	crypto.getRandomValues(bytes);
	return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

/** Faithful client of LINE Android's Agent I (Yahoo search-agent /v2/chat
 *  SSE endpoint). */
export class AgentIClient {
	#opts:
		& Required<
			Omit<AgentIOptions, "fetch" | "userAgent">
		>
		& { fetch: typeof fetch; userAgent: string };
	/** Conversation `chats` accumulator — Agent I expects every turn to
	 *  echo the prior turns.  Reset via {@link reset}. */
	#history: ChatMessage[] = [];

	constructor(opts: AgentIOptions = {}) {
		const lineVersion = opts.lineVersion ?? "26.7.2";
		this.#opts = {
			cookie: opts.cookie ?? "",
			lineVersion,
			source: opts.source ?? "chattab_searchbar",
			endpoint: opts.endpoint ?? "https://search-agent.yahoo.co.jp/v2/chat",
			fetch: opts.fetch ?? fetch,
			userAgent: opts.userAgent ??
				`Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) ` +
					`AppleWebKit/605.1.15 (KHTML, like Gecko) Line/${lineVersion}/Agenti`,
		};
	}

	/** Send a single user message; yields SSE chunks as they arrive.
	 *  The user message is also appended to the local history so the
	 *  next call carries it as context — Agent I is a multi-turn agent. */
	async *chat(
		userText: string,
		extra?: { logid?: string; qId?: string },
	): AsyncGenerator<AgentIChunk> {
		const turn: ChatMessage = {
			id: randomId32(),
			role: "user",
			contents: [{ type: "text", text: userText }],
		};
		this.#history.push(turn);

		const body = {
			chats: this.#history,
			context: {
				agentMode: "multi",
				logid: extra?.logid ?? randomId32(),
				qId: extra?.qId ?? randomId32(),
				snc: true,
				frtype: frtypeFor(this.#opts.source),
				frcode: frcodeFor(this.#opts.source),
				requestType: "free_text",
				index: 0,
				yz: false,
				pdis: false,
			},
			debug: {},
		};

		if (!this.#opts.cookie) {
			this.#opts.cookie = await AgentIClient.mintAnonymousCookies({
				fetch: this.#opts.fetch,
				source: this.#opts.source,
			});
		}
		const res = await this.#opts.fetch(this.#opts.endpoint, {
			method: "POST",
			headers: {
				"user-agent": this.#opts.userAgent,
				accept: "text/event-stream",
				"content-type": "application/json",
				pragma: "no-cache",
				"cache-control": "no-cache",
				"sec-fetch-site": "same-site",
				"sec-fetch-mode": "cors",
				"sec-fetch-dest": "empty",
				"accept-language": "ja",
				origin: "https://search.yahoo.co.jp",
				referer: "https://search.yahoo.co.jp/",
				priority: "u=3, i",
				cookie: this.#opts.cookie,
			},
			body: JSON.stringify(body),
		});
		if (!res.ok || !res.body) {
			throw new Error(
				`Agent I: ${res.status} ${res.statusText} (no Yahoo session?)`,
			);
		}
		// Accumulate the assistant's reply text so we can append it to
		// history after the stream closes.
		const assistantText: string[] = [];
		for await (const chunk of parseSseStream(res.body)) {
			if (chunk.text) assistantText.push(chunk.text);
			yield chunk;
		}
		if (assistantText.length) {
			this.#history.push({
				id: randomId32(),
				role: "assistant",
				contents: [{ type: "text", text: assistantText.join("") }],
			});
		}
	}

	/** Mints anonymous Yahoo `B`/`XB` cookies via the same GET LINE's WebView does. */
	static async mintAnonymousCookies(opts: {
		fetch?: typeof fetch;
		source?: AgentISource;
	} = {}): Promise<string> {
		const f = opts.fetch ?? fetch;
		const url = buildAgentIWebViewUrl({
			source: opts.source ?? "chattab_searchbar",
		});
		const res = await f(url, { method: "GET", redirect: "manual" });
		const setCookie = res.headers.get("set-cookie") ?? "";
		// Quick parse — each cookie pair before the first `;` per
		// Set-Cookie line.  We don't care about expiry/path here.
		return setCookie
			.split(/,(?=\s*\w+=)/)
			.map((c) => c.split(";")[0].trim())
			.filter(Boolean)
			.join("; ");
	}

	/** Drop the in-memory conversation history. */
	reset(): void {
		this.#history = [];
	}

	/** Read-only view of the conversation history (latest last). */
	get history(): readonly ChatMessage[] {
		return this.#history;
	}
}

async function* parseSseStream(
	stream: ReadableStream<Uint8Array>,
): AsyncGenerator<AgentIChunk> {
	const reader = stream
		.pipeThrough(new TextDecoderStream())
		.getReader();
	let buffer = "";
	try {
		while (true) {
			const { value, done } = await reader.read();
			if (done) break;
			buffer += value;
			let idx: number;
			// SSE event boundary is a blank line ("\n\n").
			while ((idx = buffer.indexOf("\n\n")) !== -1) {
				const raw = buffer.slice(0, idx);
				buffer = buffer.slice(idx + 2);
				const event = parseSseEvent(raw);
				if (event) yield event;
			}
		}
		if (buffer.trim().length) {
			const event = parseSseEvent(buffer);
			if (event) yield event;
		}
	} finally {
		reader.releaseLock();
	}
}

function parseSseEvent(raw: string): AgentIChunk | null {
	let eventName: string | undefined;
	const dataLines: string[] = [];
	for (const line of raw.split("\n")) {
		if (line.startsWith(":")) continue; // comment
		if (line.startsWith("event:")) eventName = line.slice(6).trim();
		else if (line.startsWith("data:")) dataLines.push(line.slice(5).trim());
	}
	if (!dataLines.length) return null;
	const dataStr = dataLines.join("\n");
	let data: unknown = dataStr;
	if (dataStr.startsWith("{") || dataStr.startsWith("[")) {
		try {
			data = JSON.parse(dataStr);
		} catch { /* keep raw string */ }
	}
	return {
		event: eventName,
		data,
		text: extractText(data),
	};
}

function extractText(data: unknown): string | null {
	if (typeof data === "string") return data;
	if (!data || typeof data !== "object") return null;
	const o = data as Record<string, unknown>;
	// Yahoo search-agent wire shape (live-verified 2026-05):
	//   {type:"compositeMessage-delta", value:{message:"..."}, messageType:"text"}
	if (
		o.type === "compositeMessage-delta" || o.type === "compositeMessage-end"
	) {
		const v = o.value as { message?: unknown } | undefined;
		if (v && typeof v.message === "string") return v.message;
		if (v && v.message && typeof v.message === "object") {
			const message = v.message as { text?: unknown };
			if (typeof message.text === "string") return message.text;
		}
	}
	// Common fallbacks for other payload shapes.
	if (typeof o.text === "string") return o.text;
	if (typeof o.delta === "string") return o.delta;
	if (typeof o.content === "string") return o.content;
	const contents = o.contents;
	if (Array.isArray(contents)) {
		const parts: string[] = [];
		for (const c of contents) {
			if (
				c && typeof c === "object" &&
				typeof (c as { text?: unknown }).text === "string"
			) {
				parts.push((c as { text: string }).text);
			}
		}
		if (parts.length) return parts.join("");
	}
	return null;
}
