import type { SourceEvent } from "../mod.ts";
import { LINEEventBase } from "../shared.ts";

export class LeaveChatLINEEvent extends LINEEventBase {
	readonly type: "leave-chat" = "leave-chat";
	chatMid: string;
	userMid?: string;

	constructor(source: SourceEvent & { type: "talk" }) {
		super(source);
		const op = source.event;
		if (typeof op.param1 === "undefined") {
			throw new TypeError("Wrong param");
		}
		this.chatMid = op.param1;
		this.userMid = op.param2;
	}
}
