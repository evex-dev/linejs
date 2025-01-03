import type { Client } from "../../mod.ts";
import type * as line from "@evex/linejs-types";
import { Message } from "../message/message.ts";

interface ChatInit {
	client: Client;

	mid: string;
	name: string;
	created: Date;
}

/**
 * Talk chat class (not a OpenChat)
 */
export class Chat {
	#client: Client;
	readonly mid: string;
	name: string;
	created: Date;
	constructor(init: ChatInit) {
		this.#client = init.client;
		this.mid = init.mid;
		this.name = init.name;
		this.created = init.created;
	}

	/**
	 * Sends message to the chat.
	 */
	async sendMessage(
		input: string | {
			text?: string;
			/**
			 * If true, end2end encryption will be enabled.
			 * @default true
			 */
			e2ee?: boolean;
			/**
			 * Related message mid. This is used for reply.
			 */
			relatedMessageId?: string;

			contentType?: line.ContentType;
			contentMetadata?: Record<string, string>;
			location?: line.Location;
			chunk?: string[];
		},
	): Promise<Message> {
		if (typeof input === "string") {
			return this.sendMessage({ text: input });
		}
		const sent = await this.#client.base.talk.sendMessage({
			to: this.mid,
			text: input.text,
			e2ee: input.e2ee !== false, // undefined -> true
			chunks: input.chunk,
			contentMetadata: input.contentMetadata,
			contentType: input.contentType,
			relatedMessageId: input.relatedMessageId,
			location: input.location,
		});
		return Message.fromRawTalk({
			...sent,
			to: this.mid,
		}, this.#client);
	}

	/**
	 * Create a Chat instance from raw message.
	 * @param raw Raw message
	 * @param client client
	 * @returns Chat
	 */
	static fromRaw(raw: line.Chat, client: Client) {
		return new Chat({
			client,

			mid: raw.chatMid,
			name: raw.chatName,
			created: new Date(Number(raw.createdTime)),
		});
	}
}
