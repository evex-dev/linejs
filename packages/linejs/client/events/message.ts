import type { Client } from "../mod.ts";
import { LINEEventBase } from "./shared.ts";
import type { SourceEvent } from "./mod.ts";
import { Message } from "../features/message/mod.ts";

export class MessageLINEEvent extends LINEEventBase {
	readonly type: "message" = "message";
	readonly message: Message;
	constructor(source: SourceEvent, client: Client) {
		super(source);
		this.message = Message.fromSource(source, client);
	}
}
