import type { SourceEvent } from "../mod.ts";
import { LINEEventBase } from "../shared.ts";

/**
 * An event that indicates a message was removed from a chat.
 */
export class RemoveMessageLINEEvent extends LINEEventBase {
	readonly type: "remove-message" = "remove-message";
	chatMid: string;
	messageId: string;

	constructor(source: SourceEvent & { type: "talk" }) {
		super(source);
		const op = source.event;
		if (op.type !== "SEND_CHAT_REMOVED") {
			throw new TypeError("Wrong operation type");
		}
		if (
			typeof op.param1 === "undefined" ||
			typeof op.param2 === "undefined"
		) {
			throw new TypeError("Wrong param");
		}
		this.chatMid = op.param1;
		this.messageId = op.param2;
	}
}
