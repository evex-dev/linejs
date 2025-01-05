import type { SourceEvent } from "../mod.ts";
import { LINEEventBase } from "../shared.ts";

/**
 * An event that indicates a user accepted a chat invitation.
 */
export class AcceptInviteLINEEvent extends LINEEventBase {
	readonly type: "accept-invite" = "accept-invite";
	userMid: string;
	chatMid: string;

	constructor(source: SourceEvent & { type: "talk" }) {
		super(source);
		const op = source.event;
		if (op.type !== "NOTIFIED_ACCEPT_CHAT_INVITATION") {
			throw new TypeError("Wrong operation type");
		}
		if (
			op.param1 === undefined ||
			op.param2 === undefined
		) {
			throw new TypeError("Wrong param");
		}
		this.userMid = op.param2;
		this.chatMid = op.param1;
	}
}
