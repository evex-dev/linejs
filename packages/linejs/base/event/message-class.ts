/**
 * Develop now
 * @experimental
 * for message
 */
import * as LINETypes from "@evex/linejs-types";
import { parseEnum } from "@evex/linejs-types/thrift";
import { type BaseClient, InternalError } from "../core/mod.ts";
import { Group, User } from "./talk-class.ts";
import { Square, SquareChat, SquareMember } from "./square-class.ts";

const hasContents = ["IMAGE", "VIDEO", "AUDIO", "FILE"];
type booleanString = "true" | "false";

interface splitInfo {
	start: number;
	end: number;
	mention?: number;
	emoji?: number;
}

type decorationText = {
	text: string;
	emoji?: {
		productId: string;
		sticonId: string;
		version?: number;
		resourceType?: string;
		url?: string;
	};
	mention?:
		| {
			mid: string;
			all?: undefined;
		}
		| {
			mid?: undefined;
			all: boolean;
		};
};

interface stkMeta {
	STKPKGID: string;
	STKID: string;
	STKTXT: string;
	STKVER: string;
	STKOPT?: string;
}
interface mentionMeta {
	MENTION: {
		MENTIONEES: {
			M?: string;
			S: string;
			E: string;
			A?: string;
		}[];
	};
}
interface emojiMeta {
	REPLACE: {
		sticon: {
			resources: {
				S: number;
				E: number;
				productId: string;
				sticonId: string;
				version: number;
				resourceType: string;
			}[];
		};
	};
	STICON_OWNERSHIP: string[];
}
interface contactMeta {
	mid: string;
	displayName: string;
}
interface flexMeta {
	FLEX_VER: string;
	FLEX_JSON: Record<string, any>;
	ALT_TEXT: string;
	EFFECT_TAG?: string;
}

interface fileMeta {
	FILE_SIZE: string;
	FILE_EXPIRE_TIMESTAMP: string;
	FILE_NAME: string;
}

interface imgExtMeta {
	PREVIEW_URL: string;
	DOWNLOAD_URL: string;
}

interface chatEventMeta {
	LOC_KEY: string | "C_MI" | "C_MR" | "C_ML" | "C_GI"; // chat_invite chat_remove chat_leave chat_invite?? ?
	LOC_ARGS: string; // mid\x1E * n
	SKIP_BADGE_COUNT: booleanString;
}

interface callMeta {
	GC_EVT_TYPE: "S" | "E"; // start end
	GC_CHAT_MID: string;
	CAUSE: string; // 16
	GC_MEDIA_TYPE: "AUDIO" | "VIDEO";
	VERSION: "X";
	GC_PROTO: "C";
	TYPE: "G";
	GC_IGNORE_ON_FAILBACK: booleanString;
	RESULT: "INFO";
	DURATION: string;
	SKIP_BADGE_COUNT: booleanString;
}

interface postNotificationMetq {
	serviceType: "GB";
	postEndUrl: string;
	locKey: "BG";
	text: string;
	contentType: "P";
	cafeId: "0";
}

/**
 * @description Gets mid's type
 */
function getMidType(mid: string): LINETypes.MIDType | null {
	/**
	 * USER(0),
	 * ROOM(1),
	 * GROUP(2),
	 * SQUARE(3),
	 * SQUARE_CHAT(4),
	 * SQUARE_MEMBER(5),
	 * BOT(6);
	 */
	const _u = mid.charAt(0);
	switch (_u) {
		case "u":
			return parseEnum("MIDType", 0) as LINETypes.MIDType;
		case "r":
			return parseEnum("MIDType", 1) as LINETypes.MIDType;
		case "c":
			return parseEnum("MIDType", 2) as LINETypes.MIDType;
		case "s":
			return parseEnum("MIDType", 3) as LINETypes.MIDType;
		case "m":
			return parseEnum("MIDType", 4) as LINETypes.MIDType;
		case "p":
			return parseEnum("MIDType", 5) as LINETypes.MIDType;
		case "v":
			return parseEnum("MIDType", 6) as LINETypes.MIDType;
		default:
			return null;
	}
}

/**
 * @description LINE message base utils
 */
export class Message {
	public sourceType: 0 | 1 | 2 | 3 | 4; // op noti recv send msg
	public rawSource:
		| LINETypes.Operation
		| LINETypes.SquareEventNotificationMessage
		| LINETypes.SquareEventReceiveMessage
		| LINETypes.SquareEventSendMessage
		| undefined;
	public rawMessage: LINETypes.Message;
	public toType: LINETypes.MIDType;
	public to: string;
	public fromType: LINETypes.MIDType;
	public from: string;
	public contentType: LINETypes.ContentType;
	public contentMetadata: Record<string, any>;
	public _senderDisplayName: string | undefined;
	public id: string;
	public createdTime: Date;
	public text: string | undefined;
	public content: string | undefined;

	constructor(options: {
		operation?: LINETypes.Operation;
		squareEventNotificationMessage?: LINETypes.SquareEventNotificationMessage;
		squareEventReceiveMessage?: LINETypes.SquareEventReceiveMessage;
		squareEventSendMessage?: LINETypes.SquareEventSendMessage;
		message?: LINETypes.Message;
	}) {
		if (Object.keys(options).length != 1) {
			throw new TypeError("Invalid argument");
		}
		const {
			message,
			operation,
			squareEventNotificationMessage,
			squareEventReceiveMessage,
			squareEventSendMessage,
		} = options;
		if (
			operation &&
			(operation.type === "SEND_MESSAGE" ||
				operation.type === 25 ||
				operation.type === "RECEIVE_MESSAGE" ||
				operation.type === 26 ||
				operation.type === "SEND_CONTENT" ||
				operation.type === 43)
		) {
			this.rawSource = operation;
			this.rawMessage = operation.message;
			this.sourceType = 0;
		} else if (squareEventNotificationMessage) {
			this.rawSource = squareEventNotificationMessage;
			this.rawMessage = squareEventNotificationMessage.squareMessage.message;
			this._senderDisplayName =
				squareEventNotificationMessage.senderDisplayName;
			this.sourceType = 1;
		} else if (squareEventReceiveMessage) {
			this.rawSource = squareEventReceiveMessage;
			this.rawMessage = squareEventReceiveMessage.squareMessage.message;
			this._senderDisplayName = squareEventReceiveMessage.senderDisplayName;
			this.sourceType = 2;
		} else if (squareEventSendMessage) {
			this.rawSource = squareEventSendMessage;
			this.rawMessage = squareEventSendMessage.squareMessage.message;
			this._senderDisplayName = squareEventSendMessage.senderDisplayName;
			this.sourceType = 3;
		} else if (message) {
			this.rawMessage = message;
			this.sourceType = 4;
		} else {
			throw new TypeError("Invalid argument");
		}
		this.toType = (parseEnum(
			"MIDType",
			this.rawMessage.toType,
		) as LINETypes.MIDType) ||
			this.rawMessage.toType;
		this.to = this.rawMessage.to;
		this.from = this.rawMessage.from;
		this.fromType = getMidType(this.from) as LINETypes.MIDType;
		this.contentType = (parseEnum(
			"ContentType",
			this.rawMessage.contentType,
		) as LINETypes.ContentType) || this.rawMessage.contentType;
		this.createdTime = new Date(
			(this.rawMessage.createdTime as number) * 1000,
		);
		this.id = this.rawMessage.id;
		if (this.rawMessage.text) {
			this.content = this.rawMessage.text;
			this.text = this.rawMessage.text;
		}
		this.contentMetadata = {};
		for (const key in this.rawMessage.contentMetadata) {
			if (
				Object.prototype.hasOwnProperty.call(
					this.rawMessage.contentMetadata,
					key,
				)
			) {
				let value: string = this.rawMessage.contentMetadata[key]
					.toString();
				if (value.startsWith("{") || value.startsWith("[")) {
					value = JSON.parse(value);
				}
				this.contentMetadata[key] = value;
			}
		}
	}

	/**
	 * @return {string[]} chat event mids
	 */
	public getChatEvent(): string[] {
		if (this.contentType !== "CHATEVENT") {
			throw new InternalError(
				"MessageParserErr",
				"Not ChatEvent Message",
			);
		}
		const eventData = this.contentMetadata as chatEventMeta;
		return eventData.LOC_ARGS.toString().split("\x1E");
	}

	/**
	 * @return {string} sticker url
	 */
	public getSticker(): string {
		if (this.contentType !== "STICKER") {
			throw new InternalError("MessageParserErr", "Not Sticker Message");
		}
		const stkData = this.contentMetadata as stkMeta;
		if (stkData.STKOPT === "A") {
			return `https://stickershop.line-scdn.net/stickershop/v1/sticker/${stkData.STKID}/android/sticker.png`;
		} else {
			return `https://stickershop.line-scdn.net/stickershop/v1/sticker/${stkData.STKID}/android/sticker_animation.png`;
		}
	}

	/**
	 * @return {string[]} emoji urls
	 */
	public getEmojis(): string[] {
		if (this.contentType !== "NONE") {
			throw new InternalError("MessageParserErr", "Not Text Message");
		}
		const emojiUrls: string[] = [];
		const emojiData = this.contentMetadata as emojiMeta;
		(emojiData?.REPLACE?.sticon?.resources || []).forEach((e) => {
			emojiUrls.push(
				`https://stickershop.line-scdn.net/sticonshop/v1/sticon/${e.productId}/android/${e.sticonId}.png`,
			);
		});
		return emojiUrls;
	}

	/**
	 * @return {string[]} mention mids
	 */
	public getMentions(): string[] {
		if (this.contentType !== "NONE") {
			throw new InternalError("MessageParserErr", "Not Text Message");
		}
		const mentionees: string[] = [];
		const mentionData = this.contentMetadata as mentionMeta;
		(mentionData?.MENTION?.MENTIONEES || []).forEach((e) => {
			const mid = e.A ? "ALL" : e.M;
			if (mid) mentionees.push(mid);
		});
		return mentionees;
	}

	/**
	 * @description Gets text decorations (emoji,mention)
	 */
	public getTextDecorations(): decorationText[] {
		if (this.contentType !== "NONE") {
			throw new InternalError("MessageParserErr", "Not Text Message");
		}
		const texts: decorationText[] = [];
		const splits: splitInfo[] = [];
		const mentionData = this.contentMetadata as mentionMeta;
		const emojiData = this.contentMetadata as emojiMeta;
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
						text: this.content?.substring(
							lastSplit,
							e.start,
						) as string,
					});
				}
				const content: decorationText = {
					text: this.content?.substring(e.start, e.end) as string,
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
			text: this.content?.substring(lastSplit) as string,
		});
		return texts;
	}

	/**
	 * @description Build text decorations (emoji,mention)
	 */
	static buildTextDecorations(decorationText: decorationText[]): [
		string,
		{
			REPLACE?: string;
			STICON_OWNERSHIP?: string;
			MENTION?: string;
		},
	] {
		let text = "";
		let hasMention = false;
		let hasEmoji = false;
		const _contentMetadata: Partial<emojiMeta & mentionMeta> = {
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
					e.text = "@unkonau";
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
	}

	/**
	 * @return {contactMeta} contactData
	 */
	public getContact(): contactMeta {
		if (this.contentType !== "CONTACT") {
			throw new InternalError("MessageParserErr", "Not Contact Message");
		}
		const contactData = this.contentMetadata as contactMeta;
		return { mid: contactData.mid, displayName: contactData.displayName };
	}

	/**
	 * @return flex data
	 */
	public getFlex(): {
		flexJson: Record<string, any>;
		altText: string;
		ver: string;
		tag: string | undefined;
	} {
		if (this.contentType !== "FLEX") {
			throw new InternalError("MessageParserErr", "Not Flex Message");
		}
		const flexData = this.contentMetadata as flexMeta;
		return {
			flexJson: flexData.FLEX_JSON,
			altText: flexData.ALT_TEXT,
			ver: flexData.FLEX_VER,
			tag: flexData.EFFECT_TAG,
		};
	}

	/**
	 * @return {string} message id
	 */
	public getReply(): string | undefined {
		if (
			this.rawMessage.relatedMessageId &&
			(this.rawMessage.messageRelationType === 3 ||
				this.rawMessage.messageRelationType === "REPLY")
		) {
			return this.rawMessage.relatedMessageId;
		}
	}

	/**
	 * @return {} file infomation
	 */
	public getFileInfo(): {
		size: number;
		expire: Date;
		name: string;
	} {
		if (this.contentType !== "FILE") {
			throw new InternalError("MessageParserErr", "Not File Message");
		}
		const fileData = this.contentMetadata as fileMeta;
		return {
			size: parseInt(fileData.FILE_SIZE),
			expire: new Date(parseInt(fileData.FILE_EXPIRE_TIMESTAMP) * 1000),
			name: fileData.FILE_NAME,
		};
	}
}

export class ClientMessage extends Message {
	protected client: BaseClient;

	constructor(
		options: {
			operation?: LINETypes.Operation;
			squareEventNotificationMessage?: LINETypes.SquareEventNotificationMessage;
			squareEventReceiveMessage?: LINETypes.SquareEventReceiveMessage;
			squareEventSendMessage?: LINETypes.SquareEventSendMessage;
			message?: LINETypes.Message;
		},
		client: BaseClient,
	) {
		super(options);
		this.client = client;
	}

	/**
	 * @return {Blob} message data
	 */
	public async getData(preview?: boolean): Promise<Blob> {
		if (!hasContents.includes(this.contentType as string)) {
			throw new InternalError(
				"MessageParserErr",
				"message have no contents",
			);
		}
		if (this.contentMetadata.DOWNLOAD_URL) {
			if (preview) {
				const r = await this.client
					.fetch(this.contentMetadata.PREVIEW_URL);
				return await r.blob();
			} else {
				const r_1 = await this.client
					.fetch(this.contentMetadata.DOWNLOAD_URL);
				return await r_1.blob();
			}
		}
		return this.client.obs.getMessageObsData({
			messageId: this.id,
			isPreview: preview,
			isSquare: this.toType === "SQUARE_CHAT",
		});
	}
}

/**
 * @description LINE talk message utils
 */
export class TalkMessage extends ClientMessage {
	constructor(
		options: {
			message?: LINETypes.Message;
			operation?: LINETypes.Operation;
		},
		client: BaseClient,
	) {
		super(options, client);
	}

	private author?: User;
	/**
	 * @return {Promise<User>} message author
	 */
	public async getAuthor(): Promise<User> {
		if (this.author) return this.author;
		this.author = await User.from(this.from, this.client);
		return this.author;
	}

	private group?: Group;
	/**
	 * @description groupTalk only
	 * @return {Promise<Group>} Group
	 */
	public async getGroup(): Promise<Group | undefined> {
		if (this.toType === "GROUP" || this.toType === "ROOM") {
			if (this.group) return this.group;
			this.group = await Group.from(this.to, this.client);
			return this.group;
		}
	}

	private user?: User;
	/**
	 * @description userTalk only
	 * @return {Promise<LINETypes.Contact>} Contact
	 */
	public async getUser(): Promise<User | undefined> {
		if (this.toType === "USER") {
			if (this.user) return this.user;
			if (this.getAuthorIsMe()) {
				this.user = await User.from(this.to, this.client);
			} else {
				this.user = await User.from(this.from, this.client);
			}
			return this.user;
		}
	}

	/**
	 * @description Gets author is me
	 */
	public getAuthorIsMe(): boolean {
		return this.from === this.client.profile?.mid;
	}

	/**
	 * @description Sends in this talk
	 */
	public async send(
		options:
			| {
				text?: string | undefined;
				contentType?: number | undefined;
				contentMetadata?: any;
				relatedMessageId?: string | undefined;
				location?: any;
				chunk?: string[] | undefined;
				e2ee?: boolean | undefined;
			}
			| string,
	): Promise<TalkMessage> {
		if (typeof options === "string") {
			return this.send({ text: options });
		} else {
			const _options: any = options;
			_options.to = this.toType === "GROUP" || this.toType === "ROOM"
				? this.to
				: this.getAuthorIsMe()
				? this.to
				: this.from;
			return new TalkMessage(
				{ message: await this.client.talk.sendMessage(_options) },
				this.client,
			);
		}
	}

	/**
	 * @description Sends in this talk with replying this message
	 */
	public async reply(
		options:
			| {
				text?: string | undefined;
				contentType?: number | undefined;
				contentMetadata?: any;
				relatedMessageId?: string | undefined;
				location?: any;
				chunk?: string[] | undefined;
				e2ee?: boolean | undefined;
			}
			| string,
	): Promise<TalkMessage> {
		if (typeof options === "string") {
			return this.reply({ text: options });
		} else {
			const _options: any = options;
			_options.to = this.toType === "GROUP" || this.toType === "ROOM"
				? this.to
				: this.getAuthorIsMe()
				? this.to
				: this.from;
			_options.relatedMessageId = this.id;
			return new TalkMessage(
				{ message: await this.client.talk.sendMessage(_options) },
				this.client,
			);
		}
	}

	/**
	 * @description React to this message
	 */
	public async react(
		type: LINETypes.MessageReactionType,
	): Promise<void> {
		return await this.client.talk.react({
			id: BigInt(this.id),
			reaction: type,
		});
	}

	/**
	 * @description Announce this message
	 */
	public async announce(): Promise<LINETypes.ChatRoomAnnouncement> {
		if (!this.text) {
			throw new InternalError("MessageParserErr", "Not Text message");
		}
		if (this.toType !== "ROOM" && this.toType !== "GROUP") {
			throw new InternalError("MessageParserErr", "not Group");
		}
		return await this.client.talk.createChatRoomAnnouncement({
			chatRoomMid: this.to,
			type: "MESSAGE",
			contents: {
				text: this.text,
				link: `line://nv/chatMsg?chatId=${this.to}&messageId=${this.id}`,
			},
		});
	}

	/**
	 * @description Unsend this message
	 */
	public async unsend(): Promise<void> {
		if (!this.getAuthorIsMe()) {
			throw new InternalError("MessageParserErr", "Can't Unsend");
		}
		return await this.client.talk.unsendMessage({
			messageId: this.id,
		});
	}
}

/**
 * @description LINE square message utils
 */
export class SquareMessage extends ClientMessage {
	constructor(
		options: {
			squareEventNotificationMessage?: LINETypes.SquareEventNotificationMessage;
			squareEventReceiveMessage?: LINETypes.SquareEventReceiveMessage;
			squareEventSendMessage?: LINETypes.SquareEventSendMessage;
			message?: LINETypes.Message;
		},
		client: BaseClient,
	) {
		super(options, client);
	}

	private author?: SquareMember;
	/**
	 * @return {Promise<SquareMember>} message author
	 */
	public async getAuthor(): Promise<SquareMember> {
		if (this.author) return this.author;
		this.author = await SquareMember.from(this.from, this.client);
		return this.author;
	}

	private squareChat?: SquareChat;
	/**
	 * @return {Promise<SquareChat>} this squareChat
	 */
	public async getSquareChat(): Promise<SquareChat> {
		if (this.squareChat) return this.squareChat;
		this.squareChat = await SquareChat.from(this.to, this.client, false);
		return this.squareChat;
	}

	private square?: Square;
	/**
	 * @return {Promise<Square>} this square
	 */
	public async getSquare(): Promise<Square> {
		if (this.square) return this.square;
		this.square = await Square.from(
			(await this.getSquareChat()).squareMid,
			this.client,
		);
		return this.square;
	}

	private authorIsMe?: boolean;
	/**
	 * @description Gets author is me
	 */
	public async getAuthorIsMe(): Promise<boolean> {
		if (typeof this.authorIsMe === "boolean") return this.authorIsMe;
		this.authorIsMe = this.from === (await this.getSquareChat()).mymid;
		return this.authorIsMe;
	}

	public async getMySquareProfile(): Promise<SquareMember> {
		return (await this.getSquare()).me;
	}
	/**
	 * @description Sends in this squareChat
	 */
	public async send(
		options:
			| {
				text?: string | undefined;
				contentType?: any;
				contentMetadata?: any;
				relatedMessageId?: string | undefined;
			}
			| string,
	): Promise<SquareMessage> {
		if (typeof options === "string") {
			return this.send({ text: options });
		} else {
			const _options: any = options;
			_options.squareChatMid = this.to;
			const r = await this.client.square.sendMessage(_options);
			return new SquareMessage(
				{ message: r.createdSquareMessage.message },
				this.client,
			);
		}
	}

	/**
	 * @description Sends in this squareChat with replying this message
	 */
	public async reply(
		options:
			| {
				text?: string | undefined;
				contentType?: any;
				contentMetadata?: any;
				relatedMessageId?: string | undefined;
			}
			| string,
	): Promise<SquareMessage> {
		if (typeof options === "string") {
			return this.reply({ text: options });
		} else {
			const _options: any = options;
			_options.squareChatMid = this.to;
			_options.relatedMessageId = this.id;
			const r = await this.client.square.sendMessage(_options);
			return new SquareMessage(
				{ message: r.createdSquareMessage.message },
				this.client,
			);
		}
	}

	/**
	 * @description React to this message
	 */
	public react(
		type: LINETypes.MessageReactionType,
	): Promise<LINETypes.ReactToMessageResponse> {
		if (typeof type === "string") {
			type = LINETypes.enums.MessageReactionType[
				type
			] as LINETypes.MessageReactionType & number;
		}
		return this.client.square.reactToMessage({
			request: {
				reqSeq: 0,
				reactionType: type,
				messageId: this.id,
				squareChatMid: this.to,
			},
		});
	}

	/**
	 * @description Announce this message
	 */
	public announce(): Promise<LINETypes.CreateSquareChatAnnouncementResponse> {
		if (!this.text) {
			throw new InternalError("MessageParserErr", "Not Text message");
		}
		return this.client.square.createSquareChatAnnouncement({
			squareChatMid: this.to,
			senderMid: this.from,
			messageId: this.id,
			text: this.text,
			createdAt: this.rawMessage.createdTime,
		});
	}

	/**
	 * @description Unsend this message
	 */
	public async unsend(): Promise<LINETypes.UnsendMessageResponse> {
		if (!(await this.getAuthorIsMe())) {
			throw new InternalError("MessageParserErr", "Can't Unsend");
		}
		return this.client.square.unsendMessage({
			messageId: this.id,
			squareChatMid: this.to,
		});
	}

	/**
	 * @description Delete this message
	 */
	public delete(): Promise<LINETypes.DestroyMessageResponse> {
		return this.client.square.destroyMessage({
			messageId: this.id,
			squareChatMid: this.to,
		});
	}
}
