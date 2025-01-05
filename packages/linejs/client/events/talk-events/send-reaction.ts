import type { SourceEvent } from "../mod.ts";
import { LINEEventBase } from "../shared.ts";
import type * as line from "@evex/linejs-types";
import { parseEnum } from "@evex/linejs-types/thrift";

/**
 * An event that indicates a user reacted to a message.
 */
export class SendReactionLINEEvent extends LINEEventBase {
	readonly type: "send-reaction" = "send-reaction";
	chatMid: string;
	messageId: string;
	userMid?: string;
	reactionType: line.MessageReactionType;
	constructor(source: SourceEvent & { type: "talk" }) {
		super(source);
		const op = source.event;
		if (
			typeof op.param1 === "undefined" ||
			typeof op.param2 === "undefined"
		) {
			throw new TypeError("Wrong param");
		}
		this.messageId = op.param1;
		const data = JSON.parse(op.param2);
		this.chatMid = data.chatMid;
		this.reactionType = parseEnum(
			"MessageReactionType",
			data.curr.predefinedReactionType,
		) as line.MessageReactionType;
		this.userMid = op.param3;
	}
}
