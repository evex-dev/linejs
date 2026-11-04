import { runCli } from "../cli.ts";
import {
	type McpEventRecord,
	type McpEventSource,
	type McpEventSourceKind,
	previewText,
} from "./events.ts";

export interface LineEventSourceOptions {
	kind: McpEventSourceKind;
	/** Profile name or path forwarded to `line listen --profile`. */
	profile?: string;
	/** Defaults to runCli; injectable for tests. */
	run?: typeof runCli;
	/** How long to wait for the listener to connect before declaring success. */
	readyTimeoutMs?: number;
	/** Called when an established listener exits on its own (not via stop()). */
	onExit?: (reason: string) => void;
	env?: NodeJS.ProcessEnv;
}

function asString(value: unknown): string | undefined {
	return typeof value === "string" && value ? value : undefined;
}

function asTime(value: unknown): string | undefined {
	if (typeof value === "number" && Number.isFinite(value)) return new Date(value).toISOString();
	if (typeof value === "string") {
		const parsed = new Date(value);
		if (!Number.isNaN(parsed.getTime())) return parsed.toISOString();
	}
	return undefined;
}

const EVENT_NAMES: Record<string, string> = {
	talk: "line.message.received",
	"talk:edit": "line.message.edited",
	square: "line.openchat.message.received",
};

/** Map one `line listen --json` NDJSON record onto an MCP event occurrence. */
export function toEventRecord(value: Record<string, unknown>): McpEventRecord | undefined {
	const name = typeof value.type === "string" ? EVENT_NAMES[value.type] : undefined;
	if (!name) return undefined;
	const messageId = asString(value.id);
	const chatId = asString(value.chatMid);
	if (!messageId || !chatId) return undefined;
	const occurredAt = asTime(value.createdTime) ?? asTime(value.at) ?? new Date().toISOString();
	const data: Record<string, unknown> = {
		messageId,
		chatId,
		from: asString(value.from) ?? "",
		contentType: asString(value.contentType) ?? "UNKNOWN",
	};
	const text = previewText(value.text);
	if (text !== undefined) data.text = text;
	return { name, occurredAt, data };
}

/**
 * Event source backed by the CLI's own `listen --json` command. Running the
 * command in-process reuses the profile, token refresh, and reconnect logic
 * that every other CLI command already uses.
 */
export function createLineEventSource(options: LineEventSourceOptions): McpEventSource {
	const run = options.run ?? runCli;
	const readyTimeoutMs = options.readyTimeoutMs ?? 1_500;
	const env = options.env ?? process.env;
	let controller: AbortController | undefined;
	let running: Promise<void> | undefined;

	return {
		async start(onEvent) {
			if (running) return;
			controller = new AbortController();
			const abortController = controller;

			const args = [...(options.profile ? ["--profile", options.profile] : []), "listen", "--json"];
			if (options.kind === "square") args.push("--square");

			let settled = false;
			let resolveReady: () => void = () => {};
			let rejectReady: (error: Error) => void = () => {};
			const ready = new Promise<void>((resolve, reject) => {
				resolveReady = resolve;
				rejectReady = reject;
			});

			const stderr: string[] = [];
			let stderrSize = 0;
			const captureStderr = (chunk: string) => {
				if (stderrSize >= 4_000) return;
				stderr.push(chunk);
				stderrSize += chunk.length;
			};

			let buffer = "";
			const onStdout = (chunk: string) => {
				buffer += chunk;
				let index = buffer.indexOf("\n");
				while (index >= 0) {
					const line = buffer.slice(0, index).trim();
					buffer = buffer.slice(index + 1);
					index = buffer.indexOf("\n");
					if (!line) continue;
					let parsed: unknown;
					try {
						parsed = JSON.parse(line);
					} catch {
						continue;
					}
					if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) continue;
					const record = toEventRecord(parsed as Record<string, unknown>);
					if (!record) continue;
					if (!settled) {
						settled = true;
						resolveReady();
					}
					onEvent(record);
				}
			};

			const timer = setTimeout(() => {
				if (settled) return;
				settled = true;
				resolveReady();
			}, readyTimeoutMs);
			timer.unref?.();

			const execution = run(args, {
				stdout: onStdout,
				stderr: captureStderr,
				interactive: false,
				mcp: true,
				handleSignals: false,
				signal: abortController.signal,
				env: { ...env, LINEJS_NONINTERACTIVE: "1" },
			}).then(
				async (result) => {
					clearTimeout(timer);
					const detail = stderr.join("").trim();
					if (!settled) {
						settled = true;
						rejectReady(new Error(detail || `line listen exited with code ${result.exitCode}`));
						return;
					}
					if (!abortController.signal.aborted) {
						options.onExit?.(detail || `line listen exited with code ${result.exitCode}`);
					}
				},
				async (error: unknown) => {
					clearTimeout(timer);
					const detail = error instanceof Error ? error.message : String(error);
					if (!settled) {
						settled = true;
						rejectReady(new Error(detail));
						return;
					}
					if (!abortController.signal.aborted) options.onExit?.(detail);
				},
			);
			running = execution;
			// Clear the handle once the listener exits so a later start() reconnects.
			void execution
				.catch(() => {})
				.finally(() => {
					if (running === execution) running = undefined;
				});

			try {
				await ready;
			} catch (error) {
				abortController.abort();
				running = undefined;
				throw error;
			}
		},
		async stop() {
			controller?.abort();
			controller = undefined;
			const pending = running;
			running = undefined;
			await pending?.catch(() => {});
		},
	};
}
