import type { MessageReactionType } from "@evex-dev/linejs-types";
import {
	TalkMessage,
	type Chat,
	type Client,
	type Square,
	type SquareChat,
	type SquareMessage,
	type User,
} from "@evex-dev/linejs";
import type { CommandContext } from "../context.ts";
import { CliError, UsageError } from "../errors.ts";
import type { OptionSpec } from "../args.ts";
import { humanValue } from "../output.ts";

export const YES_OPTION: OptionSpec = {
	name: "yes",
	type: "boolean",
	description: "Confirm a destructive action without prompting.",
};

export function limitOption(defaultValue: number): OptionSpec {
	return {
		name: "limit",
		short: "n",
		type: "number",
		valueName: "count",
		description: `Maximum number of results (default: ${defaultValue}).`,
	};
}

export function outOption(description = "Write the result to this file."): OptionSpec {
	return {
		name: "out",
		type: "string",
		valueName: "path",
		description,
	};
}

export function pickString(record: unknown, key: string): string | undefined {
	if (!record || typeof record !== "object") return undefined;
	const value = (record as Record<string, unknown>)[key];
	return typeof value === "string" ? value : undefined;
}

export function pickNumber(record: unknown, key: string): number | undefined {
	if (!record || typeof record !== "object") return undefined;
	const value = (record as Record<string, unknown>)[key];
	return typeof value === "number" ? value : undefined;
}

export function asRecord(value: unknown): Record<string, unknown> {
	return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

/**
 * User (1:1) mids start with "u". `talk.getChat` only serves group/room
 * chats, so user mids must go through the message-box APIs instead.
 */
export function isUserMid(mid: string): boolean {
	return mid.startsWith("u");
}

export function userChatSummary(mid: string): Record<string, unknown> {
	return {
		mid,
		type: "USER",
	};
}

/**
 * Fetch recent talk messages for a 1:1 (user) mid via the message-box APIs.
 * Group/room mids keep using `Chat.fetchMessages`; this is the user-mid
 * counterpart that `client.getChat` cannot serve.
 */
export async function fetchUserTalkMessages(
	client: Client,
	userMid: string,
	limit: number,
): Promise<TalkMessage[]> {
	const boxes = await client.base.talk.getMessageBoxes({
		messageBoxListRequest: {},
	});
	const box = boxes.messageBoxes.find((entry) => entry.id === userMid);
	if (!box) {
		throw new CliError("NOT_FOUND", `Message box ${userMid} was not found`, {
			details: {
				chatMid: userMid,
				hint: "Open the 1:1 chat once in an official client, then retry.",
			},
		});
	}
	const raws = await client.base.talk.getPreviousMessagesV2WithRequest({
		request: {
			messageBoxId: box.id,
			endMessageId: {
				messageId: box.lastDeliveredMessageId.messageId,
				deliveredTime: box.lastDeliveredMessageId.deliveredTime,
			},
			messagesCount: limit,
		},
	});
	return await Promise.all(raws.map((raw) => TalkMessage.fromRawTalk(raw, client)));
}

/**
 * Fetch recent talk messages for any talk mid. User (1:1) mids go through
 * the message-box path; group/room mids keep the existing `getChat` path.
 */
export async function fetchTalkMessages(
	client: Client,
	chatMid: string,
	limit: number,
): Promise<TalkMessage[]> {
	if (!isUserMid(chatMid)) {
		const chat = await client.getChat(chatMid);
		return chat.fetchMessages(limit);
	}
	return fetchUserTalkMessages(client, chatMid, limit);
}

export function chatSummary(chat: Chat, includeRaw = false): Record<string, unknown> {
	const raw = asRecord(chat.raw);
	return {
		mid: chat.mid,
		name: chat.name,
		type: raw.type,
		memberCount: raw.memberCount ?? raw.extra,
		notificationDisabled: raw.notificationDisabled,
		picturePath: raw.picturePath,
		createdTime: raw.createdTime,
		...(includeRaw ? { raw: chat.raw } : {}),
	};
}

export function userSummary(user: User, includeRaw = false): Record<string, unknown> {
	const profile = asRecord(asRecord(user.raw).targetProfileDetail);
	const status = asRecord(profile.statusMessage);
	return {
		mid: user.mid,
		displayName: profile.profileName,
		statusMessage: status.value,
		pictureStatus: profile.pictureStatus,
		picturePath: profile.picturePath,
		musicProfile: profile.musicProfile,
		hiddenFromList: profile.hiddenFromList,
		...(includeRaw ? { raw: user.raw } : {}),
	};
}

export function squareSummary(square: Square, includeRaw = false): Record<string, unknown> {
	return {
		mid: square.mid,
		name: square.name,
		joinMethod: square.raw.joinMethod,
		state: square.raw.state,
		...(includeRaw ? { raw: square.raw } : {}),
	};
}

export function squareChatSummary(
	squareChat: SquareChat,
	includeRaw = false,
): Record<string, unknown> {
	return {
		mid: squareChat.mid,
		name: squareChat.name,
		squareMid: squareChat.raw.squareMid,
		type: squareChat.raw.type,
		state: squareChat.raw.state,
		maxMemberCount: squareChat.raw.maxMemberCount,
		...(includeRaw ? { raw: squareChat.raw } : {}),
	};
}

export function talkMessageSummary(
	message: TalkMessage,
	includeRaw = false,
): Record<string, unknown> {
	const raw = asRecord(message.raw);
	return {
		id: raw.id,
		chatMid: message.to.id,
		from: message.from.id,
		to: message.to.id,
		toType: raw.toType,
		contentType: raw.contentType,
		text: message.text,
		createdTime: raw.createdTime,
		deliveredTime: raw.deliveredTime,
		relatedMessageId: raw.relatedMessageId,
		isEdited: message.isEdited,
		updatedTime: message.updatedTime,
		...(includeRaw ? { raw: message.raw } : {}),
	};
}

export function squareMessageSummary(
	message: SquareMessage,
	includeRaw = false,
): Record<string, unknown> {
	const raw = asRecord(message.raw);
	const inner = asRecord(raw.message);
	return {
		id: inner.id,
		chatMid: message.to.id,
		from: message.from.id,
		fromType: raw.fromType,
		contentType: inner.contentType,
		text: message.text,
		createdTime: inner.createdTime,
		deliveredTime: inner.deliveredTime,
		relatedMessageId: inner.relatedMessageId,
		...(includeRaw ? { raw: message.raw } : {}),
	};
}

export function resolveReaction(value: string): MessageReactionType {
	const normalized = value.trim().toUpperCase();
	if (/^[0-7]$/.test(normalized)) return Number(normalized) as MessageReactionType;
	const allowed = ["ALL", "UNDO", "NICE", "LOVE", "FUN", "AMAZING", "SAD", "OMG"] as const;
	if ((allowed as readonly string[]).includes(normalized)) {
		return normalized as MessageReactionType;
	}
	throw new UsageError(`Unknown reaction: ${value} (expected ${allowed.join(", ")})`);
}

const CONTENT_TYPES = [
	"NONE",
	"IMAGE",
	"VIDEO",
	"AUDIO",
	"HTML",
	"PDF",
	"CALL",
	"STICKER",
	"PRESENCE",
	"GIFT",
	"GROUPBOARD",
	"APPLINK",
	"LINK",
	"CONTACT",
	"FILE",
	"LOCATION",
	"POSTNOTIFICATION",
	"RICH",
	"CHATEVENT",
	"MUSIC",
	"PAYMENT",
] as const;

export function resolveContentType(value: string | undefined): string | undefined {
	if (value === undefined) return undefined;
	const normalized = value.toUpperCase();
	if (!(CONTENT_TYPES as readonly string[]).includes(normalized)) {
		throw new UsageError(`Unknown content type: ${value}`);
	}
	return normalized;
}

export function requireJsonObject<T>(context: CommandContext, option: string): T | undefined {
	const value = context.getJson<T>(option);
	if (value === undefined) return undefined;
	if (!value || typeof value !== "object" || Array.isArray(value)) {
		throw new UsageError(`--${option} must be a JSON object`);
	}
	return value;
}

export function requireStringRecord(
	context: CommandContext,
	option: string,
): Record<string, string> | undefined {
	const value = requireJsonObject<Record<string, unknown>>(context, option);
	if (value === undefined) return undefined;
	const output: Record<string, string> = {};
	for (const [key, entry] of Object.entries(value)) {
		if (typeof entry !== "string") {
			throw new UsageError(`--${option}.${key} must be a string`);
		}
		output[key] = entry;
	}
	return output;
}

export function joinOrEmpty(values: readonly string[] | undefined): string {
	return values?.length ? values.join(", ") : "";
}

export function printOk(context: CommandContext, message: string): Record<string, unknown> {
	if (!context.json) context.output.writeLine(message);
	return { ok: true };
}

export function summaryLine(values: Record<string, unknown>): string {
	return Object.entries(values)
		.filter(([, value]) => value !== undefined && value !== "" && value !== null)
		.map(([key, value]) => `${key}=${humanValue(value)}`)
		.join(" ");
}
