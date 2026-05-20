import type { BaseClient } from "../base/mod.ts";
import { Square, SquareChat } from "./features/square/mod.ts";
import { continueRequest } from "../base/mod.ts";
import { Chat } from "./features/chat/mod.ts";
import { User } from "./features/user/mod.ts";
import { TypedEventEmitter } from "../base/core/typed-event-emitter/index.ts";
import { SquareMessage, TalkMessage } from "./features/message/mod.ts";
import type * as LINETypes from "@evex/linejs-types";
import {
	getMyProfile,
	type MyProfileUpdate,
	updateMyProfile,
	uploadMyProfileBackground,
	uploadMyProfileImage,
} from "./features/profile.ts";
import { createLiffClient, type LiffClient } from "./features/liff.ts";
export * as liff from "./features/liff.ts";
export * as voom from "./features/voom.ts";
import { createVoomClient, VoomChannelId, type VoomClient, voomRest, type VoomRestOptions, type VoomRestResponse } from "./features/voom.ts";
export { VoomChannelId };
export type { VoomClient, VoomRestOptions, VoomRestResponse };
export * as call from "./features/call/mod.ts";
export * as audio from "./features/call/audio.ts";
import {
	type CallClient,
	type CancelCallEvent,
	createCallClient,
	type IncomingCallEvent,
	parseCancelCall,
	parseIncomingCall,
} from "./features/call/mod.ts";
export type { CallClient, CancelCallEvent, CallType, IncomingCallEvent } from "./features/call/mod.ts";
export { Chat, Square, SquareChat, SquareMessage, TalkMessage, User };
export { ProfileAttribute } from "./features/profile.ts";
export type { MyProfileUpdate } from "./features/profile.ts";
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
	"call:incoming": (event: IncomingCallEvent) => void;
	"call:cancel": (event: CancelCallEvent) => void;
};

function isApiNotCapable(e: unknown): boolean {
	const msg = e instanceof Error ? e.message : String(e);
	return /API method not capable/i.test(msg);
}

export class Client extends TypedEventEmitter<ClientEvents> {
	readonly base: BaseClient;
	#liff?: LiffClient;
	constructor(base: BaseClient) {
		super();
		this.base = base;
	}

	get liff(): LiffClient {
		if (!this.#liff) this.#liff = createLiffClient(this);
		return this.#liff;
	}

	voomRest<T = unknown>(opts: VoomRestOptions): Promise<VoomRestResponse<T>> {
		return voomRest(this, opts);
	}

	#voom?: VoomClient;
	get voom(): VoomClient {
		if (!this.#voom) this.#voom = createVoomClient(this);
		return this.#voom;
	}

	#call?: CallClient;
	/** Call control-plane wrapper (#148 v3.0). Media plane TBD. */
	get call(): CallClient {
		if (!this.#call) this.#call = createCallClient(this);
		return this.#call;
	}

	/**
	 * Listens events.
	 * @param opts Options
	 * @returns TypedEventEmitter
	 */
	listen(
		opts: ListenOptions = { talk: true, square: true },
	): void {
		const polling = this.base.createPolling();
		const signal = opts.signal;
		signal && signal.addEventListener("abort", () => {
			this.base.push.opStream.close();
			this.base.push.sqStream.close();
		});
		if (opts.talk) {
			(async () => {
				for await (
					const event of polling.listenTalkEvents()
				) {
					this.emit("event", event);
					if (
						event.type === "SEND_MESSAGE" ||
						event.type === "RECEIVE_MESSAGE"
					) {
						this.emit(
							"message",
							new TalkMessage({
								raw: await this.base.e2ee.decryptE2EEMessage(
									event.message,
								),
								client: this,
							}),
						);
					} else if (event.type === "NOTIFIED_RECEIVED_CALL") {
						this.emit("call:incoming", parseIncomingCall(event));
					} else if (event.type === "CANCEL_CALL") {
						this.emit("call:cancel", parseCancelCall(event));
					}
				}
			})();
		}
		if (opts.square) {
			(async () => {
				for await (
					const event of polling.listenSquareEvents()
				) {
					this.emit("square:event", event);
					if (event.type === "NOTIFICATION_MESSAGE") {
						this.emit(
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
	}

	/** Gets auth token for LINE. */
	get authToken(): string {
		// NOTE: client is constructed when logined, so authToken is not undefined.
		return this.base.authToken as string;
	}

	/** Returns the signed-in user's own profile. */
	getMyProfile(): Promise<LINETypes.Profile> {
		return getMyProfile(this);
	}

	/**
	 * Updates one or more attributes on the signed-in user's profile.
	 * @example client.updateMyProfile({ statusMessage: "今日も頑張る" })
	 */
	updateMyProfile(update: MyProfileUpdate): Promise<void> {
		return updateMyProfile(this, update);
	}

	/** Convenience: rename the signed-in user. */
	updateMyDisplayName(displayName: string): Promise<void> {
		return updateMyProfile(this, { displayName });
	}

	/** Convenience: set the signed-in user's status message (ステメ). */
	updateMyStatusMessage(statusMessage: string): Promise<void> {
		return updateMyProfile(this, { statusMessage });
	}

	/**
	 * Uploads a new profile picture for the signed-in user (the avatar
	 * shown in chats).  Returns the OBS object id + hash.
	 */
	uploadMyProfileImage(data: Blob): Promise<{ objId: string; objHash: string }> {
		return uploadMyProfileImage(this, data);
	}

	/**
	 * Uploads a new profile background (the cover photo behind the
	 * profile picture on the user's profile page).
	 */
	uploadMyProfileBackground(
		data: Blob,
	): Promise<{ objId: string; objHash: string }> {
		return uploadMyProfileBackground(this, data);
	}

	/**
	 * Fetches all chat rooms the user joined.
	 */
	async fetchJoinedChats(): Promise<Chat[]> {
		const joined = await this.base.talk.getAllChatMids({
			request: {
				withMemberChats: true,
			},
			syncReason: "INTERNAL",
		});
		const { chats } = await this.base.talk.getChats({
			chatMids: joined.memberChatMids,
		});
		return chats.map((raw) => new Chat({ client: this, raw }));
	}

	/** Fetches all friends. V3→V2→getUser fallback for #71. */
	async fetchUsers(): Promise<User[]> {
		const { userFriendMids } = await this.base.relation.getUserFriendIds({
			request: { blockStatus: "ALL" },
		});
		if (!userFriendMids?.length) return [];
		try {
			const res = await this.base.relation.getContactsV3({
				mids: userFriendMids,
			});
			return res.responses.map((raw) => new User({ client: this, raw }));
		} catch (e) {
			if (!isApiNotCapable(e)) throw e;
		}
		try {
			const res2 = await this.base.talk.getContactsV2({
				mids: userFriendMids,
			});
			// V2 returns { contacts: Record<mid, entry> }; shim to V3 shape.
			const out: User[] = [];
			for (const [mid, entry] of Object.entries(res2.contacts ?? {})) {
				out.push(new User({
					client: this,
					raw: { ...(entry as object), targetUserMid: mid } as never,
				}));
			}
			if (out.length) return out;
		} catch (e) {
			if (!isApiNotCapable(e)) throw e;
		}
		const out: User[] = [];
		for (const mid of userFriendMids) {
			try {
				out.push(await this.getUser(mid));
			} catch { /* skip unreachable */ }
		}
		return out;
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
			client: this,
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
