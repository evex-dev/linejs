import type { Client } from "../mod.ts";
import { LINEEventBase } from "./shared.ts";
import type { SourceEvent } from "./mod.ts";
import { Message } from "../features/message/mod.ts";

export class MessageLINEEvent extends LINEEventBase {
	#client: Client;
	readonly type: "message" = "message";
	readonly message: Message;
	constructor(source: SourceEvent, client: Client) {
		super(source);
		this.#client = client;
		this.message = new Message(
			source.type === "square"
				? {
					isSquare: true,
					client: this.#client,
					from:
						source.event.payload.notificationMessage.squareMessage.message.from,
					id: source.event.payload.notificationMessage.squareMessage.message.id,
					to: source.event.payload.notificationMessage.squareMessage.message.to,
					text:
						source.event.payload.notificationMessage.squareMessage.message.text,
				}
				: {
					isSquare: false,
					client: this.#client,
					from: source.event.message.from,
					id: source.event.message.id,
					to: source.event.message.to,
					toType: source.event.message.toType,
					text: source.event.message.text,
				},
		);
	}
}
