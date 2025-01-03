import {
	enums,
	type Message,
	type MessageReactionType,
} from "@evex/linejs-types";
import type { Client } from "../../client.ts";
import type { SourceEvent } from "../../events/mod.ts";
import type {
	ContactMeta,
	EmojiMeta,
	FileMeta,
	FlexMeta,
	MentionMeta,
	StickerMetadata,
} from "./internal-types.ts";
import type { DecorationsData, From, MentionTarget, To } from "./types.ts";

export interface TalkMessageInit {
	client: Client;
	raw: Message;
}

export class TalkMessage {
	#client: Client;
	#raw: Message;

	readonly isSquare = false;
	readonly isTalk = true;

	constructor(init: TalkMessageInit) {
		this.#client = init.client;
		this.#raw = init.raw;
	}

	/**
	 * Replys to message.
	 */
	async reply(
		input: string | {
			e2ee?: boolean;
			text?: string;
		},
	): Promise<void> {
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
		await this.#client.base.talk.sendMessage({
			relatedMessageId: this.#raw.id,
			text: input.text,
			to,
			e2ee: input.e2ee !== false,
		});
	}

	/**
	 * Reacts to message.
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
				messageId: this.#raw.id,
				squareChatMid: this.to.id,
			},
		});
	}

	/**
	 * Pins the message.
	 */
	async announce() {
		if (!this.#raw.text) {
			throw new TypeError("The message is not text message.");
		}
		if (this.to.type !== "ROOM" && this.to.type !== "GROUP") {
			throw new TypeError("Cannot announce out of group.");
		}
		await this.#client.base.talk.createChatRoomAnnouncement({
			chatRoomMid: this.to.id,
			type: "MESSAGE",
			contents: {
				text: this.#raw.text,
				link:
					`line://nv/chatMsg?chatId=${this.to.id}&messageId=${this.#raw.id}`,
			},
		});
	}

	/**
	 * Unsends the message.
	 */
	async unsend() {
		if (!this.isMyMessage) {
			throw new TypeError("Cannot unsend the message which is not yours.");
		}
		await this.#client.base.talk.unsendMessage({
			messageId: this.#raw.id,
		});
	}

	/**
	 * Gets sticker URL.
	 * @returns Stamp URL
	 */
	getStickerURL(): string {
		if (this.#raw.contentType !== "STICKER") {
			throw new TypeError("The message is not sticker.");
		}
		const stickerMetadata = this.#raw
			.contentMetadata as unknown as StickerMetadata;
		if (stickerMetadata.STKOPT === "A") {
			return `https://stickershop.line-scdn.net/stickershop/v1/sticker/${stickerMetadata.STKID}/android/sticker.png`;
		} else {
			return `https://stickershop.line-scdn.net/stickershop/v1/sticker/${stickerMetadata.STKID}/android/sticker_animation.png`;
		}
	}

	/**
	 * Collects emoji URLs in the message.
	 * @returns URLs of emoji
	 */
	collectEmojiURLs(): string[] {
		if (this.#raw.contentType !== "NONE") {
			throw new TypeError("The message is not text message.");
		}
		const emojiUrls: string[] = [];
		const emojiData = this.#raw.contentMetadata as unknown as EmojiMeta;
		const emojiResources = emojiData?.REPLACE?.sticon?.resources ?? [];
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
		const mentionData = content.metadata as unknown as MentionMeta;
		const mentions = mentionData?.MENTION?.MENTIONEES ?? [];
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
		const mentionData = content.metadata as unknown as MentionMeta;
		const emojiData = content.metadata as unknown as EmojiMeta;
		(mentionData?.MENTION?.MENTIONEES || []).forEach((e, i) => {
			splits.push({
				start: parseInt(e.S),
				end: parseInt(e.E),
				mention: i,
			});
		});
		(emojiData?.REPLACE?.sticon?.resources || []).forEach((e, i) => {
			splits.push({ start: e.S, end: e.E, emoji: i });
		});
		let lastSplit = 0;
		splits
			.sort((a, b) => a.start - b.start)
			.forEach((e) => {
				if (lastSplit - e.start) {
					texts.push({
						text: this.#raw.text?.substring(
							lastSplit,
							e.start,
						) as string,
					});
				}
				const content: DecorationsData = {
					text: this.#raw.text?.substring(e.start, e.end),
				};
				if (typeof e.emoji === "number") {
					const emoji = emojiData.REPLACE.sticon.resources[e.emoji];
					const url =
						`https://stickershop.line-scdn.net/sticonshop/v1/sticon/${emoji.productId}/android/${emoji.sticonId}.png`;
					content.emoji = {
						...emoji,
						url,
					};
				} else if (typeof e.mention === "number") {
					const mention = mentionData.MENTION.MENTIONEES[e.mention];
					content.mention = mention.M
						? { mid: mention.M }
						: { all: !!mention.A };
				}
				texts.push(content);
				lastSplit = e.end;
			});
		texts.push({
			text: this.#raw.text?.substring(lastSplit) as string,
		});
		return texts;
	}

	/**
	 * Gets a shared contact infomation from the message.
	 */
	getSharedContact(): ContactMeta {
		if (this.#content.type !== "CONTACT") {
			throw new TypeError("The message does not share contact infomation.");
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
			this.#raw.relatedMessageId &&
			(this.#raw.messageRelationType === 3 ||
				this.#raw.messageRelationType === "REPLY")
		) {
			return new UnresolvedTalkMessage(
				this.#raw.relatedMessageId,
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

	get isMyMessage(): boolean {
		return this.#client.base.profile?.mid === this.from.id;
	}

	get to(): To {
		const message = this.#raw;
		return {
			type: message.toType,
			id: message.to,
		};
	}
	get from(): From {
		const message = this.#raw;
		return {
			type: message.toType,
			id: message.to,
		};
	}
	get #content() {
		return {
			type: this.#raw.contentType,
			metadata: this.#raw.contentMetadata,
		};
	}
	get text(): string {
		return this.#raw.text;
	}

	static fromSource(
		source: SourceEvent & { type: "talk" },
		client: Client,
	): Promise<TalkMessage> {
		return this.fromRawTalk(source.event.message, client);
	}
	static async fromRawTalk(raw: Message, client: Client): Promise<TalkMessage> {
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
