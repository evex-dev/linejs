import type { BaseClient } from "../base/mod.ts";
import { Square, SquareChat } from "./features/square/mod.ts";
import { continueRequest } from "../base/mod.ts";
import { Chat } from "./features/chat/mod.ts";
import { User } from "./features/user/mod.ts";
import { TypedEventEmitter } from "../base/core/typed-event-emitter/index.ts";
import { SquareMessage, TalkMessage } from "./features/message/mod.ts";
import type * as LINETypes from "@evex/linejs-types";
export { Chat, Square, SquareChat, SquareMessage, TalkMessage, User };
export interface ListenOptions {
	/**
	 * A boolean of whether to enable receiving talk events.
	 * @default true
	 */
	talk?: boolean;

	/**
	 * A boolean of whether to enable receiving square (OpenChat) events.
	 * @default false
	 */
	square?: boolean;

	/**
	 * A AbortSignal to stop listening.
	 */
	signal?: AbortSignal;
}
export type ClientEvents = {
	message: (message: TalkMessage) => void;
	event: (event: LINETypes.Operation) => void;
	"square:message": (message: SquareMessage) => void;
	"square:event": (event: LINETypes.SquareEvent) => void;
};

export class Client {
	readonly base: BaseClient;
	constructor(base: BaseClient) {
		this.base = base;
	}

	/**
	 * Listens events.
	 * @param opts Options
	 * @returns Async generator
	 */
	listen(opts: ListenOptions = {}): TypedEventEmitter<ClientEvents> {
		const polling = this.base.createPolling();
		const eventTarget = new TypedEventEmitter<ClientEvents>();
		if (opts.talk) {
			(async () => {
				for await (
					const event of polling.listenTalkEvents({
						signal: opts.signal,
					})
				) {
					eventTarget.emit("event", event);
					if (
						event.type === "SEND_MESSAGE" ||
						event.type === "RECEIVE_MESSAGE"
					) {
						eventTarget.emit(
							"message",
							new TalkMessage({
								raw: event.message,
								client: this,
							}),
						);
					}
				}
			})();
		}
		if (opts.square) {
			(async () => {
				for await (
					const event of polling.listenSquareEvents({
						signal: opts.signal,
					})
				) {
					eventTarget.emit("square:event", event);
					if (event.type === "NOTIFICATION_MESSAGE") {
						eventTarget.emit(
							"square:message",
							new SquareMessage({
								raw: event.payload.notificationMessage
									.squareMessage,
								client: this,
							}),
						);
					}
				}
			})();
		}
		return eventTarget;
	}

	/** Gets auth token for LINE. */
	get authToken(): string {
		// NOTE: client is constructed when logined, so authToken is not undefined.
		return this.base.authToken as string;
	}

	/**
	 * Fetches all chat rooms the user joined.
	 */
	async fetchJoinedChats(): Promise<Chat[]> {
		const joined = await this.base.talk.getAllChatMids({
			request: {
				withMemberChats: true,
			},
		});
		const { chats } = await this.base.talk.getChats({
			chatMids: joined.memberChatMids,
		});
		return chats.map((raw) => new Chat({ client: this, raw }));
	}

	/**
	 * Fetches all friend.
	 */
	async fetchUsers(): Promise<User[]> {
		const mids = await this.base.talk.getAllContactIds({
			syncReason: "INTERNAL",
		});
		const res = await this.base.relation.getContactsV3({
			mids,
		});
		const contacts = res.responses;
		return contacts.map((raw) =>
			new User({
				raw,
			})
		);
	}

	/**
	 * Fetches all squares the user joined.
	 */
	async fetchJoinedSquares(): Promise<Square[]> {
		const joined = await continueRequest({
			handler: (arg) => this.base.square.getJoinedSquares(arg),
			arg: { limit: 100 },
		});
		return joined.squares.map((raw) => new Square({ raw, client: this }));
	}
	/**
	 * Fetches all square chats the user joined.
	 */
	async fetchJoinedSquareChats(): Promise<SquareChat[]> {
		const response = await this.base.square.fetchMyEvents({
			limit: 200,
		});
		const squareChats: SquareChat[] = [];
		for (const event of response.events) {
			if (
				event.payload.notifiedCreateSquareChatMember
			) {
				squareChats.push(
					new SquareChat({
						client: this,
						raw: event.payload.notifiedCreateSquareChatMember.chat,
					}),
				);
			}
		}
		return squareChats;
	}

	/**
	 * Gets user by mid.
	 * @param mid User mid
	 * @returns User
	 */
	async getUser(mid: string): Promise<User> {
		const res = await this.base.relation.getContactsV3({
			mids: [mid],
		});
		const raw = res.responses[0];
		return new User({
			raw,
		});
	}

	/**
	 * Gets chat by mid.
	 * @param chatMid Chat mid
	 * @returns Chat
	 */
	async getChat(chatMid: string): Promise<Chat> {
		const raw = await this.base.talk.getChat({
			chatMid,
			withInvitees: true,
			withMembers: true,
		});
		return new Chat({ client: this, raw });
	}

	/**
	 * Gets square by mid.
	 * @param squareMid Square mid
	 * @returns Square
	 */
	async getSquare(squareMid: string): Promise<Square> {
		const raw = await this.base.square.getSquare({ squareMid });
		return new Square({ client: this, raw: raw.square });
	}

	/**
	 * Gets square by mid.
	 * @param squareChatMid Square chat mid
	 * @returns SquareChat
	 */
	async getSquareChat(squareChatMid: string): Promise<SquareChat> {
		const raw = await this.base.square.getSquareChat({ squareChatMid });
		return new SquareChat({ client: this, raw: raw.squareChat });
	}
}
