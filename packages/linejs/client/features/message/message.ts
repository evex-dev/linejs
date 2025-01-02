import {
	enums,
	type Message as TalkMessage,
	type MessageReactionType,
	type SquareMessage,
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
import type { DecorationsData, MentionTarget } from "./types.ts";

export type MessageInit =
	& {
		client: Client;
	}
	& ({
		isSquare: true;
		raw: SquareMessage;
	} | {
		isSquare: false;
		raw: TalkMessage;
	});

export class Message {
	#client: Client;

	#raw: {
		isSquare: true;
		raw: SquareMessage;
	} | {
		isSquare: false;
		raw: TalkMessage;
	};

	constructor(init: MessageInit) {
		this.#client = init.client;
		this.#raw = init.isSquare
			? {
				isSquare: true,
				raw: init.raw,
			}
			: {
				isSquare: false,
				raw: init.raw,
			};
	}

	/**
	 * Replys to message.
	 * @param text text to reply
	 */
	async reply(text: string) {
		if (this.#raw.isSquare) {
			await this.#client.base.square.sendMessage({
				relatedMessageId: this.#rawMessage.id,
				squareChatMid: this.#rawMessage.to,
				text,
			});
		} else {
			let to: string;
			if (this.to.type === "GROUP" || this.to.type === "ROOM") {
				to = this.to.id; // this.to means it is group.
			} else {
				// Personal chats
				to = this.isMyMessage ? this.to.id : this.from.id;
			}
			await this.#client.base.talk.sendMessage({
				relatedMessageId: this.#rawMessage.id,
				text,
				to,
			});
		}
	}

	async react(type: MessageReactionType) {
		if (!this.#raw.isSquare) {
			await this.#client.base.talk.react({
				id: BigInt(this.#rawMessage.id),
				reaction: type,
			});
		} else {
			if (typeof type === "string") {
				type = enums.MessageReactionType[
					type
				] as MessageReactionType & number;
			}
			return this.#client.base.square.reactToMessage({
				request: {
					reqSeq: 0,
					reactionType: type,
					messageId: this.#rawMessage.id,
					squareChatMid: this.to.id,
				},
			});
		}
	}
	async announce() {
		if (this.#raw.isSquare) {
			if (!this.#rawMessage.text) {
				throw new TypeError("The message is not text message.");
			}
			await this.#client.base.square.createSquareChatAnnouncement({
				squareChatMid: this.to.id,
				senderMid: this.from.id,
				messageId: this.#rawMessage.id,
				text: this.#rawMessage.text,
				createdAt: this.#rawMessage.createdTime,
			});
		} else {
			if (!this.#rawMessage.text) {
				throw new TypeError("The message is not text message.");
			}
			if (this.to.type !== "ROOM" && this.to.type !== "GROUP") {
				throw new TypeError("Cannot announce out of group.");
			}
			await this.#client.base.talk.createChatRoomAnnouncement({
				chatRoomMid: this.to.id,
				type: "MESSAGE",
				contents: {
					text: this.#rawMessage.text,
					link:
						`line://nv/chatMsg?chatId=${this.to.id}&messageId=${this.#rawMessage.id}`,
				},
			});
		}
	}

	async unsend() {
		if (!this.isMyMessage) {
			throw new TypeError("Cannot unsend the message which is not yours.");
		}
		if (this.isTalk) {
			await this.#client.base.talk.unsendMessage({
				messageId: this.#rawMessage.id,
			});
		} else {
			await this.#client.base.square.unsendMessage({
				messageId: this.#rawMessage.id,
				squareChatMid: this.to.id,
			});
		}
	}

	async delete() {
		if (this.isTalk) {
			throw new TypeError("delete() can be called only OpenChat.");
		}

		await this.#client.base.square.destroyMessage({
			messageId: this.#rawMessage.id,
			squareChatMid: this.to.id,
		});
	}

	/**
	 * Gets sticker URL.
	 * @returns Stamp URL
	 */
	getStickerURL(): string {
		if (this.#rawMessage.contentType !== "STICKER") {
			throw new TypeError("The message is not sticker.");
		}
		const stickerMetadata = this.#rawMessage
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
		if (this.#rawMessage.contentType !== "NONE") {
			throw new TypeError("The message is not text message.");
		}
		const emojiUrls: string[] = [];
		const emojiData = this.#rawMessage.contentMetadata as unknown as EmojiMeta;
		const emojiResources = emojiData?.REPLACE?.sticon?.resources ?? [];
		for (const emoji of emojiResources) {
			emojiUrls.push(
				`https://stickershop.line-scdn.net/sticonshop/v1/sticon/${emoji.productId}/android/${emoji.sticonId}.png`,
			);
		}
		return emojiUrls;
	}

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
						text: this.#rawMessage.text?.substring(
							lastSplit,
							e.start,
						) as string,
					});
				}
				const content: DecorationsData = {
					text: this.#rawMessage.text?.substring(e.start, e.end),
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
			text: this.#rawMessage.text?.substring(lastSplit) as string,
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
	getReplyTarget(): UnresolvedMessage | null {
		if (
			this.#rawMessage.relatedMessageId &&
			(this.#rawMessage.messageRelationType === 3 ||
				this.#rawMessage.messageRelationType === "REPLY")
		) {
			return new UnresolvedMessage(
				this.#rawMessage.relatedMessageId,
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

	get isMyMessage() {
		return this.#client.base.profile?.mid === this.from.id;
	}
	get isSquare(): boolean {
		return this.#raw.isSquare;
	}
	get isTalk(): boolean {
		return !this.#raw.isSquare;
	}
	get #rawMessage(): TalkMessage {
		return this.#raw.isSquare ? this.#raw.raw.message : this.#raw.raw;
	}
	get to() {
		const message = this.#rawMessage;
		return {
			type: message.toType,
			id: message.to,
		};
	}
	get from() {
		const message = this.#rawMessage;
		return {
			type: message.toType,
			id: message.to,
		};
	}
	get #content() {
		return {
			type: this.#rawMessage.contentType,
			metadata: this.#rawMessage.contentMetadata,
		};
	}
	get text() {
		return this.#rawMessage.text;
	}

	static fromSource(source: SourceEvent, client: Client): Message {
		if (source.type === "square") {
			return new Message({
				isSquare: true,
				client,
				raw: source.event.payload.notificationMessage.squareMessage,
			});
		} else {
			return new Message({
				isSquare: false,
				client,
				raw: source.event.message,
			});
		}
	}
}

export class UnresolvedMessage {
	readonly id: string;
	constructor(id: string, client: Client) {
		this.id = id;
	}
}

/**
 * Build text decorations (emoji,mention)
 */
export const buildTextDecorations = (decorationText: DecorationsData[]): [
	string,
	{
		REPLACE?: string;
		STICON_OWNERSHIP?: string;
		MENTION?: string;
	},
] => {
	let text = "";
	let hasMention = false;
	let hasEmoji = false;
	const _contentMetadata: Partial<EmojiMeta & MentionMeta> = {
		REPLACE: {
			sticon: {
				resources: [],
			},
		},
		STICON_OWNERSHIP: [],
		MENTION: {
			MENTIONEES: [],
		},
	};
	decorationText.forEach((e) => {
		if (e.emoji) {
			if (!e.text) {
				e.text = "(linejs)";
			}
			hasEmoji = true;
			_contentMetadata.REPLACE!.sticon.resources.push({
				S: text.length,
				E: text.length + e.text.length,
				productId: e.emoji.productId,
				sticonId: e.emoji.sticonId,
				version: e.emoji.version || 1,
				resourceType: e.emoji.resourceType || "STATIC",
			});
			if (
				!_contentMetadata.STICON_OWNERSHIP?.includes(
					e.emoji.productId,
				)
			) {
				_contentMetadata.STICON_OWNERSHIP!.push(e.emoji.productId);
			}
		} else if (e.mention) {
			if (!e.text) {
				e.text = "@unknown";
			}
			hasMention = true;
			if (e.mention.all) {
				_contentMetadata.MENTION!.MENTIONEES.push({
					S: text.length.toString(),
					E: (text.length + e.text.length).toString(),
					A: "1",
				});
			} else {
				_contentMetadata.MENTION!.MENTIONEES.push({
					S: text.length.toString(),
					E: (text.length + e.text.length).toString(),
					M: e.mention.mid,
				});
			}
		}
		text += e.text || "";
	});
	const contentMetadata: {
		REPLACE?: string;
		STICON_OWNERSHIP?: string;
		MENTION?: string;
	} = {
		REPLACE: JSON.stringify(_contentMetadata.REPLACE),
		STICON_OWNERSHIP: JSON.stringify(_contentMetadata.STICON_OWNERSHIP),
		MENTION: JSON.stringify(_contentMetadata.MENTION),
	};
	if (!hasEmoji) {
		delete contentMetadata.REPLACE;
		delete contentMetadata.STICON_OWNERSHIP;
	}
	if (!hasMention) {
		delete contentMetadata.MENTION;
	}
	return [text, contentMetadata];
};
