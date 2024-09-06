import type * as LINETypes from "../libs/thrift/line_types.ts";
import type { LooseType } from "./common.ts";

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
	) => Promise<LINETypes.SendMessageResponse>;
	send: (
		options: SquareMessageSendOptions,
	) => Promise<LINETypes.SendMessageResponse>;
	author: {
		mid: string;
		displayName: string;
		iconImage: string;
	};
	getProfile: () => Promise<LINETypes.SquareMember>;
	square: () => Promise<LINETypes.GetSquareChatResponse>;
	data: () => Promise<Blob>;
};

export type Message = Omit<LINETypes.Operation, "type"> & {
	opType: LINETypes.OpType;
	content: string;
	contentMetadata: LooseType;
	contentType: LINETypes.ContentType;
	replyId?: string;
	reply: (options: MessageReplyOptions) => Promise<LINETypes.Message>;
	send: (options: SquareMessageSendOptions) => Promise<LINETypes.Message>;
	author: {
		mid: string;
		iconImage: string;
	};
	getContact: () => Promise<LINETypes.Contact>;
	data: () => Promise<Blob>;
} & (
		| {
				type: "chat";
				chat: () => Promise<LINETypes.Contact>;
		  }
		| {
				type: "group";
				group: () => Promise<LINETypes.Group>;
		  }
	);

export type MessageReplyOptions =
	| {
			text?: string;
			contentType?: LINETypes.ContentType;
			contentMetadata?: LooseType;
	  }
	| string;

export type SquareMessageSendOptions = MessageReplyOptions;
