import type { Client } from "@evex-dev/linejs";
import type { CommandSpec } from "../command.ts";
import { CliError, UsageError } from "../errors.ts";
import { writeBinaryFile } from "../files.ts";
import { formatJson } from "../output.ts";
import { withClient } from "../session.ts";
import {
	fetchTalkMessages,
	limitOption,
	outOption,
	resolveReaction,
	talkMessageSummary,
} from "./shared.ts";

function bigIntId(value: string): bigint {
	if (!/^\d+$/.test(value)) throw new UsageError(`Invalid message id: ${value}`);
	return BigInt(value);
}

async function resolveTalkMessage(client: Client, chatMid: string, messageId: string, limit = 100) {
	const messages = await fetchTalkMessages(client, chatMid, limit);
	const message = messages.find((entry) => entry.raw.id === messageId);
	if (!message) {
		throw new CliError(
			"NOT_FOUND",
			`Message ${messageId} was not found in the last ${limit} messages`,
			{
				details: {
					chatMid,
					messageId,
					limit,
					hint: "Increase --limit or use the raw API command.",
				},
			},
		);
	}
	return message;
}

const reactCommand: CommandSpec = {
	name: "messages react",
	summary: "React to a message.",
	category: "Messages",
	args: [
		{ name: "messageId", description: "Message id (decimal).", required: true },
		{
			name: "reaction",
			description: "ALL, UNDO, NICE, LOVE, FUN, AMAZING, SAD, OMG, or 0-7.",
			required: true,
		},
	],
	examples: ["line messages react 123456789 NICE"],
	auth: true,
	async run(context) {
		const messageId = bigIntId(context.requireArg(0, "messageId"));
		const reaction = resolveReaction(context.requireArg(1, "reaction"));
		return await withClient(context, async ({ base }) => {
			await base.talk.react({ id: messageId, reaction });
			return { ok: true, messageId: messageId.toString(), reaction };
		});
	},
	format(value) {
		const result = value as { messageId: string; reaction: string };
		return `Reacted to ${result.messageId} with ${result.reaction}`;
	},
};

const cancelReactionCommand: CommandSpec = {
	name: "messages cancel-reaction",
	summary: "Remove your reaction from a message.",
	category: "Messages",
	args: [{ name: "messageId", description: "Message id.", required: true }],
	examples: ["line messages cancel-reaction 123456789"],
	auth: true,
	async run(context) {
		const messageId = bigIntId(context.requireArg(0, "messageId"));
		return await withClient(context, async ({ base }) => {
			await base.talk.cancelReaction({
				cancelReactionRequest: {
					reqSeq: await base.getReqseq(),
					messageId,
				},
			});
			return { ok: true, messageId: messageId.toString() };
		});
	},
	format(value) {
		return `Canceled reaction on ${(value as { messageId: string }).messageId}`;
	},
};

const unsendCommand: CommandSpec = {
	name: "messages unsend",
	summary: "Unsend one of your messages.",
	category: "Messages",
	args: [{ name: "messageId", description: "Message id.", required: true }],
	examples: ["line messages unsend 123456789"],
	auth: true,
	async run(context) {
		const messageId = context.requireArg(0, "messageId");
		bigIntId(messageId);
		return await withClient(context, async ({ base }) => {
			await base.talk.unsendMessage({ messageId });
			return { ok: true, messageId };
		});
	},
	format(value) {
		return `Unsents ${(value as { messageId: string }).messageId}`;
	},
};

const readCommand: CommandSpec = {
	name: "messages read",
	summary: "Mark a chat as read up to a message.",
	category: "Messages",
	args: [
		{ name: "chatMid", description: "Chat MID.", required: true },
		{ name: "messageId", description: "Last read message id.", required: true },
	],
	examples: ["line messages read cxxxxxxxx 123456789"],
	auth: true,
	async run(context) {
		const chatMid = context.requireArg(0, "chatMid");
		const lastMessageId = context.requireArg(1, "messageId");
		return await withClient(context, async ({ base }) => {
			await base.talk.sendChatChecked({
				chatMid,
				lastMessageId,
				seq: await base.getReqseq(),
			});
			return { ok: true, chatMid, lastMessageId };
		});
	},
	format(value) {
		const result = value as { chatMid: string; lastMessageId: string };
		return `Marked ${result.chatMid} read up to ${result.lastMessageId}`;
	},
};

const replyCommand: CommandSpec = {
	name: "messages reply",
	summary: "Reply to a message.",
	category: "Messages",
	args: [
		{ name: "to", description: "Target MID.", required: true },
		{ name: "messageId", description: "Message id to reply to.", required: true },
		{ name: "text", description: "Reply text.", required: false, variadic: true },
	],
	options: [
		{ name: "text", type: "string", valueName: "text", description: "Reply text." },
		{ name: "e2ee", type: "boolean", description: "Use E2EE (default). Use --no-e2ee to disable." },
	],
	examples: ["line messages reply cxxxxxxxx 123456789 'Thanks!'"],
	auth: true,
	async run(context) {
		const to = context.requireArg(0, "to");
		const relatedMessageId = context.requireArg(1, "messageId");
		const text = context.getString("text") ?? context.rest(2);
		if (!text) throw new UsageError("Missing reply text");
		return await withClient(context, async ({ base }) => {
			const message = await base.talk.sendMessage({
				to,
				text,
				relatedMessageId,
				e2ee: context.getBool("e2ee", true),
			});
			return { ok: true, message };
		});
	},
	format(value) {
		return `Sent reply ${String((value as { message: Record<string, unknown> }).message.id ?? "")}`;
	},
};

const showCommand: CommandSpec = {
	name: "messages show",
	summary: "Show a message with stickers, mentions, flex, and reply metadata.",
	category: "Messages",
	args: [
		{ name: "chatMid", description: "Chat MID (c..., r..., or u... for 1:1).", required: true },
		{ name: "messageId", description: "Message id.", required: true },
	],
	options: [limitOption(100)],
	examples: ["line messages show cxxxxxxxx 123456789"],
	auth: true,
	async run(context) {
		const chatMid = context.requireArg(0, "chatMid");
		const messageId = context.requireArg(1, "messageId");
		const limit = context.getNumber("limit") ?? 100;
		return await withClient(context, async ({ client }) => {
			const message = await resolveTalkMessage(client, chatMid, messageId, limit);
			const extra: Record<string, unknown> = {};
			try {
				extra.stickerUrl = message.getStickerURL();
			} catch {}
			try {
				extra.emojiUrls = message.collectEmojiURLs();
			} catch {}
			try {
				extra.mentions = message.getMentions();
			} catch {}
			try {
				extra.decorations = message.getTextDecorations();
			} catch {}
			try {
				extra.sharedContact = message.getSharedContact();
			} catch {}
			try {
				extra.flex = message.getFlex();
			} catch {}
			try {
				extra.replyTarget = message.getReplyTarget()?.id;
			} catch {}
			return {
				...talkMessageSummary(message, context.json),
				...extra,
				...(context.json ? { raw: message.raw } : {}),
			};
		});
	},
	format(value) {
		const message = value as Record<string, unknown>;
		return formatJson(message);
	},
};

const pinCommand: CommandSpec = {
	name: "messages pin",
	summary: "Pin a message as a chat announcement.",
	category: "Messages",
	args: [
		{ name: "chatMid", description: "Chat MID (c..., r..., or u... for 1:1).", required: true },
		{ name: "messageId", description: "Message id.", required: true },
	],
	options: [limitOption(100)],
	examples: ["line messages pin cxxxxxxxx 123456789"],
	auth: true,
	async run(context) {
		const chatMid = context.requireArg(0, "chatMid");
		const messageId = context.requireArg(1, "messageId");
		const limit = context.getNumber("limit") ?? 100;
		return await withClient(context, async ({ client }) => {
			const message = await resolveTalkMessage(client, chatMid, messageId, limit);
			await message.announce();
			return { ok: true, chatMid, messageId };
		});
	},
	format(value) {
		const result = value as { chatMid: string; messageId: string };
		return `Pinned ${result.messageId} in ${result.chatMid}`;
	},
};

function extensionForMime(type: string): string {
	const map: Record<string, string> = {
		"image/jpeg": "jpg",
		"image/png": "png",
		"image/gif": "gif",
		"video/mp4": "mp4",
		"audio/mp4": "m4a",
		"audio/mpeg": "mp3",
		"application/pdf": "pdf",
	};
	return map[type] ?? "bin";
}

export async function downloadTalkMessageData(context: import("../context.ts").CommandContext) {
	const chatMid = context.requireArg(0, "chatMid");
	const messageId = context.requireArg(1, "messageId");
	const limit = context.getNumber("limit") ?? 100;
	return await withClient(context, async ({ client }) => {
		const message = await resolveTalkMessage(client, chatMid, messageId, limit);
		const blob = await message.getData(context.getBool("preview"));
		const out =
			context.getString("out") ??
			`line-${messageId}.${extensionForMime(blob.type || "application/octet-stream")}`;
		const written = await writeBinaryFile(out, blob, context.settings.cwd);
		return { ok: true, ...written, type: blob.type, messageId, chatMid };
	});
}

const dataOptions = [
	outOption("Output file (default: line-<messageId>.<ext>)."),
	{
		name: "preview",
		type: "boolean",
		description: "Download the preview instead of the original.",
	},
	limitOption(100),
] as const;

const dataCommand: CommandSpec = {
	name: "messages data",
	summary: "Download the media attached to a message.",
	category: "Messages",
	args: [
		{ name: "chatMid", description: "Chat MID (c..., r..., or u... for 1:1).", required: true },
		{ name: "messageId", description: "Message id.", required: true },
	],
	options: dataOptions,
	examples: ["line messages data cxxxxxxxx 123456789 --out ./photo.jpg"],
	auth: true,
	run: downloadTalkMessageData,
	format(value) {
		const result = value as { path: string; size: number; type: string };
		return `Saved ${result.size} bytes (${result.type}) to ${result.path}`;
	},
};

export const messagesCommands: CommandSpec[] = [
	reactCommand,
	cancelReactionCommand,
	unsendCommand,
	readCommand,
	replyCommand,
	showCommand,
	pinCommand,
	dataCommand,
];
