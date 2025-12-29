import {
	ContentType,
	enums,
	Location,
	type MessageReactionType,
	type SquareEvent,
	type SquareEventNotificationThreadMessage,
	type SquareMessage as Message,
} from "@evex/linejs-types";
import { Thrift } from "@evex/linejs-types/thrift";
import type { Client } from "../../client.ts";
import type {
	EmojiMeta,
	FileMeta,
	FlexMeta,
	MentionMeta,
	StickerMetadata,
} from "./internal-types.ts";
import type { DecorationsData, MentionTarget, Mid } from "./types.ts";
import { InternalError } from "../../../base/core/mod.ts";

const hasContents = ["IMAGE", "VIDEO", "AUDIO", "FILE"];
export interface SquareThreadMessageInit {
	client: Client;
	raw: SquareEventNotificationThreadMessage;
}

export interface SquareMessageInit {
	client: Client;
	raw: Message;
}

/**
 * A message for OpenChat.
 */
export class SquareMessage {
	#client: Client;
	raw: Message;

	readonly isSquare = true;
	readonly isTalk = false;
	#authorIsMe?: boolean;

	constructor(init: SquareMessageInit) {
		this.#client = init.client;
		this.raw = init.raw;
	}

	/**
	 * Replys to message.
	 */
	async reply(
		input: string | {
			text?: string;
			contentType?: ContentType;
			contentMetadata?: Record<string, string>;
			relatedMessageId?: string;
			location?: Location;
		},
	): Promise<void> {
		if (typeof input === "string") {
			return this.reply({
				text: input,
			});
		}

		await this.#client.base.square.sendMessage({
			relatedMessageId: this.raw.message.id,
			squareChatMid: this.raw.message.to,
			text: input.text,
		});
	}

	/**
	 * Sends to message.
	 */
	async send(
		input: string | {
			text?: string;
			contentType?: ContentType;
			contentMetadata?: Record<string, string>;
			relatedMessageId?: string;
			location?: Location;
		},
	): Promise<void> {
		if (typeof input === "string") {
			return this.reply({
				text: input,
			});
		}

		await this.#client.base.square.sendMessage({
			relatedMessageId: this.raw.message.id,
			squareChatMid: this.raw.message.to,
			text: input.text,
		});
	}
	/**
	 * Reacts to message.
	 * @param type Reaction type
	 */
	async react(type: MessageReactionType): Promise<void> {
		if (typeof type === "string") {
			type = enums.MessageReactionType[
				type
			] as MessageReactionType & number;
		}
		await this.#client.base.square.reactToMessage({
			request: {
				reqSeq: 0,
				reactionType: type,
				messageId: this.raw.message.id,
				squareChatMid: this.to.id,
			},
		});
	}

	/**
	 * Read the message.
	 */
	async read(): Promise<void> {
		await this.#client.base.square.markAsRead({
			request: {
				messageId: this.raw.message.id,
				squareChatMid: this.to.id,
			},
		});
	}

	/**
	 * Pins the message.
	 */
	async announce() {
		if (!this.raw.message.text) {
			throw new TypeError("The message is not text message.");
		}
		await this.#client.base.square.createSquareChatAnnouncement({
			squareChatMid: this.to.id,
			senderMid: this.from.id,
			messageId: this.raw.message.id,
			text: this.raw.message.text,
			createdAt: this.raw.message.createdTime,
		});
	}

	/**
	 * Unsends the message.
	 */
	async unsend() {
		if (!this.isMyMessage) {
			throw new TypeError(
				"Cannot unsend the message which is not yours.",
			);
		}
		await this.#client.base.square.unsendMessage({
			messageId: this.raw.message.id,
			squareChatMid: this.to.id,
		});
	}

	/**
	 * Deletes the message.
	 */
	async delete() {
		await this.#client.base.square.destroyMessage({
			messageId: this.raw.message.id,
			squareChatMid: this.to.id,
		});
	}

	/**
	 * Gets sticker URL.
	 * @returns Stamp URL
	 */
	getStickerURL(): string {
		if (this.raw.message.contentType !== "STICKER") {
			throw new TypeError("The message is not sticker.");
		}
		const stickerMetadata = this.raw.message
			.contentMetadata as unknown as StickerMetadata;
		if (stickerMetadata.STKOPT === "A") {
			return `https://stickershop.line-scdn.net/stickershop/v1/sticker/${stickerMetadata.STKID}/android/sticker_animation.png`;
		} else {
			return `https://stickershop.line-scdn.net/stickershop/v1/sticker/${stickerMetadata.STKID}/android/sticker.png`;
		}
	}

	/**
	 * Collects emoji URLs in the message.
	 * @returns URLs of emoji
	 */
	collectEmojiURLs(): string[] {
		if (this.raw.message.contentType !== "NONE") {
			throw new TypeError("The message is not text message.");
		}
		const emojiUrls: string[] = [];
		const emojiData = this.raw.message
			.contentMetadata;
		const replace = emojiData?.REPLACE
			? JSON.parse(emojiData?.REPLACE) as EmojiMeta["REPLACE"]
			: undefined;
		const emojiResources = replace?.sticon?.resources ?? [];
		for (const emoji of emojiResources) {
			emojiUrls.push(
				`https://stickershop.line-scdn.net/sticonshop/v1/sticon/${emoji.productId}/android/${emoji.sticonId}.png`,
			);
		}
		return emojiUrls;
	}

	/**
	 * Gets mentions in the message.
	 */
	getMentions(): MentionTarget[] {
		const content = this.#content;
		if (content.type !== "NONE") {
			throw new TypeError("Message has no text.");
		}
		const mentionees: MentionTarget[] = [];
		const mentionData = content.metadata;
		const mention = mentionData?.MENTION
			? JSON.parse(mentionData.MENTION) as MentionMeta["MENTION"]
			: undefined;
		const mentions = mention?.MENTIONEES ?? [];
		for (const mention of mentions) {
			mentionees.push(
				mention.A
					? {
						all: true,
					}
					: {
						all: false,
						mid: mention.M as string,
					},
			);
		}
		return mentionees;
	}

	/**
	 * Gets text decorations (emoji, mention)
	 */
	getTextDecorations(): DecorationsData[] {
		// TODO: refeactering is needed
		const content = this.#content;
		if (content.type !== "NONE") {
			throw new TypeError("Message has no text.");
		}
		const texts: DecorationsData[] = [];
		const splits: {
			start: number;
			end: number;
			mention?: number;
			emoji?: number;
		}[] = [];
		const mentionData = content.metadata;
		const emojiData = content.metadata;
		const mention = mentionData?.MENTION
			? JSON.parse(mentionData.MENTION) as MentionMeta["MENTION"]
			: undefined;
		const mentions = mention?.MENTIONEES ?? [];
		mentions.forEach((e, i) => {
			splits.push({
				start: parseInt(e.S),
				end: parseInt(e.E),
				mention: i,
			});
		});
		const replace = emojiData?.REPLACE
			? JSON.parse(emojiData?.REPLACE) as EmojiMeta["REPLACE"]
			: undefined;
		const emojiResources = replace?.sticon?.resources ?? [];
		emojiResources.forEach((e, i) => {
			splits.push({ start: e.S, end: e.E, emoji: i });
		});
		let lastSplit = 0;
		splits
			.sort((a, b) => a.start - b.start)
			.forEach((e) => {
				if (lastSplit - e.start) {
					texts.push({
						text: this.raw.message.text?.substring(
							lastSplit,
							e.start,
						) as string,
					});
				}
				const content: DecorationsData = {
					text: this.raw.message.text?.substring(e.start, e.end),
				};
				if (typeof e.emoji === "number") {
					const emoji = emojiResources[e.emoji];
					const url =
						`https://stickershop.line-scdn.net/sticonshop/v1/sticon/${emoji.productId}/android/${emoji.sticonId}.png`;
					content.emoji = {
						...emoji,
						url,
					};
				} else if (typeof e.mention === "number") {
					const _mention = mentionData?.MENTION
						? JSON.parse(mentionData.MENTION) as MentionMeta["MENTION"]
						: undefined;
					const mentions = _mention?.MENTIONEES ?? [];
					const mention = mentions[e.mention];
					content.mention = mention.M
						? { mid: mention.M }
						: { all: !!mention.A };
				}
				texts.push(content);
				lastSplit = e.end;
			});
		texts.push({
			text: this.raw.message.text?.substring(lastSplit) as string,
		});
		return texts;
	}

	/**
	 * Gets flex from the message.
	 */
	getFlex(): {
		flexJson: Record<string, unknown>;
		altText: string;
		ver: string;
		tag: string | undefined;
	} {
		const content = this.#content;
		if (content.type !== "FLEX") {
			throw new TypeError("The message has no flex items.");
		}
		const flexData = content.metadata as unknown as FlexMeta;
		return {
			flexJson: flexData.FLEX_JSON,
			altText: flexData.ALT_TEXT,
			ver: flexData.FLEX_VER,
			tag: flexData.EFFECT_TAG,
		};
	}

	/**
	 * Gets reply target.
	 * If the message is reply, returns reply target id.
	 */
	getReplyTarget(): UnresolvedMessage | null {
		if (
			this.raw.message.relatedMessageId &&
			(this.raw.message.messageRelationType === 3 ||
				this.raw.message.messageRelationType === "REPLY")
		) {
			return new UnresolvedMessage(
				this.raw.message.relatedMessageId,
				this.#client,
			);
		}
		return null;
	}

	/**
	 * Get file info.
	 */
	getFileInfo(): {
		size: number;
		expire: Date;
		name: string;
	} {
		const content = this.#content;
		if (content.type !== "FILE") {
			throw new TypeError("The message does not provide any files.");
		}
		const fileData = content.metadata as unknown as FileMeta;
		return {
			size: parseInt(fileData.FILE_SIZE),
			expire: new Date(parseInt(fileData.FILE_EXPIRE_TIMESTAMP) * 1000),
			name: fileData.FILE_NAME,
		};
	}

	/**
	 * @return {Blob} message data
	 */
	async getData(preview?: boolean): Promise<Blob> {
		if (!hasContents.includes(this.raw.message.contentType as string)) {
			throw new TypeError(
				"message have no contents",
			);
		}
		if (this.raw.message.contentMetadata.DOWNLOAD_URL) {
			if (preview) {
				const r = await this.#client.base
					.fetch(this.raw.message.contentMetadata.PREVIEW_URL);
				return await r.blob();
			} else {
				const r_1 = await this.#client.base
					.fetch(this.raw.message.contentMetadata.DOWNLOAD_URL);
				return await r_1.blob();
			}
		}
		return this.#client.base.obs.downloadMessageData({
			messageId: this.raw.message.id,
			isPreview: preview,
			isSquare: true,
		});
	}

	public async isMyMessage(): Promise<boolean> {
		if (typeof this.#authorIsMe === "boolean") {
			return this.#authorIsMe;
		}
		this.#authorIsMe = this.from.id ===
			(await this.#client.base.square.getSquareChat({
				squareChatMid: this.to.id,
			})).squareChatMember.squareMemberMid;
		return this.#authorIsMe;
	}

	get to(): Mid {
		const { message } = this.raw;
		return {
			type: message.toType,
			id: message.to,
		};
	}
	get from(): Mid {
		const { message } = this.raw;
		return {
			type: this.raw.fromType,
			id: message.from,
		};
	}
	get #content() {
		return {
			type: this.raw.message.contentType,
			metadata: this.raw.message.contentMetadata,
		};
	}
	get text(): string {
		return this.raw.message.text;
	}

	static fromSource(source: SquareEvent, client: Client): SquareMessage {
		return new SquareMessage({
			client,
			raw: source.payload.notificationMessage.squareMessage,
		});
	}
	static fromRawTalk(raw: Message, client: Client): SquareMessage {
		return new SquareMessage({
			client,
			raw,
		});
	}
}

export class SquareThreadMessage {
	#client: Client;
	raw: SquareEventNotificationThreadMessage;
	readonly isSquare = true;
	readonly isTalk = false;
	#authorIsMe?: boolean;

	constructor(init: SquareThreadMessageInit) {
		this.#client = init.client;
		this.raw = init.raw;
	}

	/**
	 * Replys to message.
	 */
	async reply(
		input: {
			text?: string;
			contentType?: ContentType;
			contentMetadata?: Record<string, string>;
			relatedMessageId?: string;
			location?: Location;
		},
	): Promise<void> {
		if (typeof input === "string") {
			return this.reply({
				text: input,
			});
		}

		await this.#sendSquareThreadMessage({
			...input,
			relatedMessageId: input.relatedMessageId ??
				this.raw.squareMessage.message.id,
		});
	}

	/**
	 * Sends to message.
	 */
	async send(
		input: string | {
			text?: string;
			contentType?: ContentType;
			contentMetadata?: Record<string, string>;
			relatedMessageId?: string;
			location?: Location;
		},
	): Promise<void> {
		if (typeof input === "string") {
			return this.send({
				text: input,
			});
		}
		await this.#sendSquareThreadMessage(input);
	}

	async #sendSquareThreadMessage(
		input: {
			text?: string;
			contentType?: ContentType;
			contentMetadata?: Record<string, string>;
			relatedMessageId?: string;
			location?: Location;
		},
	): Promise<void> {
		await this.#client.base.square.sendSquareThreadMessage({
			request: {
				reqSeq: await this.#client.base.getReqseq("sq"),
				chatMid: this.raw.chatMid,
				threadMid: this.raw.threadMid,
				threadMessage: {
					message: {
						to: this.raw.squareMessage.message.to,
						text: input.text,
						contentType: "NONE",
						toType: "SQUARE_THREAD",
						...input.relatedMessageId
							? {
								relatedMessageId: input.relatedMessageId,
								relatedMessageServiceCode: "SQUARE",
								messageRelationType: "REPLY",
							}
							: {},
					},
				},
			},
		});
	}

	/**
	 * Reacts to message.
	 * @param type Reaction type
	 */
	async react(type: MessageReactionType): Promise<void> {
		if (typeof type === "string") {
			type = enums.MessageReactionType[
				type
			] as MessageReactionType & number;
		}
		await this.#client.base.square.reactToMessage({
			request: {
				reqSeq: 0,
				reactionType: type,
				messageId: this.raw.squareMessage.message.id,
				squareChatMid: this.raw.chatMid,
				threadMid: this.raw.threadMid,
			},
		});
	}

	/**
	 * Read the message.
	 */
	async read(): Promise<void> {
		await this.#client.base.square.markThreadsAsRead({
			request: {
				chatMid: this.raw.chatMid,
			},
		});
	}

	/**
	 * Pins the message.
	 */
	async announce() {
		throw new Error("Method not implemented.");
		// if (!this.raw.squareMessage.message.text) {
		// 	throw new TypeError("The message is not text message.");
		// }
		// await this.#client.base.square.createSquareChatAnnouncement({
		// 	squareChatMid: this.to.id,
		// 	senderMid: this.from.id,
		// 	messageId: this.raw.squareMessage.message.id,
		// 	text: this.raw.squareMessage.message.text,
		// 	createdAt: this.raw.squareMessage.message.createdTime,
		// });
	}

	/**
	 * Unsends the message.
	 */
	async unsend() {
		if (!this.isMyMessage) {
			throw new TypeError(
				"Cannot unsend the message which is not yours.",
			);
		}
		await this.#client.base.square.unsendMessage({
			messageId: this.raw.squareMessage.message.id,
			squareChatMid: this.raw.chatMid,
			threadMid: this.raw.threadMid,
		});
	}

	/**
	 * Deletes the message.
	 */
	async delete() {
		await this.#client.base.square.destroyMessage({
			messageId: this.raw.squareMessage.message.id,
			squareChatMid: this.raw.chatMid,
			threadMid: this.raw.threadMid,
		});
	}

	/**
	 * Gets sticker URL.
	 * @returns Stamp URL
	 */
	getStickerURL(): string {
		if (this.raw.squareMessage.message.contentType !== "STICKER") {
			throw new TypeError("The message is not sticker.");
		}
		const stickerMetadata = this.raw.squareMessage.message
			.contentMetadata as unknown as StickerMetadata;
		if (stickerMetadata.STKOPT === "A") {
			return `https://stickershop.line-scdn.net/stickershop/v1/sticker/${stickerMetadata.STKID}/android/sticker_animation.png`;
		} else {
			return `https://stickershop.line-scdn.net/stickershop/v1/sticker/${stickerMetadata.STKID}/android/sticker.png`;
		}
	}

	/**
	 * Collects emoji URLs in the message.
	 * @returns URLs of emoji
	 */
	collectEmojiURLs(): string[] {
		if (this.raw.squareMessage.message.contentType !== "NONE") {
			throw new TypeError("The message is not text message.");
		}
		const emojiUrls: string[] = [];
		const emojiData = this.raw.squareMessage.message
			.contentMetadata;
		const replace = emojiData?.REPLACE
			? JSON.parse(emojiData?.REPLACE) as EmojiMeta["REPLACE"]
			: undefined;
		const emojiResources = replace?.sticon?.resources ?? [];
		for (const emoji of emojiResources) {
			emojiUrls.push(
				`https://stickershop.line-scdn.net/sticonshop/v1/sticon/${emoji.productId}/android/${emoji.sticonId}.png`,
			);
		}
		return emojiUrls;
	}

	/**
	 * Gets mentions in the message.
	 */
	getMentions(): MentionTarget[] {
		const content = this.#content;
		if (content.type !== "NONE") {
			throw new TypeError("Message has no text.");
		}
		const mentionees: MentionTarget[] = [];
		const mentionData = content.metadata;
		const mention = mentionData?.MENTION
			? JSON.parse(mentionData.MENTION) as MentionMeta["MENTION"]
			: undefined;
		const mentions = mention?.MENTIONEES ?? [];
		for (const mention of mentions) {
			mentionees.push(
				mention.A
					? {
						all: true,
					}
					: {
						all: false,
						mid: mention.M as string,
					},
			);
		}
		return mentionees;
	}

	/**
	 * Gets text decorations (emoji, mention)
	 */
	getTextDecorations(): DecorationsData[] {
		// TODO: refeactering is needed
		const content = this.#content;
		if (content.type !== "NONE") {
			throw new TypeError("Message has no text.");
		}
		const texts: DecorationsData[] = [];
		const splits: {
			start: number;
			end: number;
			mention?: number;
			emoji?: number;
		}[] = [];
		const mentionData = content.metadata;
		const emojiData = content.metadata;
		const mention = mentionData?.MENTION
			? JSON.parse(mentionData.MENTION) as MentionMeta["MENTION"]
			: undefined;
		const mentions = mention?.MENTIONEES ?? [];
		mentions.forEach((e, i) => {
			splits.push({
				start: parseInt(e.S),
				end: parseInt(e.E),
				mention: i,
			});
		});
		const replace = emojiData?.REPLACE
			? JSON.parse(emojiData?.REPLACE) as EmojiMeta["REPLACE"]
			: undefined;
		const emojiResources = replace?.sticon?.resources ?? [];
		emojiResources.forEach((e, i) => {
			splits.push({ start: e.S, end: e.E, emoji: i });
		});
		let lastSplit = 0;
		splits
			.sort((a, b) => a.start - b.start)
			.forEach((e) => {
				if (lastSplit - e.start) {
					texts.push({
						text: this.raw.squareMessage.message.text?.substring(
							lastSplit,
							e.start,
						) as string,
					});
				}
				const content: DecorationsData = {
					text: this.raw.squareMessage.message.text?.substring(e.start, e.end),
				};
				if (typeof e.emoji === "number") {
					const emoji = emojiResources[e.emoji];
					const url =
						`https://stickershop.line-scdn.net/sticonshop/v1/sticon/${emoji.productId}/android/${emoji.sticonId}.png`;
					content.emoji = {
						...emoji,
						url,
					};
				} else if (typeof e.mention === "number") {
					const _mention = mentionData?.MENTION
						? JSON.parse(mentionData.MENTION) as MentionMeta["MENTION"]
						: undefined;
					const mentions = _mention?.MENTIONEES ?? [];
					const mention = mentions[e.mention];
					content.mention = mention.M
						? { mid: mention.M }
						: { all: !!mention.A };
				}
				texts.push(content);
				lastSplit = e.end;
			});
		texts.push({
			text: this.raw.squareMessage.message.text?.substring(lastSplit) as string,
		});
		return texts;
	}

	/**
	 * Gets flex from the message.
	 */
	getFlex(): {
		flexJson: Record<string, unknown>;
		altText: string;
		ver: string;
		tag: string | undefined;
	} {
		const content = this.#content;
		if (content.type !== "FLEX") {
			throw new TypeError("The message has no flex items.");
		}
		const flexData = content.metadata as unknown as FlexMeta;
		return {
			flexJson: flexData.FLEX_JSON,
			altText: flexData.ALT_TEXT,
			ver: flexData.FLEX_VER,
			tag: flexData.EFFECT_TAG,
		};
	}

	/**
	 * Gets reply target.
	 * If the message is reply, returns reply target id.
	 */
	getReplyTarget(): UnresolvedMessage | null {
		if (
			this.raw.squareMessage.message.relatedMessageId &&
			(this.raw.squareMessage.message.messageRelationType === 3 ||
				this.raw.squareMessage.message.messageRelationType === "REPLY")
		) {
			return new UnresolvedMessage(
				this.raw.squareMessage.message.relatedMessageId,
				this.#client,
			);
		}
		return null;
	}

	/**
	 * Get file info.
	 */
	getFileInfo(): {
		size: number;
		expire: Date;
		name: string;
	} {
		const content = this.#content;
		if (content.type !== "FILE") {
			throw new TypeError("The message does not provide any files.");
		}
		const fileData = content.metadata as unknown as FileMeta;
		return {
			size: parseInt(fileData.FILE_SIZE),
			expire: new Date(parseInt(fileData.FILE_EXPIRE_TIMESTAMP) * 1000),
			name: fileData.FILE_NAME,
		};
	}
	/**
	 * @return {Blob} message data
	 */
	async getData(preview?: boolean): Promise<Blob> {
		if (
			!hasContents.includes(
				this.raw.squareMessage.message.contentType as string,
			)
		) {
			throw new TypeError(
				"message have no contents",
			);
		}
		if (this.raw.squareMessage.message.contentMetadata.DOWNLOAD_URL) {
			if (preview) {
				const r = await this.#client.base
					.fetch(this.raw.squareMessage.message.contentMetadata.PREVIEW_URL);
				return await r.blob();
			} else {
				const r_1 = await this.#client.base
					.fetch(this.raw.squareMessage.message.contentMetadata.DOWNLOAD_URL);
				return await r_1.blob();
			}
		}
		return this.#client.base.obs.downloadMessageData({
			messageId: this.raw.squareMessage.message.id,
			isPreview: preview,
			isSquare: true,
		});
	}
	public async isMyMessage(): Promise<boolean> {
		if (typeof this.#authorIsMe === "boolean") {
			return this.#authorIsMe;
		}
		this.#authorIsMe = this.from.id ===
			(await this.#client.base.square.getSquareChat({
				squareChatMid: this.raw.chatMid,
			})).squareChatMember.squareMemberMid;
		return this.#authorIsMe;
	}
	get to(): Mid {
		const { message } = this.raw.squareMessage;
		return {
			type: message.toType,
			id: message.to,
		};
	}
	get from(): Mid {
		const message = this.raw.squareMessage.message;
		return {
			type: message.toType,
			id: message.from,
		};
	}
	get #content() {
		return {
			type: this.raw.squareMessage.message.contentType,
			metadata: this.raw.squareMessage.message.contentMetadata,
		};
	}
	get text(): string {
		return this.raw.squareMessage.message.text;
	}

	static fromSource(source: SquareEvent, client: Client): SquareThreadMessage {
		return new SquareThreadMessage({
			client,
			raw: source.payload.notificationThreadMessage,
		});
	}
	static fromRawTalk(
		raw: SquareEventNotificationThreadMessage,
		client: Client,
	): SquareThreadMessage {
		return new SquareThreadMessage({
			client,
			raw,
		});
	}
}

export class UnresolvedMessage {
	readonly id: string;
	constructor(id: string, client: Client) {
		this.id = id;
	}
}
