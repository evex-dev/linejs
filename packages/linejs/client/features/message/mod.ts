import type { SquareMessage, Message as TalkMessage } from "@evex/linejs-types";
import type { Client } from "../../client.ts";
import type { SourceEvent } from "../../events/mod.ts";

export type MessageInit =
	& {
		client: Client;
	}
	& ({
		isSquare: true;
		raw: SquareMessage
	} | {
		isSquare: false;
		raw: TalkMessage
	});

export class Message {
	#client: Client;

    #raw: {
      isSquare: true
      raw: SquareMessage
    } | {
      isSquare: false
      raw: TalkMessage
    }

	constructor(init: MessageInit) {
		this.#client = init.client;
        this.#raw = init.isSquare ? {
            isSquare: true,
            raw: init.raw
        } : {
            isSquare: false,
            raw: init.raw
        }
	}

	async reply(text: string) {
		if (this.#raw.isSquare) {
			await this.#client.base.square.sendMessage({
				relatedMessageId: this.#rawMessage.id,
				squareChatMid: this.#rawMessage.to,
				text,
			});
		} else {
			let to: string;
			if (this.to.type === "GROUP" || this.to.type === "ROOM") {
				to = this.to.id; // this.to means it is group.
			} else {
				// Personal chats
				to = this.isMyMessage ? this.to.id : this.from.id;
			}
			await this.#client.base.talk.sendMessage({
				relatedMessageId: this.#rawMessage.id,
				text,
				to,
			});
		}
	}

	get isMyMessage() {
		return this.#client.base.profile?.mid === this.from.id;
	}
    get isSquare() {
        return this.#raw.isSquare
    }
    get isTalk() {
        return !this.#raw.isSquare
    }
    get #rawMessage(): TalkMessage {
        return this.#raw.isSquare ? this.#raw.raw.message : this.#raw.raw
    }
    get to() {
        const message = this.#rawMessage
        return {
            type: message.toType,
            id: message.to
        }
    }
    get from() {
        const message = this.#rawMessage
        return {
            type: message.toType,
            id: message.to
        }
    }

    static fromSource(source: SourceEvent, client: Client): Message {
        if (source.type === 'square') {
            return new Message({
                isSquare: true,
                client,
                raw: source.event.payload.notificationMessage.squareMessage
            })
        } else {
            return new Message({
                isSquare: false,
                client,
                raw: source.event.message
            })
        }
    }
}
