/**
 * Develop now
 * @experimental
 * for square
 */
import * as LINETypes from "../../../types/line_types.ts";
import type { Client } from "../index.ts";
import type { LooseType } from "./common.ts";
import { TypedEventEmitter } from "../libs/typed-event-emitter/index.ts";
import { SquareMessage } from "./message-class.ts";
import { Note } from "./talk-class.ts";

// deno-lint-ignore ban-types
type SquareEvents = {
	// update: (event: LINETypes.SquareEvent & { payload: {} }) => void;
};

type SquareChatEvents = {
	message: (message: SquareMessage) => void;
	// update: (event: LINETypes.SquareEvent & { payload: {} }) => void;
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
		private client: Client,
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
		this.lastJoinRequestAt = new Date(squareStatus.lastJoinRequestAt as number);
		this.openChatCount = squareStatus.openChatCount;
	}

	/**
	 * @description Generate from mid.
	 */
	static async from(squareMid: string, client: Client): Promise<Square> {
		return new this(await client.getSquare({ squareMid }), client);
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
	public syncToken?: string;
	public note: Note;
	constructor(
		public rawSouce: LINETypes.GetSquareChatResponse,
		private client: Client,
		polling: boolean = false,
	) {
		super();
		const { squareChat, squareChatMember, squareChatStatus } = rawSouce;
		this.mid = squareChat.squareChatMid;
		this.squareMid = squareChat.squareChatMid;
		this.type = squareChat.type;
		this.name = squareChat.name;
		this.chatImageObsHash = squareChat.chatImageObsHash;
		this.squareChatRevision = squareChat.squareChatRevision as number;
		this.maxMemberCount = squareChat.maxMemberCount;
		this.state = squareChat.state;
		this.invitationUrl = squareChat.invitationUrl;
		this.messageVisibility = squareChat.messageVisibility;
		this.ableToSearchMessage = [null, false, true][
			LINETypes.BooleanState[squareChat.ableToSearchMessage] as number
		];
		this.mymid = squareChatMember.squareMemberMid;
		this.memberCount = squareChatStatus.otherStatus.memberCount;
		this.note = new Note(this.squareMid, this.client);
		if (polling) {
			this.startPolling();
		}
	}

	/**
	 * @description Generate from mid.
	 */
	static async from(
		squareChatMid: string,
		client: Client,
		polling: boolean = true,
	): Promise<SquareChat> {
		return new this(
			await client.getSquareChat({ squareChatMid }),
			client,
			polling,
		);
	}

	public async getMembers(): Promise<SquareMember[]> {
		const r = await this.client.getSquareChatMembers({
			squareChatMid: this.mid,
			continueRequest: true,
		});
		return r.squareChatMembers.map((e) => new SquareMember(e, this.client));
	}

	/**
	 * @description Send msg to square.
	 */
	public send(
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
			return this.send({ text: options });
		} else {
			const _options: LooseType = options;
			_options.squareChatMid = this.mid;
			return this.client.sendSquareMessage(_options);
		}
	}
	public IS_POLLING: boolean = false;

	/**
	 * @description messages list received
	 */
	public messages: SquareMessage[] = [];

	/**
	 * @description start listen (fetchSquareChatEvents)
	 */
	public async startPolling(): Promise<void> {
		if (!this.syncToken) {
			while (true) {
				const noneEvent = await this.client.fetchSquareChatEvents({
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
		while (this.IS_POLLING && this.client.metadata?.authToken) {
			try {
				const response = await this.client.fetchSquareChatEvents({
					squareChatMid: this.mid,
					syncToken: this.syncToken,
				});
				if (this.syncToken !== response.syncToken) {
					this.emit("update:syncToken", response.syncToken);
					this.syncToken = response.syncToken;
				}
				for (const event of response.events) {
					this.emit("event", event);
					if (event.type === "SEND_MESSAGE" && event.payload.sendMessage) {
						const message = new SquareMessage(
							{ squareEventSendMessage: event.payload.sendMessage },
							this.client,
						);
						this.messages.push(message);
						this.emit("message", message);
					} else if (
						event.type === "RECEIVE_MESSAGE" &&
						event.payload.receiveMessage
					) {
						const message = new SquareMessage(
							{ squareEventReceiveMessage: event.payload.receiveMessage },
							this.client,
						);
						this.messages.push(message);
						this.emit("message", message);
					}
				}
				await new Promise<void>((resolve) => setTimeout(resolve, 500));
			} catch (e) {
				this.client.log("SquareChatPollingError", e);
				await new Promise<void>((resolve) => setTimeout(resolve, 2000));
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
		private client: Client,
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
		client: Client,
	): Promise<SquareMember> {
		return new this(
			await client
				.getSquareMember({ squareMemberMid })
				.then((r) => r.squareMember),
			client,
		);
	}
}
