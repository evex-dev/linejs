import type * as LINETypes from "../libs/thrift/line_types.ts";

export type SquareMessage = LINETypes.SquareEventNotificationMessage & {
	author: {
		pid: string;
		displayName: string;
	};
	square: () => Promise<LINETypes.GetSquareChatResponse>;
};
