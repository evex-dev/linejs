import type { MIDType } from "@evex/linejs-types";
import type { Client } from "../../client.ts";

export type MessageInit =
	& {
		client: Client;
		id: string;
		from: string;
		to: string;
		isSquare: boolean;
	}
	& ({
		isSquare: true;
		toType?: undefined;
	} | {
		isSquare: false;
		toType: MIDType;
	});

export class Message {
	#client: Client;
	#isSquare: boolean;
	#toType?: MIDType;

	/** Message ID */
	readonly id: string;
	/** To */
	readonly to: string;
	/** From */
	readonly from: string;

	constructor(init: MessageInit) {
		this.#client = init.client;
		this.id = init.id;
		this.#isSquare = init.isSquare;
		this.from = init.from;
		this.to = init.to;
		this.#toType = init.toType;
	}

	async reply(text: string) {
		if (this.#isSquare) {
			await this.#client.base.square.sendMessage({
				relatedMessageId: this.id,
				squareChatMid: this.to,
				text,
			});
		} else {
			let to: string;
			if (this.#toType === "GROUP" || this.#toType === "ROOM") {
				to = this.to; // this.to means it is group.
			} else {
				// Personal chats
				to = this.isMyMessage ? this.to : this.from;
			}
			await this.#client.base.talk.sendMessage({
				relatedMessageId: this.id,
				text,
				to,
			});
		}
	}

	get isMyMessage() {
		return this.#client.base.profile?.mid === this.from;
	}
}
