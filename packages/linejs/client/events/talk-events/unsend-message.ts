import type { SourceEvent } from "../mod.ts";
import { LINEEventBase } from "../shared.ts";

/**
 * An event that indicates a message has been unsend.
 */
export class UnsendMessageLINEEvent extends LINEEventBase {
	readonly type: "unsend-message" = "unsend-message";
	readonly messageId: string;
	readonly chatMid: string;

	constructor(source: SourceEvent & { type: "talk" }) {
		super(source);
		const op = source.event;
		if (
			typeof op.param1 === "undefined" ||
			typeof op.param1 === "undefined"
		) {
			throw new TypeError("Wrong param");
		}
		this.messageId = op.param2;
		this.chatMid = op.param1;
	}
}
