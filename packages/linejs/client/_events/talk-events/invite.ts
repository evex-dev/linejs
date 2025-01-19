import type { SourceEvent } from "../mod.ts";
import { LINEEventBase } from "../shared.ts";

/**
 * An event that indicates a user was invited into a chat.
 */
export class InviteLINEEvent extends LINEEventBase {
	readonly type: "invite" = "invite";
	userMid: string;
	chatMid: string;

	constructor(source: SourceEvent & { type: "talk" }) {
		super(source);
		const op = source.event;
		if (op.type !== "INVITE_INTO_CHAT") {
			throw new TypeError("Wrong operation type");
		}
		if (
			typeof op.param1 === "undefined" ||
			typeof op.param2 === "undefined"
		) {
			throw new TypeError("Wrong param");
		}
		this.userMid = op.param2;
		this.chatMid = op.param1;
	}
}
