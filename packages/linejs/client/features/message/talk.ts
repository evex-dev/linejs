import {
	ContentType,
	enums,
	Location,
	type Message,
	type MessageReactionType,
} from "@evex/linejs-types";
import type { Client } from "../../client.ts";

import type {
	ContactMeta,
	EmojiMeta,
	FileMeta,
	FlexMeta,
	MentionMeta,
	StickerMetadata,
} from "./internal-types.ts";
import type { DecorationsData, MentionTarget, Mid } from "./types.ts";
import { InternalError } from "../../../base/core/mod.ts";

export interface TalkMessageInit {
	client: Client;
	raw: Message;
}

const hasContents = ["IMAGE", "VIDEO", "AUDIO", "FILE"];

export class TalkMessage {
	#client: Client;
	raw: Message;

	readonly isSquare = false;
	readonly isTalk = true;

	constructor(init: TalkMessageInit) {
		this.#client = init.client;
		this.raw = init.raw;
	}

	/**
	 * Replys to message.
	 */
	async reply(
		input: string | {
			e2ee?: boolean;
			text?: string;
			contentType?: ContentType;
			contentMetadata?: Record<string, string>;
			relatedMessageId?: string;
			location?: Location;
		},
	): Promise<Message> {
		if (typeof input === "string") {
			return this.reply({
				text: input,
			});
		}

		let to: string;
		if (this.to.type === "GROUP" || this.to.type === "ROOM") {
			to = this.to.id; // this.to means it is group.
		} else {
			// Personal chats
			to = this.isMyMessage ? this.to.id : this.from.id;
		}
		return await this.#client.base.talk.sendMessage({
			relatedMessageId: input.relatedMessageId ?? this.raw.id,
			text: input.text,
			to,
			e2ee: input.e2ee,
			contentType: input.contentType,
			contentMetadata: input.contentMetadata,
			location: input.location,
		});
	}

	/**
	 * Sends to message.
	 */
	async send(
		input: string | {
			e2ee?: boolean;
			text?: string;
			contentType?: ContentType;
			contentMetadata?: Record<string, string>;
			relatedMessageId?: string;
			location?: Location;
		},
	): Promise<Message> {
		if (typeof input === "string") {
			return this.send({
				text: input,
			});
		}

		let to: string;
		if (this.to.type === "GROUP" || this.to.type === "ROOM") {
			to = this.to.id; // this.to means it is group.
		} else {
			// Personal chats
			to = this.isMyMessage ? this.to.id : this.from.id;
		}
		return await this.#client.base.talk.sendMessage({
			relatedMessageId: input.relatedMessageId,
			text: input.text,
			to,
			e2ee: input.e2ee,
			contentType: input.contentType,
			contentMetadata: input.contentMetadata,
			location: input.location,
		});
	}

	/**
	 * Reacts to message.
	 */
	async react(type: MessageReactionType): Promise<void> {
		await this.#client.base.talk.react({
			id: BigInt(this.raw.id),
			reaction: type,
		});
	}

	/**
	 * Read the message.
	 */
	async read(): Promise<void> {
		await this.#client.base.talk.sendChatChecked({
			chatMid: this.isMyMessage ? this.to.id : this.from.id,
			lastMessageId: this.raw.id,
			seq: await this.#client.base.getReqseq(),
		});
	}

	/**
	 * Pins the message.
	 */
	async announce() {
		if (!this.raw.text) {
			throw new TypeError("The message is not text message.");
		}
		if (this.to.type !== "ROOM" && this.to.type !== "GROUP") {
			throw new TypeError("Cannot announce out of group.");
		}
		await this.#client.base.talk.createChatRoomAnnouncement({
			chatRoomMid: this.to.id,
			type: "MESSAGE",
			contents: {
				text: this.raw.text,
				link: `line://nv/chatMsg?chatId=${this.to.id}&messageId=${this.raw.id}`,
			},
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
		await this.#client.base.talk.unsendMessage({
			messageId: this.raw.id,
		});
	}

	/**
	 * Gets sticker URL.
	 * @returns Stamp URL
	 */
	getStickerURL(): string {
		if (this.raw.contentType !== "STICKER") {
			throw new TypeError("The message is not sticker.");
		}
		const stickerMetadata = this.raw
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
		if (this.raw.contentType !== "NONE") {
			throw new TypeError("The message is not text message.");
		}
		const emojiUrls: string[] = [];
		const emojiData = this.raw.contentMetadata;
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
						text: this.raw.text?.substring(
							lastSplit,
							e.start,
						) as string,
					});
				}
				const content: DecorationsData = {
					text: this.raw.text?.substring(e.start, e.end),
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
			text: this.raw.text?.substring(lastSplit) as string,
		});
		return texts;
	}

	/**
	 * Gets a shared contact infomation from the message.
	 */
	getSharedContact(): ContactMeta {
		if (this.#content.type !== "CONTACT") {
			throw new TypeError(
				"The message does not share contact infomation.",
			);
		}
		const contactData = this.#content.metadata as unknown as ContactMeta;
		return { mid: contactData.mid, displayName: contactData.displayName };
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
	getReplyTarget(): UnresolvedTalkMessage | null {
		if (
			this.raw.relatedMessageId &&
			(this.raw.messageRelationType === 3 ||
				this.raw.messageRelationType === "REPLY")
		) {
			return new UnresolvedTalkMessage(
				this.raw.relatedMessageId,
				this.#client,
			);
		}
		return null;
	}

	/**
	 * @return {Blob} message data
	 */
	async getData(preview?: boolean): Promise<Blob> {
		if (!hasContents.includes(this.#content.type as string)) {
			throw new TypeError(
				"message have no contents",
			);
		}
		if (this.raw.contentMetadata.DOWNLOAD_URL) {
			if (preview) {
				const r = await this.#client.base
					.fetch(this.raw.contentMetadata.PREVIEW_URL);
				return await r.blob();
			} else {
				const r = await this.#client.base
					.fetch(this.raw.contentMetadata.DOWNLOAD_URL);
				return await r.blob();
			}
		}
		if (this.raw.chunks) {
			const file = await this.#client.base.obs.downloadMediaByE2EE(
				this.raw,
			);
			if (!file) {
				throw new InternalError("ObsError", "Download failed");
			}
			return file;
		} else {
			return await this.#client.base.obs.downloadMessageData({
				messageId: this.raw.id,
				isPreview: preview,
				isSquare: false,
			});
		}
	}
	get isMyMessage(): boolean {
		return this.#client.base.profile?.mid === this.from.id;
	}

	get to(): Mid {
		const message = this.raw;
		return {
			type: message.toType,
			id: message.to,
		};
	}
	get from(): Mid {
		const message = this.raw;
		return {
			type: message.toType,
			id: message.from,
		};
	}
	get #content() {
		return {
			type: this.raw.contentType,
			metadata: this.raw.contentMetadata,
		};
	}
	get text(): string {
		return this.raw.text;
	}
	/*
	static fromSource(
		source: SourceEvent & { type: "talk" },
		client: Client,
	): Promise<TalkMessage> {
		return this.fromRawTalk(source.event.message, client);
	}
	*/
	static async fromRawTalk(
		raw: Message,
		client: Client,
	): Promise<TalkMessage> {
		if (raw.contentMetadata.e2eeVersion) {
			raw = await client.base.e2ee.decryptE2EEMessage(raw);
		}
		return new TalkMessage({
			client,
			raw,
		});
	}
}

export class UnresolvedTalkMessage {
	readonly id: string;
	readonly #client: Client;
	constructor(id: string, client: Client) {
		this.id = id;
		this.#client = client;
	}
	then(_resolve: (value: TalkMessage) => void) {
		throw new Error("Method not implemented.");
	}
}
