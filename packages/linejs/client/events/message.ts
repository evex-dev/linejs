import type { Client } from "../mod.ts";
import { LINEEventBase } from "./shared.ts";
import type { SourceEvent } from "./mod.ts";
import { SquareMessage, TalkMessage } from "../features/message/mod.ts";

class MessageSquareLINEEvent extends LINEEventBase {
	readonly type: "message" = "message";
	override readonly isSquare = true;
	override readonly isTalk = false;
	message: SquareMessage;
	constructor(source: SourceEvent & { type: "square" }, client: Client) {
		super(source);
		this.message = SquareMessage.fromRawTalk(
			source.event.payload.notificationMessage.squareMessage,
			client,
		);
	}
}
class MessageTalkLINEEvent extends LINEEventBase {
	readonly type: "message" = "message";
	override readonly isSquare = false;
	override readonly isTalk = true;
	message: TalkMessage;
	constructor(source: SourceEvent & { type: "talk" }, client: Client) {
		super(source);
		this.message = TalkMessage.fromSource(source, client);
	}
}
export type MessageLINEEvent = MessageSquareLINEEvent | MessageTalkLINEEvent;
export const createMessageLINEEvent = (
	source: SourceEvent,
	client: Client,
): MessageLINEEvent => {
	if (source.type === "square") {
		return new MessageSquareLINEEvent(source, client);
	} else {
		return new MessageTalkLINEEvent(source, client);
	}
};
