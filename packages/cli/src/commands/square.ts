import { SquareMessage } from "@evex-dev/linejs";
import { enums } from "@evex-dev/linejs-types";
import type { CommandSpec } from "../command.ts";
import { CliError, UsageError } from "../errors.ts";
import { readFileAsBlob, writeBinaryFile } from "../files.ts";
import { serialize } from "../output.ts";
import { withClient } from "../session.ts";
import {
	limitOption,
	resolveReaction,
	squareChatSummary,
	squareMessageSummary,
	squareSummary,
} from "./shared.ts";

const listCommand: CommandSpec = {
	name: "square list",
	summary: "List joined OpenChat squares.",
	category: "OpenChat (Square)",
	examples: ["line square list", "line square list --json"],
	auth: true,
	async run(context) {
		return await withClient(context, async ({ client }) => {
			const squares = await client.fetchJoinedSquares();
			return { squares: squares.map((square) => squareSummary(square, context.json)) };
		});
	},
	format(value) {
		const squares = (value as { squares: Array<Record<string, unknown>> }).squares;
		if (!squares.length) return "No squares.";
		return squares
			.map((square) => `${String(square.mid ?? "")}  ${String(square.name ?? "")}`)
			.join("\n");
	},
};

const getCommand: CommandSpec = {
	name: "square get",
	summary: "Show an OpenChat square.",
	category: "OpenChat (Square)",
	args: [{ name: "squareMid", description: "Square MID.", required: true }],
	examples: ["line square get sxxxxxxxx"],
	auth: true,
	async run(context) {
		const squareMid = context.requireArg(0, "squareMid");
		return await withClient(context, async ({ client }) => {
			const square = await client.getSquare(squareMid);
			return squareSummary(square, true);
		});
	},
	format(value) {
		const square = value as Record<string, unknown>;
		return `${String(square.name ?? "")} (${String(square.mid ?? "")})`;
	},
};

const chatsCommand: CommandSpec = {
	name: "square chats",
	summary: "List joined OpenChat chats.",
	category: "OpenChat (Square)",
	examples: ["line square chats", "line square chats --json"],
	auth: true,
	async run(context) {
		return await withClient(context, async ({ client }) => {
			const chats = await client.fetchJoinedSquareChats();
			return { chats: chats.map((chat) => squareChatSummary(chat, context.json)) };
		});
	},
	format(value) {
		const chats = (value as { chats: Array<Record<string, unknown>> }).chats;
		if (!chats.length) return "No OpenChat chats.";
		return chats
			.map(
				(chat) =>
					`${String(chat.mid ?? "")}  ${String(chat.name ?? "")}  (square ${String(chat.squareMid ?? "")})`,
			)
			.join("\n");
	},
};

const chatGetCommand: CommandSpec = {
	name: "square chat-get",
	summary: "Show one OpenChat chat.",
	category: "OpenChat (Square)",
	args: [{ name: "squareChatMid", description: "Square chat MID.", required: true }],
	examples: ["line square chat-get mxxxxxxxx"],
	auth: true,
	async run(context) {
		const squareChatMid = context.requireArg(0, "squareChatMid");
		return await withClient(context, async ({ client }) => {
			const chat = await client.getSquareChat(squareChatMid);
			return squareChatSummary(chat, true);
		});
	},
	format(value) {
		const chat = value as Record<string, unknown>;
		return `${String(chat.name ?? "")} (${String(chat.mid ?? "")})`;
	},
};

const chatMembersCommand: CommandSpec = {
	name: "square chat-members",
	summary: "List members of an OpenChat chat.",
	category: "OpenChat (Square)",
	args: [{ name: "squareChatMid", description: "Square chat MID.", required: true }],
	examples: ["line square chat-members mxxxxxxxx"],
	auth: true,
	async run(context) {
		const squareChatMid = context.requireArg(0, "squareChatMid");
		return await withClient(context, async ({ client }) => {
			const chat = await client.getSquareChat(squareChatMid);
			const members = await chat.getMembers();
			return { squareChatMid, members };
		});
	},
	format(value) {
		const members = (value as { members: Array<Record<string, unknown>> }).members;
		if (!members.length) return "No members.";
		return members
			.map(
				(member) =>
					`${String(member.squareMemberMid ?? "")}  state=${String(member.membershipState ?? "")}`,
			)
			.join("\n");
	},
};

const chatSendCommand: CommandSpec = {
	name: "square chat-send",
	summary: "Send a message to an OpenChat chat.",
	category: "OpenChat (Square)",
	args: [
		{ name: "squareChatMid", description: "Square chat MID.", required: true },
		{ name: "text", description: "Message text.", required: false, variadic: true },
	],
	options: [{ name: "text", type: "string", valueName: "text", description: "Message text." }],
	examples: ["line square chat-send mxxxxxxxx 'hello'"],
	auth: true,
	async run(context) {
		const squareChatMid = context.requireArg(0, "squareChatMid");
		const text = context.getString("text") ?? context.rest(1);
		if (!text) throw new UsageError("Missing message text");
		return await withClient(context, async ({ client }) => {
			const chat = await client.getSquareChat(squareChatMid);
			const response = await chat.sendMessage(text);
			return { ok: true, response };
		});
	},
	format(value) {
		const response = (value as { response: Record<string, unknown> }).response;
		return `Sent OpenChat message: ${JSON.stringify(serialize(response))}`;
	},
};

const chatMediaCommand: CommandSpec = {
	name: "square chat-media",
	summary: "Send an image, video, or audio message to an OpenChat chat.",
	category: "OpenChat (Square)",
	args: [
		{ name: "squareChatMid", description: "Square chat MID.", required: true },
		{ name: "file", description: "File to upload.", required: true },
	],
	options: [
		{
			name: "type",
			type: "string",
			valueName: "type",
			choices: ["image", "video", "audio"],
			description: "Media type (default: inferred).",
		},
		{
			name: "duration-ms",
			type: "number",
			valueName: "ms",
			description: "Duration for video/audio.",
		},
	],
	examples: ["line square chat-media mxxxxxxxx ./photo.jpg"],
	auth: true,
	async run(context) {
		const squareChatMid = context.requireArg(0, "squareChatMid");
		const file = await readFileAsBlob(context.requireArg(1, "file"), context.settings.cwd);
		const type = (context.getString("type") ??
			(file.blob.type.startsWith("video/")
				? "video"
				: file.blob.type.startsWith("audio/")
					? "audio"
					: "image")) as "image" | "video" | "audio";
		return await withClient(context, async ({ client }) => {
			const chat = await client.getSquareChat(squareChatMid);
			const result =
				type === "image"
					? await chat.sendImage(file.blob, file.filename)
					: type === "video"
						? await chat.sendVideo(file.blob, file.filename, context.getNumber("duration-ms"))
						: await chat.sendAudio(file.blob, file.filename, context.getNumber("duration-ms"));
			return { ok: true, type, result };
		});
	},
	format(value) {
		return `Sent ${(value as { type: string }).type} to OpenChat`;
	},
};

const chatRenameCommand: CommandSpec = {
	name: "square chat-rename",
	summary: "Rename an OpenChat chat.",
	category: "OpenChat (Square)",
	args: [
		{ name: "squareChatMid", description: "Square chat MID.", required: true },
		{ name: "name", description: "New name.", required: true },
	],
	examples: ["line square chat-rename mxxxxxxxx 'New name'"],
	auth: true,
	async run(context) {
		const squareChatMid = context.requireArg(0, "squareChatMid");
		const name = context.rest(1);
		if (!name) throw new UsageError("Missing square name");
		return await withClient(context, async ({ client }) => {
			const chat = await client.getSquareChat(squareChatMid);
			const result = await chat.updateName(name);
			return { ok: true, squareChatMid, name, result };
		});
	},
	format(value) {
		return `Renamed ${(value as { squareChatMid: string }).squareChatMid}`;
	},
};

const chatInviteCommand: CommandSpec = {
	name: "square chat-invite",
	summary: "Invite users to an OpenChat chat.",
	category: "OpenChat (Square)",
	args: [
		{ name: "squareChatMid", description: "Square chat MID.", required: true },
		{ name: "mid", description: "Invitee MID(s).", required: true, variadic: true },
	],
	examples: ["line square chat-invite mxxxxxxxx uxxxx uyyyy"],
	auth: true,
	async run(context) {
		const squareChatMid = context.requireArg(0, "squareChatMid");
		const inviteeMids = context.positionals.slice(1);
		if (!inviteeMids.length) throw new UsageError("Pass at least one invitee MID");
		return await withClient(context, async ({ base }) => {
			const result = await base.square.inviteIntoSquareChat({
				request: { inviteeMids, squareChatMid },
			});
			return { ok: true, squareChatMid, inviteeMids, result };
		});
	},
	format(value) {
		const result = value as { squareChatMid: string; inviteeMids: string[] };
		return `Invited ${result.inviteeMids.join(", ")} to ${result.squareChatMid}`;
	},
};

const chatLeaveCommand: CommandSpec = {
	name: "square chat-leave",
	summary: "Leave an OpenChat chat.",
	category: "OpenChat (Square)",
	args: [{ name: "squareChatMid", description: "Square chat MID.", required: true }],
	options: [
		{
			name: "goodbye",
			type: "boolean",
			description: "Send a goodbye message (default: true). Use --no-goodbye to skip.",
		},
		{ name: "yes", type: "boolean", description: "Confirm leaving the chat." },
	],
	examples: ["line square chat-leave mxxxxxxxx --yes"],
	auth: true,
	async run(context) {
		const squareChatMid = context.requireArg(0, "squareChatMid");
		if (!context.getBool("yes")) throw new UsageError("Pass --yes to confirm leaving the chat");
		return await withClient(context, async ({ base }) => {
			const result = await base.square.leaveSquareChat({
				request: {
					squareChatMid,
					sayGoodbye: context.getBool("goodbye", true),
					squareChatMemberRevision: 0,
				},
			});
			return { ok: true, squareChatMid, result };
		});
	},
	format(value) {
		return `Left ${(value as { squareChatMid: string }).squareChatMid}`;
	},
};

const joinCommand: CommandSpec = {
	name: "square join",
	summary: "Join an OpenChat square.",
	category: "OpenChat (Square)",
	args: [{ name: "squareMid", description: "Square MID.", required: true }],
	options: [
		{
			name: "display-name",
			type: "string",
			valueName: "name",
			description: "Display name in the square.",
		},
		{ name: "passcode", type: "string", valueName: "code", description: "Join passcode." },
		{ name: "message", type: "string", valueName: "text", description: "Join request message." },
	],
	examples: ["line square join sxxxxxxxx", "line square join sxxxxxxxx --passcode 1234"],
	auth: true,
	async run(context) {
		const squareMid = context.requireArg(0, "squareMid");
		return await withClient(context, async ({ base }) => {
			const displayName =
				context.getString("display-name") ?? base.profile?.displayName ?? "linejs";
			const result = await base.square.joinSquare({
				squareMid,
				displayName,
				passCode: context.getString("passcode"),
				joinMessage: context.getString("message"),
			});
			return { ok: true, squareMid, result };
		});
	},
	format(value) {
		return `Joined ${(value as { squareMid: string }).squareMid}`;
	},
};

const leaveCommand: CommandSpec = {
	name: "square leave",
	summary: "Leave an OpenChat square.",
	category: "OpenChat (Square)",
	args: [{ name: "squareMid", description: "Square MID.", required: true }],
	options: [{ name: "yes", type: "boolean", description: "Confirm leaving the square." }],
	examples: ["line square leave sxxxxxxxx --yes"],
	auth: true,
	async run(context) {
		const squareMid = context.requireArg(0, "squareMid");
		if (!context.getBool("yes")) throw new UsageError("Pass --yes to confirm leaving the square");
		return await withClient(context, async ({ base }) => {
			const result = await base.square.leaveSquare({ request: { squareMid } });
			return { ok: true, squareMid, result };
		});
	},
	format(value) {
		return `Left ${(value as { squareMid: string }).squareMid}`;
	},
};

const createCommand: CommandSpec = {
	name: "square create",
	summary: "Create a new OpenChat square.",
	category: "OpenChat (Square)",
	options: [
		{ name: "name", type: "string", valueName: "name", description: "Square name." },
		{
			name: "display-name",
			type: "string",
			valueName: "name",
			description: "Your display name in the square.",
		},
		{ name: "description", type: "string", valueName: "text", description: "Square description." },
		{ name: "searchable", type: "boolean", description: "Allow search (default: true)." },
		{ name: "cover", type: "string", valueName: "obsHash", description: "Cover image OBS hash." },
	],
	examples: ["line square create --name 'My square' --description 'Hello'"],
	auth: true,
	async run(context) {
		const name = context.requireString("name", "Missing --name");
		return await withClient(context, async ({ base }) => {
			const result = await base.square.createSquare({
				squareName: name,
				displayName: context.getString("display-name") ?? base.profile?.displayName ?? "linejs",
				description: context.getString("description"),
				searchable: context.getBool("searchable", true),
				profileImageObsHash: context.getString("cover"),
			});
			return { ok: true, result };
		});
	},
	format(value) {
		const result = (value as { result: Record<string, unknown> }).result;
		const square = result.square as Record<string, unknown> | undefined;
		return `Created square ${String(square?.mid ?? JSON.stringify(serialize(result)))}`;
	},
};

const searchCommand: CommandSpec = {
	name: "square search",
	summary: "Search OpenChat squares.",
	category: "OpenChat (Square)",
	args: [{ name: "query", description: "Search query.", required: true }],
	options: [limitOption(20)],
	examples: ["line square search 'music'"],
	auth: true,
	async run(context) {
		const query = context.requireArg(0, "query");
		const limit = context.getNumber("limit") ?? 20;
		return await withClient(context, async ({ base }) => {
			const result = await base.square.searchSquares({
				request: { query, continuationToken: "", limit },
			});
			return result;
		});
	},
	format(value) {
		const result = value as { squares?: Array<Record<string, unknown>> };
		if (!result.squares?.length) return "No squares found.";
		return result.squares
			.map((square) => `${String(square.mid ?? "")}  ${String(square.name ?? "")}`)
			.join("\n");
	},
};

const eventsCommand: CommandSpec = {
	name: "square events",
	summary: "Fetch recent events (and messages) for an OpenChat chat.",
	category: "OpenChat (Square)",
	args: [{ name: "squareChatMid", description: "Square chat MID.", required: true }],
	options: [limitOption(50)],
	examples: ["line square events mxxxxxxxx -n 50"],
	auth: true,
	async run(context) {
		const squareChatMid = context.requireArg(0, "squareChatMid");
		const limit = context.getNumber("limit") ?? 50;
		return await withClient(context, async ({ base, client }) => {
			const response = await base.square.fetchSquareChatEvents({ squareChatMid, limit });
			const messages: SquareMessage[] = [];
			for (const event of response.events) {
				const raw =
					event.type === "SEND_MESSAGE"
						? event.payload.sendMessage?.squareMessage
						: event.type === "RECEIVE_MESSAGE"
							? event.payload.receiveMessage?.squareMessage
							: undefined;
				if (!raw) continue;
				try {
					messages.push(SquareMessage.fromRawTalk(raw as never, client));
				} catch {}
			}
			return {
				syncToken: response.syncToken,
				events: response.events,
				messages: messages.map((message) => squareMessageSummary(message, context.json)),
			};
		});
	},
	format(value) {
		const result = value as { messages: Array<Record<string, unknown>> };
		if (!result.messages.length) return "No messages.";
		return result.messages
			.map(
				(message) =>
					`[${String(message.createdTime ?? "")}] ${String(message.from ?? "")}: ${String(
						message.text ?? `(${String(message.contentType ?? "message")})`,
					)}`,
			)
			.join("\n");
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

const messageDataCommand: CommandSpec = {
	name: "square message-data",
	summary: "Download media attached to an OpenChat message.",
	category: "OpenChat (Square)",
	args: [
		{ name: "squareChatMid", description: "Square chat MID.", required: true },
		{ name: "messageId", description: "Message id.", required: true },
	],
	options: [
		{
			name: "out",
			type: "string",
			valueName: "path",
			description: "Output file (default: square-<id>.<ext>).",
		},
		{
			name: "preview",
			type: "boolean",
			description: "Download the preview instead of the original.",
		},
		limitOption(100),
	],
	examples: ["line square message-data mxxxxxxxx 123 --out ./photo.jpg"],
	auth: true,
	async run(context) {
		const squareChatMid = context.requireArg(0, "squareChatMid");
		const messageId = context.requireArg(1, "messageId");
		const limit = context.getNumber("limit") ?? 100;
		return await withClient(context, async ({ base, client }) => {
			const response = await base.square.fetchSquareChatEvents({ squareChatMid, limit });
			let target: SquareMessage | undefined;
			for (const event of response.events) {
				const raw =
					event.type === "SEND_MESSAGE"
						? event.payload.sendMessage?.squareMessage
						: event.type === "RECEIVE_MESSAGE"
							? event.payload.receiveMessage?.squareMessage
							: undefined;
				if (!raw) continue;
				const message = SquareMessage.fromRawTalk(raw as never, client);
				if (message.raw.message.id === messageId) {
					target = message;
					break;
				}
			}
			if (!target) {
				throw new CliError(
					"NOT_FOUND",
					`Message ${messageId} was not found in the last ${limit} events`,
					{
						details: { squareChatMid, messageId, limit },
					},
				);
			}
			const blob = await target.getData(context.getBool("preview"));
			const out =
				context.getString("out") ??
				`square-${messageId}.${extensionForMime(blob.type || "application/octet-stream")}`;
			const written = await writeBinaryFile(out, blob, context.settings.cwd);
			return { ok: true, ...written, type: blob.type, messageId, squareChatMid };
		});
	},
	format(value) {
		const result = value as { path: string; size: number; type: string };
		return `Saved ${result.size} bytes (${result.type}) to ${result.path}`;
	},
};

const reactCommand: CommandSpec = {
	name: "square react",
	summary: "React to an OpenChat message.",
	category: "OpenChat (Square)",
	args: [
		{ name: "squareChatMid", description: "Square chat MID.", required: true },
		{ name: "messageId", description: "Message id.", required: true },
		{ name: "reaction", description: "Reaction name or number.", required: true },
	],
	examples: ["line square react mxxxxxxxx 123 NICE"],
	auth: true,
	async run(context) {
		const squareChatMid = context.requireArg(0, "squareChatMid");
		const messageId = context.requireArg(1, "messageId");
		const resolved = resolveReaction(context.requireArg(2, "reaction"));
		const reaction =
			typeof resolved === "number" ? resolved : (enums.MessageReactionType[resolved] as number);
		return await withClient(context, async ({ base }) => {
			const result = await base.square.reactToMessage({
				request: {
					reqSeq: await base.getReqseq("sq"),
					reactionType: reaction,
					messageId,
					squareChatMid,
				},
			} as never);
			return { ok: true, squareChatMid, messageId, reaction, result };
		});
	},
	format(value) {
		const result = value as { messageId: string; reaction: number };
		return `Reacted to ${result.messageId} with ${result.reaction}`;
	},
};

const renameCommand: CommandSpec = {
	name: "square rename",
	summary: "Rename an OpenChat square.",
	category: "OpenChat (Square)",
	args: [
		{ name: "squareMid", description: "Square MID.", required: true },
		{ name: "name", description: "New square name.", required: true },
	],
	examples: ["line square rename sxxxxxxxx 'New name'"],
	auth: true,
	async run(context) {
		const squareMid = context.requireArg(0, "squareMid");
		const name = context.rest(1);
		if (!name) throw new UsageError("Missing square name");
		return await withClient(context, async ({ client }) => {
			const square = await client.getSquare(squareMid);
			const result = await square.updateName(name);
			return { ok: true, squareMid, name, result };
		});
	},
	format(value) {
		return `Renamed ${(value as { squareMid: string }).squareMid}`;
	},
};

const replyMessageCommand: CommandSpec = {
	name: "square message-reply",
	summary: "Reply to an OpenChat message.",
	category: "OpenChat (Square)",
	args: [
		{ name: "squareChatMid", description: "Square chat MID.", required: true },
		{ name: "messageId", description: "Message id.", required: true },
		{ name: "text", description: "Reply text.", required: true, variadic: true },
	],
	examples: ["line square message-reply mxxxxxxxx 123 'Thanks!'"],
	auth: true,
	async run(context) {
		const squareChatMid = context.requireArg(0, "squareChatMid");
		const relatedMessageId = context.requireArg(1, "messageId");
		const text = context.rest(2);
		if (!text) throw new UsageError("Missing reply text");
		return await withClient(context, async ({ base }) => {
			const result = await base.square.sendMessage({
				squareChatMid,
				text,
				relatedMessageId,
			});
			return { ok: true, result };
		});
	},
	format(value) {
		return `Sent OpenChat reply: ${JSON.stringify(serialize((value as { result: unknown }).result))}`;
	},
};

const readMessageCommand: CommandSpec = {
	name: "square message-read",
	summary: "Mark an OpenChat message as read.",
	category: "OpenChat (Square)",
	args: [
		{ name: "squareChatMid", description: "Square chat MID.", required: true },
		{ name: "messageId", description: "Message id.", required: true },
	],
	examples: ["line square message-read mxxxxxxxx 123"],
	auth: true,
	async run(context) {
		const squareChatMid = context.requireArg(0, "squareChatMid");
		const messageId = context.requireArg(1, "messageId");
		return await withClient(context, async ({ base }) => {
			const result = await base.square.markAsRead({
				request: { squareChatMid, messageId, threadMid: "" },
			});
			return { ok: true, squareChatMid, messageId, result };
		});
	},
	format(value) {
		return `Marked ${(value as { messageId: string }).messageId} read`;
	},
};

const unsendMessageCommand: CommandSpec = {
	name: "square message-unsend",
	summary: "Unsend one of your OpenChat messages.",
	category: "OpenChat (Square)",
	args: [
		{ name: "squareChatMid", description: "Square chat MID.", required: true },
		{ name: "messageId", description: "Message id.", required: true },
	],
	examples: ["line square message-unsend mxxxxxxxx 123"],
	auth: true,
	async run(context) {
		const squareChatMid = context.requireArg(0, "squareChatMid");
		const messageId = context.requireArg(1, "messageId");
		return await withClient(context, async ({ base }) => {
			const result = await base.square.unsendMessage({ squareChatMid, messageId });
			return { ok: true, squareChatMid, messageId, result };
		});
	},
	format(value) {
		return `Unsents ${(value as { messageId: string }).messageId}`;
	},
};

const destroyMessageCommand: CommandSpec = {
	name: "square message-destroy",
	summary: "Destroy an OpenChat message (moderation).",
	category: "OpenChat (Square)",
	args: [
		{ name: "squareChatMid", description: "Square chat MID.", required: true },
		{ name: "messageId", description: "Message id.", required: true },
	],
	options: [{ name: "yes", type: "boolean", description: "Confirm the destructive action." }],
	examples: ["line square message-destroy mxxxxxxxx 123 --yes"],
	auth: true,
	async run(context) {
		const squareChatMid = context.requireArg(0, "squareChatMid");
		const messageId = context.requireArg(1, "messageId");
		if (!context.getBool("yes"))
			throw new UsageError("Pass --yes to confirm destroying the message");
		return await withClient(context, async ({ base }) => {
			const result = await base.square.destroyMessage({ squareChatMid, messageId });
			return { ok: true, squareChatMid, messageId, result };
		});
	},
	format(value) {
		return `Destroyed ${(value as { messageId: string }).messageId}`;
	},
};

export const squareCommands: CommandSpec[] = [
	listCommand,
	getCommand,
	chatsCommand,
	chatGetCommand,
	chatMembersCommand,
	chatSendCommand,
	chatMediaCommand,
	chatRenameCommand,
	chatInviteCommand,
	chatLeaveCommand,
	joinCommand,
	leaveCommand,
	createCommand,
	searchCommand,
	eventsCommand,
	reactCommand,
	renameCommand,
	replyMessageCommand,
	readMessageCommand,
	unsendMessageCommand,
	destroyMessageCommand,
	messageDataCommand,
];
