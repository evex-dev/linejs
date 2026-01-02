/**
 * Develop now
 * @experimental
 * for square
 */
import * as LINETypes from "@evex/linejs-types";
import { type BaseClient, continueRequest } from "../core/mod.ts";
import { TypedEventEmitter } from "../core/typed-event-emitter/index.ts";
import { SquareMessage } from "./message-class.ts";
import { Note } from "./talk-class.ts";
import type { LooseType } from "@evex/loose-types";

type SquareEvents = {
	"update:feature": (feature: LINETypes.SquareFeatureSet) => void;
	"update:status": (status: LINETypes.SquareStatus) => void;
	joinrequest: (
		joinrequest: LINETypes.SquareEventNotificationJoinRequest,
	) => void;
	"update:note": (note: LINETypes.NoteStatus) => void;
	"update:authority": (authority: LINETypes.SquareAuthority) => void;
	"update:square": (square: LINETypes.Square) => void;
	update: (square: Square) => void;
	shutdown: (square: LINETypes.Square) => void;
};

type SquareChatEvents = {
	message: (message: SquareMessage) => void;
	update: (chat: SquareChat) => void;
	"update:chat": (chat: LINETypes.SquareChat) => void;
	"update:status": (status: LINETypes.SquareChatStatusWithoutMessage) => void;
	// todo
	// kick: (event: LINETypes.SquareEvent & { payload: {} }) => void;
	// leave: (event: LINETypes.SquareEvent & { payload: {} }) => void;
	// join: (event: LINETypes.SquareEvent & { payload: {} }) => void;
	// mention: (event: LINETypes.SquareEvent & { payload: {} }) => void;
	// unsend: (event: LINETypes.SquareEvent & { payload: {} }, message: SquareMessage) => void;
	// destroy: (event: LINETypes.SquareEvent & { payload: {} }, message: SquareMessage) => void;
	event: (event: LINETypes.SquareEvent) => void;
	"update:syncToken": (syncToken: string) => void;
};

type SquareMemberEvents = {
	message: (message: SquareMessage) => void;
	// update: (event: LINETypes.SquareEvent & { payload: {} }) => void;
};

/**
 * @description LINE square (Openchat) utils
 */
export class Square extends TypedEventEmitter<SquareEvents> {
	public mid: string;
	public name: string;
	public profileImageObsHash: string;
	public desc: string;
	public searchable: boolean;
	public type: LINETypes.SquareType;
	public invitationURL: string;
	public revision: number;
	public state: LINETypes.SquareState;
	public emblems: LINETypes.SquareEmblem[];
	public joinMethod: LINETypes.SquareJoinMethod;
	public createdAt: Date;
	public me: SquareMember;
	public authority: LINETypes.SquareAuthority;
	public noteStatus: LINETypes.NoteStatus;
	public status: LINETypes.SquareStatus;
	public memberCount: number;
	public joinRequestCount: number;
	public lastJoinRequestAt: Date;
	public openChatCount: number;

	public feature: LINETypes.SquareFeatureSet;

	public note: Note;

	constructor(
		public rawSouce: LINETypes.GetSquareResponse,
		private client: BaseClient,
		autoUpdate: boolean = true,
	) {
		super();

		const {
			square,
			noteStatus,
			myMembership,
			squareAuthority,
			squareStatus,
			squareFeatureSet,
		} = rawSouce;

		this.mid = square.mid;
		this.name = square.name;
		this.profileImageObsHash = square.profileImageObsHash;
		this.desc = square.desc;
		this.searchable = square.searchable;
		this.type = square.type;
		this.invitationURL = square.invitationURL;
		this.revision = square.revision as number;
		this.state = square.state;
		this.emblems = square.emblems;
		this.joinMethod = square.joinMethod;
		this.createdAt = new Date(square.createdAt as number);

		this.me = new SquareMember(myMembership, client);
		this.authority = squareAuthority;
		this.noteStatus = noteStatus;
		this.note = new Note(this.mid, this.client);
		this.feature = squareFeatureSet as LINETypes.SquareFeatureSet;
		this.status = squareStatus;
		this.memberCount = squareStatus.memberCount;
		this.joinRequestCount = squareStatus.joinRequestCount;
		this.lastJoinRequestAt = new Date(
			squareStatus.lastJoinRequestAt as number,
		);
		this.openChatCount = squareStatus.openChatCount;
		if (autoUpdate) {
			client.on("square:event", (event) => {
				if (
					event.payload.notifiedUpdateSquareFeatureSet &&
					event.payload.notifiedUpdateSquareFeatureSet
							.squareFeatureSet
							.squareMid === this.mid
				) {
					this.feature = event.payload.notifiedUpdateSquareFeatureSet
						.squareFeatureSet;
					this.emit("update", this);
					this.emit("update:feature", this.feature);
				} else if (
					event.payload.notifiedUpdateSquareStatus &&
					event.payload.notifiedUpdateSquareStatus.squareMid ===
						this.mid
				) {
					this.status = event.payload.notifiedUpdateSquareStatus.squareStatus;
					this.emit("update", this);
					this.emit("update:status", this.status);
				} else if (
					event.payload.notificationJoinRequest &&
					event.payload.notificationJoinRequest.squareMid === this.mid
				) {
					this.emit(
						"joinrequest",
						event.payload.notificationJoinRequest,
					);
				} else if (
					event.payload.notifiedUpdateSquareNoteStatus &&
					event.payload.notifiedUpdateSquareNoteStatus.squareMid ===
						this.mid
				) {
					this.noteStatus =
						event.payload.notifiedUpdateSquareNoteStatus.noteStatus;
					this.emit("update", this);
					this.emit("update:note", this.noteStatus);
				} else if (
					event.payload.notifiedUpdateSquareAuthority &&
					event.payload.notifiedUpdateSquareAuthority.squareMid ===
						this.mid
				) {
					this.authority = event.payload.notifiedUpdateSquareAuthority
						.squareAuthority;
					this.emit("update", this);
					this.emit("update:authority", this.authority);
				} else if (
					event.payload.notifiedShutdownSquare &&
					event.payload.notifiedShutdownSquare.square.mid === this.mid
				) {
					const { square } = event.payload.notifiedShutdownSquare;
					this.mid = square.mid;
					this.name = square.name;
					this.profileImageObsHash = square.profileImageObsHash;
					this.desc = square.desc;
					this.searchable = square.searchable;
					this.type = square.type;
					this.invitationURL = square.invitationURL;
					this.revision = square.revision as number;
					this.state = square.state;
					this.emblems = square.emblems;
					this.joinMethod = square.joinMethod;
					this.createdAt = new Date(square.createdAt as number);
					this.emit("update", this);
					this.emit("shutdown", square);
				} else if (
					event.payload.notifiedUpdateSquare &&
					event.payload.notifiedUpdateSquare.squareMid === this.mid
				) {
					const { square } = event.payload.notifiedUpdateSquare;
					this.mid = square.mid;
					this.name = square.name;
					this.profileImageObsHash = square.profileImageObsHash;
					this.desc = square.desc;
					this.searchable = square.searchable;
					this.type = square.type;
					this.invitationURL = square.invitationURL;
					this.revision = square.revision as number;
					this.state = square.state;
					this.emblems = square.emblems;
					this.joinMethod = square.joinMethod;
					this.createdAt = new Date(square.createdAt as number);
					this.emit("update", this);
					this.emit("update:square", square);
				}
			});
		}
	}

	/**
	 * @description Generate from mid.
	 */
	static async from(squareMid: string, client: BaseClient): Promise<Square> {
		return new this(await client.square.getSquare({ squareMid }), client);
	}
}

/**
 * @description LINE squareChat (Openchat) utils
 */
export class SquareChat extends TypedEventEmitter<SquareChatEvents> {
	public mymid: string;
	public mid: string;
	public squareMid: string;
	public type: LINETypes.SquareChatType;
	public name: string;
	public chatImageObsHash: string;
	public squareChatRevision: number;
	public maxMemberCount: number;
	public state: LINETypes.SquareChatState;
	public invitationUrl: string;
	public messageVisibility: LINETypes.MessageVisibility;
	public ableToSearchMessage: boolean | null;
	public memberCount: number;
	public status: LINETypes.SquareChatStatusWithoutMessage;
	public syncToken?: string;
	public note: Note;
	public polling_delay = 2000;
	constructor(
		public rawSouce: LINETypes.GetSquareChatResponse,
		private client: BaseClient,
		polling: boolean = false,
		autoUpdate: boolean = true,
	) {
		super();
		const { squareChat, squareChatMember, squareChatStatus } = rawSouce;
		this.mid = squareChat.squareChatMid;
		this.squareMid = squareChat.squareMid;
		this.type = squareChat.type;
		this.name = squareChat.name;
		this.chatImageObsHash = squareChat.chatImageObsHash;
		this.squareChatRevision = squareChat.squareChatRevision as number;
		this.maxMemberCount = squareChat.maxMemberCount;
		this.state = squareChat.state;
		this.invitationUrl = squareChat.invitationUrl;
		this.messageVisibility = squareChat.messageVisibility;
		this.ableToSearchMessage = [null, false, true][
			LINETypes.enums.BooleanState[
				squareChat.ableToSearchMessage as
					& LINETypes.BooleanState
					& string
			]
		];
		this.mymid = squareChatMember.squareMemberMid;
		this.memberCount = squareChatStatus.otherStatus.memberCount;
		this.status = squareChatStatus.otherStatus;
		this.note = new Note(this.squareMid, this.client);
		if (polling) {
			this.polling();
		}
		if (autoUpdate) {
			client.on("square:event", (event) => {
				if (
					event.payload.notifiedUpdateSquareChatStatus &&
					event.payload.notifiedUpdateSquareChatStatus
							.squareChatMid ===
						this.mid
				) {
					this.status = event.payload.notifiedUpdateSquareChatStatus
						.statusWithoutMessage;
					this.memberCount = this.status.memberCount;
					this.emit("update", this);
					this.emit("update:status", this.status);
				} else if (
					event.payload.notifiedUpdateSquareChat &&
					event.payload.notifiedUpdateSquareChat.squareChatMid ===
						this.mid
				) {
					const { squareChat } = event.payload.notifiedUpdateSquareChat;
					this.mid = squareChat.squareChatMid;
					this.squareMid = squareChat.squareMid;
					this.type = squareChat.type;
					this.name = squareChat.name;
					this.chatImageObsHash = squareChat.chatImageObsHash;
					this.squareChatRevision = squareChat
						.squareChatRevision as number;
					this.maxMemberCount = squareChat.maxMemberCount;
					this.state = squareChat.state;
					this.invitationUrl = squareChat.invitationUrl;
					this.messageVisibility = squareChat.messageVisibility;
					this.ableToSearchMessage = [null, false, true][
						LINETypes.enums.BooleanState[
							squareChat.ableToSearchMessage as
								& LINETypes.BooleanState
								& string
						]
					];
					this.emit("update", this);
					this.emit("update:chat", squareChat);
				}
			});
			if (polling) {
				this.on("event", (_event) => {});
			}
		}
	}

	/**
	 * @description Generate from mid.
	 */
	static async from(
		squareChatMid: string,
		client: BaseClient,
		polling: boolean = true,
	): Promise<SquareChat> {
		return new this(
			await client.square.getSquareChat({ squareChatMid }),
			client,
			polling,
		);
	}

	public async getMembers(): Promise<SquareMember[]> {
		const r = await continueRequest({
			handler: (
				param: {
					continuationToken?: string;
					squareChatMid: string;
					limit?: number;
				},
			) => this.client.square.getSquareChatMembers(param),
			arg: { squareChatMid: this.mid },
		});
		return r.squareChatMembers.map((e) => new SquareMember(e, this.client));
	}

	/**
	 * @description Send msg to square.
	 */
	public async send(
		options:
			| string
			| {
				text?: string;
				contentType?: number;
				contentMetadata?: LooseType;
				relatedMessageId?: string;
				location?: LINETypes.Location;
			},
	): Promise<LINETypes.SendMessageResponse> {
		if (typeof options === "string") {
			return await this.send({ text: options });
		} else {
			const _options: LooseType = options;
			_options.squareChatMid = this.mid;
			return await this.client.square.sendMessage(_options);
		}
	}
	public IS_POLLING: boolean = false;

	/**
	 * @description start listen (fetchSquareChatEvents)
	 */
	public async polling(): Promise<void> {
		if (!this.syncToken) {
			while (true) {
				const noneEvent = await this.client.square
					.fetchSquareChatEvents({
						squareChatMid: this.mid,
						syncToken: this.syncToken,
					});
				this.syncToken = noneEvent.syncToken;
				if (noneEvent.events.length === 0) {
					break;
				}
			}
		}
		this.IS_POLLING = true;
		this.emit("update:syncToken", this.syncToken);
		while (this.IS_POLLING && this.client.authToken) {
			try {
				const response = await this.client.square.fetchSquareChatEvents(
					{
						squareChatMid: this.mid,
						syncToken: this.syncToken,
					},
				);
				if (this.syncToken !== response.syncToken) {
					this.emit("update:syncToken", response.syncToken);
					this.syncToken = response.syncToken;
				}
				for (const event of response.events) {
					this.emit("event", event);
					if (
						event.type === "SEND_MESSAGE" &&
						event.payload.sendMessage
					) {
						const message = new SquareMessage(
							{
								squareEventSendMessage: event.payload.sendMessage,
							},
							this.client,
						);
						this.emit("message", message);
					} else if (
						event.type === "RECEIVE_MESSAGE" &&
						event.payload.receiveMessage
					) {
						const message = new SquareMessage(
							{
								squareEventReceiveMessage: event.payload.receiveMessage,
							},
							this.client,
						);
						this.emit("message", message);
					}
				}
				await new Promise<void>((resolve) =>
					setTimeout(resolve, this.polling_delay)
				);
			} catch (error) {
				this.client.log("SquareChatPollingError", { error });
				await new Promise<void>((resolve) =>
					setTimeout(resolve, this.polling_delay)
				);
			}
		}
	}
}

/**
 * @description LINE squareMember (Openchat user) utils
 */
export class SquareMember extends TypedEventEmitter<SquareMemberEvents> {
	public mid: string;
	public squareMid: string;
	public displayName: string;
	public profileImageObsHash: string;
	public ableToReceiveMessage: boolean;
	public membershipState: LINETypes.SquareMembershipState;
	public role: LINETypes.SquareMemberRole;
	public revision: number;
	public preference: LINETypes.SquarePreference;
	public joinMessage?: string;
	constructor(
		public rawMember: LINETypes.SquareMember,
		private client: BaseClient,
	) {
		super();

		this.mid = rawMember.squareMemberMid;
		this.squareMid = rawMember.squareMid;
		this.displayName = rawMember.displayName;
		this.profileImageObsHash = rawMember.profileImageObsHash;
		this.ableToReceiveMessage = rawMember.ableToReceiveMessage;
		this.membershipState = rawMember.membershipState;
		this.role = rawMember.role;
		this.revision = rawMember.revision as number;
		this.preference = rawMember.preference;
		this.joinMessage = rawMember.joinMessage;
	}

	/**
	 * @description Generate from mid.
	 */
	static async from(
		squareMemberMid: string,
		client: BaseClient,
	): Promise<SquareMember> {
		return new this(
			await client.square.getSquareMember({ squareMemberMid })
				.then((r) => r.squareMember),
			client,
		);
	}
}
