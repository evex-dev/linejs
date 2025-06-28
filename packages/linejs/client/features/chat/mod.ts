import type { Client } from "../../mod.ts";
import type * as line from "@evex/linejs-types";
import { TalkMessage } from "../message/talk.ts";
import { createMessageFetcher, type MessageFetcher } from "./fetcher.ts";

interface ChatInit {
	client: Client;
	raw: line.Chat;
}

/**
 * Talk chat(group) class (not a OpenChat)
 */
export class Chat {
	#client: Client;
	raw: line.Chat;
	readonly mid: string;
	name: string;
	constructor(init: ChatInit) {
		this.#client = init.client;
		this.mid = init.raw.chatMid;
		this.name = init.raw.chatName;
		this.raw = init.raw;
	}

	/**
	 * Sends message to the chat(group).
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
	): Promise<TalkMessage> {
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
		return TalkMessage.fromRawTalk({
			...sent,
			to: this.mid,
		}, this.#client);
	}

	/**
	 * @description Update chat(group) status.
	 */
	async updateChat(options: {
		chat: Partial<line.Chat>;
		updatedAttribute: line.Pb1_O2;
	}): Promise<line.Pb1_Zc> {
		return await this.#client.base.talk.updateChat({
			request: {
				updatedAttribute: options.updatedAttribute,
				chat: options.chat,
				reqSeq: await this.#client.base.getReqseq(),
			},
		});
	}

	/**
	 * @description Update chat(group) name.
	 */
	public async updateName(name: string): Promise<line.Pb1_Zc> {
		return await this.updateChat({
			chat: { chatName: name },
			updatedAttribute: "NAME",
		});
	}

	/**
	 * @description Invite user.
	 */
	public async invite(
		mids: string[],
	): Promise<line.Pb1_J5> {
		return await this.#client.base.talk.inviteIntoChat({
			targetUserMids: mids,
			chatMid: this.mid,
		});
	}

	/**
	 * @description Kickout user.
	 */
	public kick(mid: string): Promise<line.Pb1_M3> {
		return this.#client.base.talk.deleteOtherFromChat({
			request: {
				targetUserMids: [mid],
				chatMid: this.mid,
			},
		});
	}
	/**
	 * @description Leave chat.
	 */
	public leave(): Promise<line.Pb1_M3> {
		return this.#client.base.talk.deleteSelfFromChat({
			request: {
				chatMid: this.mid,
			},
		});
	}

	/**
	 * Fetches messages from the chat(group).
	 *
	 * @param limit The number of messages to fetch. Defaults to 10.
	 * @returns A promise that resolves to an array of TalkMessage instances.
	 */
	async fetchMessages(limit: number = 10): Promise<TalkMessage[]> {
		const boxes = await this.#client.base.talk.getMessageBoxes({
			messageBoxListRequest: {},
		});
		const box = boxes.messageBoxes.find((box) => box.id === this.mid);
		if (!box) {
			throw new Error("Message box not found.");
		}
		const messages = await this.#client.base.talk
			.getPreviousMessagesV2WithRequest({
				request: {
					messageBoxId: box.id,
					endMessageId: {
						messageId: box.lastDeliveredMessageId.messageId,
						deliveredTime: box.lastDeliveredMessageId.deliveredTime,
					},
					messagesCount: limit,
				},
			});

		return await Promise.all(
			messages.map((message) => TalkMessage.fromRawTalk(message, this.#client)),
		);
	}

	messageFetcher(): Promise<MessageFetcher> {
		return createMessageFetcher(this.#client, this);
	}
}
