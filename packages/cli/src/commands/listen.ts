import type { SquareMessage, TalkMessage } from "@evex-dev/linejs";
import type { CommandSpec } from "../command.ts";
import { UsageError } from "../errors.ts";
import { withClient } from "../session.ts";
import { squareMessageSummary, talkMessageSummary } from "./shared.ts";

function now(): string {
	return new Date().toISOString();
}

const listenCommand: CommandSpec = {
	name: "listen",
	summary: "Stream incoming talk/OpenChat events until interrupted.",
	description:
		"In --json mode every event is written as one JSON object per line (NDJSON), followed by a final summary object. QR/media and diagnostics go to stderr.",
	category: "Events",
	options: [
		{
			name: "talk",
			type: "boolean",
			description: "Listen to talk messages (default: true, or false when only --square is given).",
		},
		{ name: "square", type: "boolean", description: "Listen to OpenChat events (default: false)." },
		{ name: "events", type: "boolean", description: "Include raw protocol events." },
		{ name: "count", type: "number", valueName: "n", description: "Stop after N messages." },
		{
			name: "duration",
			type: "number",
			valueName: "seconds",
			description: "Stop after N seconds.",
		},
	],
	examples: [
		"line listen",
		"line listen --talk --square --count 10",
		"line listen --json --duration 60",
	],
	auth: true,
	longRunning: true,
	mcp: false,
	async run(context) {
		const square = context.getBool("square", false);
		const talk = context.has("talk") ? context.getBool("talk") : !square;
		const includeEvents = context.getBool("events");
		const countLimit = context.getNumber("count");
		const duration = context.getNumber("duration");
		if (!talk && !square) throw new UsageError("Enable at least one of --talk or --square");
		if (countLimit !== undefined && (!Number.isInteger(countLimit) || countLimit <= 0)) {
			throw new UsageError("--count must be a positive integer");
		}
		if (duration !== undefined && (!Number.isFinite(duration) || duration <= 0)) {
			throw new UsageError("--duration must be a positive number of seconds");
		}

		return await withClient(context, async ({ client, store }) => {
			const controller = new AbortController();
			const abort = () => controller.abort();
			if (context.signal.aborted) controller.abort();
			context.signal.addEventListener("abort", abort, { once: true });

			let messages = 0;
			let edits = 0;
			let events = 0;
			let timer: NodeJS.Timeout | undefined;
			if (duration !== undefined) {
				timer = setTimeout(() => controller.abort(), duration * 1000);
				timer.unref?.();
			}

			const emit = (type: string, data: Record<string, unknown>, human: string) => {
				if (context.json) {
					context.output.jsonLine({ type, at: now(), ...data });
				} else {
					context.output.writeLine(`${context.output.dim(now())} ${human}`);
				}
			};

			const onMessage = (message: TalkMessage) => {
				messages += 1;
				const summary = talkMessageSummary(message, false);
				const text = message.text || `(${String(summary.contentType ?? "message")})`;
				emit("talk", summary, `talk ${String(summary.from)}: ${text}`);
				if (countLimit !== undefined && messages >= countLimit) controller.abort();
			};
			const onEdit = (message: TalkMessage) => {
				edits += 1;
				const summary = talkMessageSummary(message, false);
				emit(
					"talk:edit",
					summary,
					`talk:edit ${String(summary.from)}: ${message.text || "(edited message)"}`,
				);
			};
			const onSquareMessage = (message: SquareMessage) => {
				messages += 1;
				const summary = squareMessageSummary(message, false);
				const text = message.text || `(${String(summary.contentType ?? "message")})`;
				emit("square", summary, `square ${String(summary.from)}: ${text}`);
				if (countLimit !== undefined && messages >= countLimit) controller.abort();
			};
			const onEvent = (event: unknown) => {
				events += 1;
				if (includeEvents) {
					const type =
						event && typeof event === "object" && "type" in event
							? String((event as { type: unknown }).type)
							: "unknown";
					emit("talk:event", { event }, `talk:event ${type}`);
				}
			};
			const onSquareEvent = (event: unknown) => {
				events += 1;
				if (includeEvents) {
					const type =
						event && typeof event === "object" && "type" in event
							? String((event as { type: unknown }).type)
							: "unknown";
					emit("square:event", { event }, `square:event ${type}`);
				}
			};
			const onIncoming = (event: unknown) => {
				emit("call:incoming", { event }, "call:incoming");
			};
			const onCancel = (event: unknown) => {
				emit("call:cancel", { event }, "call:cancel");
			};

			client.on("message", onMessage);
			client.on("message:edit", onEdit);
			client.on("square:message", onSquareMessage);
			client.on("event", onEvent);
			client.on("square:event", onSquareEvent);
			client.on("call:incoming", onIncoming);
			client.on("call:cancel", onCancel);

			const stopped = new Promise<void>((resolve) => {
				controller.signal.addEventListener("abort", () => resolve(), { once: true });
			});

			client.listen({ talk, square, signal: controller.signal });
			if (!context.json) {
				context.output.writeErrLine(
					`Listening (talk=${talk}, square=${square}). Press Ctrl+C to stop.`,
				);
			}

			await stopped;
			if (timer) clearTimeout(timer);
			context.signal.removeEventListener("abort", abort);
			// Give the polling/push loops a moment to observe the abort.
			await new Promise((resolve) => setTimeout(resolve, 100));
			client.off("message", onMessage);
			client.off("message:edit", onEdit);
			client.off("square:message", onSquareMessage);
			client.off("event", onEvent);
			client.off("square:event", onSquareEvent);
			client.off("call:incoming", onIncoming);
			client.off("call:cancel", onCancel);
			await store.flush();

			const summary = { type: "summary", listening: false, messages, edits, events };
			if (!context.json) {
				context.output.writeErrLine(
					`Stopped. ${messages} message(s), ${edits} edit(s), ${events} event(s).`,
				);
			}
			return summary;
		});
	},
	format() {
		return "";
	},
};

export const listenCommands: CommandSpec[] = [listenCommand];
