import type { BaseClient } from "../base/mod.ts";
import { type LINEEvent, type SourceEvent, wrapEvents } from "./events/mod.ts";
import { Square } from "./features/square/mod.ts";
import { continueRequest } from "../base/mod.ts";
import { Chat } from "./features/chat/mod.ts";
import { User } from "./features/user/mod.ts";

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
	async *listen(opts: ListenOptions = {}): AsyncGenerator<LINEEvent> {
		const polling = this.base.createPolling();
		const stream = new ReadableStream<SourceEvent>({
			start(controller) {
				let listeningTalk = false;
				let listeningSquare = false;
				const tryToEnd = () => {
					if (!listeningTalk && !listeningSquare) {
						controller.close();
					}
				};
				if (opts.talk !== false) {
					listeningTalk = true;
					(async () => {
						for await (
							const event of polling.listenTalkEvents({
								signal: opts.signal,
							})
						) {
							controller.enqueue({ type: "talk", event });
						}
						listeningTalk = false;
						tryToEnd();
					})();
				}
				if (opts.square !== false) {
					listeningSquare = true;
					(async () => {
						for await (
							const event of polling.listenSquareEvents({
								signal: opts.signal,
							})
						) {
							controller.enqueue({ type: "square", event });
						}
						listeningSquare = false;
						tryToEnd();
					})();
				}
			},
		});

		const reader = stream.getReader();
		while (true) {
			const { done, value } = await reader.read();
			if (value) {
				yield await wrapEvents(value, this);
			}
			if (done) {
				return;
			}
		}
	}

	/** Gets auth token for LINE. */
	get authToken(): string {
		// NOTE: client is constructed when logined, so authToken is not undefined.
		return this.base.authToken as string;
	}

	/**
	 * Fetches all chat rooms the user joined.
	 */
	async fetchJoinedChats() {
		const joined = await this.base.talk.getAllChatMids({
			request: {
				withMemberChats: true,
			},
		});
		const { chats } = await this.base.talk.getChats({
			chatMids: joined.memberChatMids,
		});
		return chats.map((chat) => Chat.fromRaw(chat, this));
	}

	/**
	 * Fetches all squares the user joined.
	 */
	async fetchJoinedSquares(): Promise<Square[]> {
		const joined = await continueRequest({
			handler: (arg) => this.base.square.getJoinedSquares(arg),
			arg: { limit: 100 },
		});
		return joined.squares.map((raw) => Square.fromRaw(raw, this));
	}

	/**
	 * Fetches user by mid.
	 * @param mid User mid
	 * @returns User
	 */
	async fetchUser(mid: string) {
		const res = await this.base.relation.getContactsV3({
			mids: [mid],
		});
		const profile = res.responses[0];
		return new User({
			mid,
			isBot: profile.userType === "BOT" || profile.userType === 2,
		});
	}
}
