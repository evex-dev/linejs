import type * as LINETypes from "../libs/thrift/line_types.ts";
import type { LooseType } from "./common.ts";

export type Message = Omit<LINETypes.Operation, "type"> & {
	opType: LINETypes.OpType;
	content: string;
	contentMetadata: LooseType;
	contentType: LINETypes.ContentType;
	replyId?: string;
	reply: (options: MessageReplyOptions) => Promise<LINETypes.Message>;
	send: (options: SquareMessageSendOptions) => Promise<LINETypes.Message>;
	react: (
		options: SquareMessageReactionOptions,
	) => Promise<LINETypes.ReactToMessageResponse>;
	author: {
		mid: string;
		displayName: Promise<string>;
		iconImage: string;
	};
	isMyMessage: () => Promise<boolean>;
	getContact: () => Promise<LINETypes.Contact>;
	getMyProfile: () => Promise<LINETypes.Profile>;
	data: ((preview?: boolean) => Promise<Blob>) | undefined;
} & (
		| {
				type: "chat";
				chat: () => Promise<LINETypes.Contact>;
		  }
		| {
				type: "group";
				group: () => Promise<LINETypes.Chat>;
		  }
	);

export type SquareMessage = Omit<
	LINETypes.SquareEventNotificationMessage,
	"type"
> & {
	type: "square";
	opType: -1;
	content: string;
	contentMetadata: LooseType;
	contentType: LINETypes.ContentType;
	replyId?: string;
	reply: (
		options: MessageReplyOptions,
		safe?: boolean,
	) => Promise<LINETypes.SendMessageResponse>;
	send: (
		options: SquareMessageSendOptions,
		safe?: boolean,
	) => Promise<LINETypes.SendMessageResponse>;
	react: (
		options: SquareMessageReactionOptions,
	) => Promise<LINETypes.ReactToMessageResponse>;
	author: {
		mid: string;
		displayName: string;
		iconImage: string;
	};
	isMyMessage: () => Promise<boolean>;
	getProfile: () => Promise<LINETypes.SquareMember>;
	getMyProfile: () => Promise<LINETypes.SquareMember>;
	square: () => Promise<LINETypes.GetSquareChatResponse>;
	data: ((preview?: boolean) => Promise<Blob>) | undefined;
};

export type MessageReplyOptions =
	| {
			text?: string;
			contentType?: LINETypes.ContentType;
			contentMetadata?: LooseType;
	  }
	| string;

export type SquareMessageSendOptions = MessageReplyOptions;

export type MessageReactionOptions =
	| {
			reactionType: LINETypes.MessageReactionType;
	  }
	| LINETypes.MessageReactionType;

export type SquareMessageReactionOptions = MessageReactionOptions;
