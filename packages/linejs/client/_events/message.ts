import type { Client } from "../mod.ts";
import { LINEEventBase } from "./shared.ts";
import type { SourceEvent } from "./mod.ts";
import { SquareMessage, TalkMessage } from "../features/message/mod.ts";

export class MessageSquareLINEEvent extends LINEEventBase {
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
export class MessageTalkLINEEvent extends LINEEventBase {
	readonly type: "message" = "message";
	override readonly isSquare = false;
	override readonly isTalk = true;
	message: TalkMessage;
	constructor(
		source: SourceEvent & { type: "talk" },
		client: Client,
		decryptedMessage: TalkMessage,
	) {
		super(source);
		this.message = decryptedMessage;
	}
	static async fromSource(
		source: SourceEvent & { type: "talk" },
		client: Client,
	): Promise<MessageTalkLINEEvent> {
		const message = await TalkMessage.fromSource(source, client);
		return new MessageTalkLINEEvent(source, client, message);
	}
}

export type MessageLINEEvent = MessageSquareLINEEvent | MessageTalkLINEEvent;
