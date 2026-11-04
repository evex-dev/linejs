import type { CommandSpec } from "../command.ts";
import { UsageError } from "../errors.ts";
import { serialize } from "../output.ts";
import { withClient } from "../session.ts";

const commonOptions = [
	{ name: "chat-mid", type: "string", valueName: "mid", description: "Chat MID context." },
	{
		name: "liff-id",
		type: "string",
		valueName: "id",
		description: "LIFF id (default: LINEJS default).",
	},
	{ name: "lang", type: "string", valueName: "lang", description: "Language (default ja_JP)." },
] as const;

const tokenCommand: CommandSpec = {
	name: "liff token",
	summary: "Get a LIFF access token.",
	category: "LIFF",
	options: commonOptions,
	examples: [
		"line liff token --chat-mid cxxxxxxxx",
		"line liff token --liff-id 2006747340-AoraPvdD",
	],
	auth: true,
	async run(context) {
		const liffId = context.getString("liff-id");
		return await withClient(context, async ({ client }) => {
			if (liffId) client.liff.setDefaultLiffId(liffId);
			const token = await client.liff.getToken({
				chatMid: context.getString("chat-mid"),
				lang: context.getString("lang"),
			});
			return { token };
		});
	},
	format(value) {
		return (value as { token: string }).token;
	},
};

const viewCommand: CommandSpec = {
	name: "liff view",
	summary: "Issue a LIFF view URL.",
	category: "LIFF",
	options: commonOptions,
	examples: ["line liff view --chat-mid cxxxxxxxx"],
	auth: true,
	async run(context) {
		const liffId = context.getString("liff-id");
		return await withClient(context, async ({ client }) => {
			if (liffId) client.liff.setDefaultLiffId(liffId);
			return await client.liff.issueView({
				chatMid: context.getString("chat-mid"),
				lang: context.getString("lang"),
			});
		});
	},
	format(value) {
		const result = value as Record<string, unknown>;
		return String(result.viewUrl ?? result.liffViewUrl ?? JSON.stringify(serialize(result)));
	},
};

const shareCommand: CommandSpec = {
	name: "liff share",
	summary: "Share one or more LIFF messages to a chat.",
	category: "LIFF",
	args: [{ name: "to", description: "Target chat MID.", required: true }],
	options: [
		{
			name: "message",
			type: "string",
			valueName: "json",
			description: "One LIFF message as JSON.",
		},
		{
			name: "messages",
			type: "string",
			valueName: "json",
			description: "Array of LIFF messages as JSON.",
		},
		{ name: "liff-id", type: "string", valueName: "id", description: "LIFF id." },
		{ name: "force", type: "boolean", description: "Force a new LIFF token." },
	],
	examples: ['line liff share cxxxxxxxx --message \'{"type":"text","text":"Hello"}\''],
	auth: true,
	async run(context) {
		const to = context.requireArg(0, "to");
		const one = context.getJson<Record<string, unknown>>("message");
		const many = context.getJson<Array<Record<string, unknown>>>("messages");
		const messages = many ?? (one ? [one] : undefined);
		if (!messages?.length) throw new UsageError("Pass --message or --messages");
		const liffId = context.getString("liff-id");
		return await withClient(context, async ({ client }) => {
			if (liffId) client.liff.setDefaultLiffId(liffId);
			const result = await client.liff.shareMessages(to, messages as never, {
				forceIssue: context.getBool("force"),
			});
			return { ok: true, result };
		});
	},
	format(value) {
		return `Shared LIFF message: ${JSON.stringify(serialize((value as { result: unknown }).result))}`;
	},
};

const shareTextCommand: CommandSpec = {
	name: "liff share-text",
	summary: "Share a plain text LIFF message.",
	category: "LIFF",
	args: [
		{ name: "to", description: "Target chat MID.", required: true },
		{ name: "text", description: "Text to share.", required: true, variadic: true },
	],
	options: [
		{ name: "liff-id", type: "string", valueName: "id", description: "LIFF id." },
		{ name: "force", type: "boolean", description: "Force a new LIFF token." },
	],
	examples: ["line liff share-text cxxxxxxxx 'Hello'"],
	auth: true,
	async run(context) {
		const to = context.requireArg(0, "to");
		const text = context.rest(1);
		if (!text) throw new UsageError("Missing text");
		const liffId = context.getString("liff-id");
		return await withClient(context, async ({ client }) => {
			if (liffId) client.liff.setDefaultLiffId(liffId);
			const result = await client.liff.shareMessage(
				to,
				{ type: "text", text },
				{ forceIssue: context.getBool("force") },
			);
			return { ok: true, result };
		});
	},
	format(value) {
		return `Shared LIFF text: ${JSON.stringify(serialize((value as { result: unknown }).result))}`;
	},
};

export const liffCommands: CommandSpec[] = [
	tokenCommand,
	viewCommand,
	shareCommand,
	shareTextCommand,
];
