// Native LINE AI ("Agent i" home-tab tile) REST client.
// Endpoints + headers from smali (smali_classes8/fk2/*); host is a
// best-guess default — Hilt-injected at runtime, override via opts.host
// once a wire trace lands (#157).
import type {} from "node:buffer";

export const LineAiEndpoints = {
	query: "/v2/query-ai",
	cancelQuery: "/v2/query-ai/cancel",
	serviceInfo: "/v2/service-info",
	threadList: "/v2/thread",
	threadById: "/v2/thread/",
	userAgreement: "/v2/user/agreement",
	promptPreset: "/prompt-preset",
} as const;

/** Provisional default host — override if/when the live host is known. */
export const DEFAULT_LINE_AI_HOST = "https://gw.line.naver.jp/lineai";

export interface LineAiOptions {
	accessToken: string;
	lineVersion: string;
	host?: string;
	fetch?: typeof fetch;
	userAgent?: string;
}

export interface LineAiQueryRequest {
	threadId?: string | null;
	prompt: string;
	serviceId?: string;
	[k: string]: unknown;
}

export interface LineAiResponse<T = unknown> {
	status: number;
	rateLimit: { limit?: string; remaining?: string; usage?: string };
	body: T;
}

export class LineAiClient {
	#opts: Required<Omit<LineAiOptions, "fetch" | "userAgent">> & {
		fetch: typeof fetch;
		userAgent: string;
	};

	constructor(opts: LineAiOptions) {
		this.#opts = {
			host: (opts.host ?? DEFAULT_LINE_AI_HOST).replace(/\/+$/, ""),
			accessToken: opts.accessToken,
			lineVersion: opts.lineVersion,
			fetch: opts.fetch ?? fetch,
			userAgent: opts.userAgent ?? `Line/${opts.lineVersion}/LineAi`,
		};
	}

	query(req: LineAiQueryRequest): Promise<LineAiResponse> {
		return this.#post(LineAiEndpoints.query, req);
	}
	cancelQuery(opts: { runId: string; threadId?: string }) {
		return this.#post(LineAiEndpoints.cancelQuery, opts);
	}
	getServiceInfo(): Promise<LineAiResponse> {
		return this.#get(LineAiEndpoints.serviceInfo);
	}
	listThreads(): Promise<LineAiResponse> {
		return this.#get(LineAiEndpoints.threadList);
	}
	getThread(threadId: string): Promise<LineAiResponse> {
		return this.#get(LineAiEndpoints.threadById + encodeURIComponent(threadId));
	}
	submitAgreement(opts: Record<string, unknown> = {}): Promise<LineAiResponse> {
		return this.#post(LineAiEndpoints.userAgreement, opts);
	}
	getPromptPresets(): Promise<LineAiResponse> {
		return this.#get(LineAiEndpoints.promptPreset);
	}

	async #get(path: string): Promise<LineAiResponse> {
		const res = await this.#opts.fetch(this.#opts.host + path, {
			method: "GET",
			headers: this.#headers(),
		});
		return await this.#wrap(res);
	}
	async #post(path: string, body: unknown): Promise<LineAiResponse> {
		const res = await this.#opts.fetch(this.#opts.host + path, {
			method: "POST",
			headers: { ...this.#headers(), "content-type": "application/json; charset=utf-8" },
			body: JSON.stringify(body),
		});
		return await this.#wrap(res);
	}
	#headers(): Record<string, string> {
		return {
			accept: "application/json",
			"user-agent": this.#opts.userAgent,
			"X-ACCESS-TOKEN": this.#opts.accessToken,
			"X-LINE-VERSION": this.#opts.lineVersion,
		};
	}
	async #wrap(res: Response): Promise<LineAiResponse> {
		const text = await res.text();
		let body: unknown = null;
		if (text) {
			try { body = JSON.parse(text); } catch { body = text; }
		}
		return {
			status: res.status,
			rateLimit: {
				limit: res.headers.get("x-ratelimit-limit") ?? undefined,
				remaining: res.headers.get("x-ratelimit-remaining") ?? undefined,
				usage: res.headers.get("x-ratelimit-usage") ?? undefined,
			},
			body,
		};
	}
}
