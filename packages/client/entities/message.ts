import type * as LINETypes from "../libs/thrift/line_types.ts";
import type { LooseType } from "./common.ts";

export type SquareMessage = LINETypes.SquareEventNotificationMessage & {
    content: string,
    reply: (options: SquareMessageReplyOptions) => Promise<LINETypes.SendMessageResponse>;
	author: {
		pid: string;
		displayName: string;
	};
	square: () => Promise<LINETypes.GetSquareChatResponse>;
};

export type SquareMessageReplyOptions = {
    text?: string;
    contentType?: LINETypes.ContentType;
    contentMetadata?: LooseType;
} | string
