/**
 * Develop now
 * @experimental
 */
import * as LINETypes from "../../../types/line_types.ts";
import { parseEnum } from "../../../types/thrift.ts";
import type { Client } from "../index.ts";
import type { LooseType } from "./common.ts";
import type { Buffer } from "node:buffer";
import { InternalError } from "./errors.ts";
import { TypedEventEmitter } from "../libs/typed-event-emitter/index.ts";

const hasContents = ["IMAGE", "VIDEO", "AUDIO", "FILE"];

type GroupEvents = {
	message: (message: TalkMessage) => void;
	kick: (event: Operation & { event: DeleteOtherFromChat }) => void; // +NotifiedDeleteOtherFromChat
	leave: (
		event: Operation & { event: NotifiedLeaveChat | DeleteSelfFromChat },
	) => void;
	// update: (event: Operation & { event:  }) => void; name,img
	// invite: (event: Operation & { event:  }) => void;
	// join: (event: Operation & { event:  }) => void;
	// mention: (message: TalkMessage) => void;
	// unsend: (event: Operation & { event:  }, message: TalkMessage) => void;
};

type UserEvents = {
	message: (message: TalkMessage) => void;
	update: (
		event: Operation & {
			event: NotifiedUpdateProfile | NotifiedUpdateProfileContent;
		},
	) => void;
};

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
};

type SquareMemberEvents = {
	message: (message: SquareMessage) => void;
	// update: (event: LINETypes.SquareEvent & { payload: {} }) => void;
};

type booleanString = "true" | "false";

interface splitInfo {
	start: number;
	end: number;
	mention?: number;
	emoji?: number;
};

interface decorationText {
	text: string;
	emoji?: {
		productId: string;
		sticonId: string;
		version?: number;
		resourceType?: string;
		url?: string;
	};
	mention?: {
		mid?: string;
		all?: true;
	};
};

interface stkMeta {
	STKPKGID: string;
	STKID: string;
	STKTXT: string;
	STKVER: string;
	STKOPT?: string;
};
interface mentionMeta {
	MENTION: {
		MENTIONEES: {
			M?: string;
			S: string;
			E: string;
			A?: string;
		}[];
	};
};
interface emojiMeta {
	REPLACE: {
		sticon: {
			resources: {
				S: number;
				E: number;
				productId: string;
				sticonId: string;
				version: number;
				resourceType: string;
			}[];
		};
	};
	STICON_OWNERSHIP: string[];
};
interface contactMeta {
	mid: string;
	displayName: string;
};
interface flexMeta {
	FLEX_VER: string;
	FLEX_JSON: Record<string, LooseType>;
	ALT_TEXT: string;
	EFFECT_TAG?: string;
};

interface fileMeta {
	FILE_SIZE: string;
	FILE_EXPIRE_TIMESTAMP: string;
	FILE_NAME: string;
};

interface imgExtMeta {
	PREVIEW_URL: string;
	DOWNLOAD_URL: string;
};

interface chatEventMeta {
	LOC_KEY: string | "C_MI" | "C_MR" | "C_ML" | "C_GI"; // chat_invite chat_remove chat_leave chat_invite?? ?
	LOC_ARGS: string; // mid\x1E * n
	SKIP_BADGE_COUNT: booleanString;
};

interface callMeta {
	GC_EVT_TYPE: "S" | "E"; // start end
	GC_CHAT_MID: string;
	CAUSE: string; // 16
	GC_MEDIA_TYPE: "AUDIO" | "VIDEO";
	VERSION: "X";
	GC_PROTO: "C";
	TYPE: "G";
	GC_IGNORE_ON_FAILBACK: booleanString;
	RESULT: "INFO";
	DURATION: string;
	SKIP_BADGE_COUNT: booleanString;
};

interface postNotificationMetq {
	serviceType: "GB";
	postEndUrl: string;
	locKey: "BG";
	text: string;
	contentType: "P";
	cafeId: "0";
};

/**
 * @description Gets mid's type
 */
function getMidType(mid: string): LINETypes.MIDType | null {
	/**
	 * USER(0),
	 * ROOM(1),
	 * GROUP(2),
	 * SQUARE(3),
	 * SQUARE_CHAT(4),
	 * SQUARE_MEMBER(5),
	 * BOT(6);
	 */
	const _u = mid.charAt(0);
	switch (_u) {
		case "u":
			return parseEnum("MIDType", 0) as LINETypes.MIDType;
		case "r":
			return parseEnum("MIDType", 1) as LINETypes.MIDType;
		case "c":
			return parseEnum("MIDType", 2) as LINETypes.MIDType;
		case "s":
			return parseEnum("MIDType", 3) as LINETypes.MIDType;
		case "m":
			return parseEnum("MIDType", 4) as LINETypes.MIDType;
		case "p":
			return parseEnum("MIDType", 5) as LINETypes.MIDType;
		case "v":
			return parseEnum("MIDType", 6) as LINETypes.MIDType;
		default:
			return null;
	}
}

export class Note {
	constructor(
		public mid: string,
		private client: Client,
	) { }

	public createPost(options: {
		text?: string;
		sharedPostId?: string;
		textSizeMode?: "AUTO" | "NORMAL";
		backgroundColor?: string;
		textAnimation?: "NONE" | "SLIDE" | "ZOOM" | "BUZZ" | "BOUNCE" | "BLINK";
		readPermissionType?: "ALL" | "FRIEND" | "GROUP" | "EVENT" | "NONE";
		readPermissionGids?: string[];
		holdingTime?: number;
		stickerIds?: string[];
		stickerPackageIds?: string[];
		locationLatitudes?: number[];
		locationLongitudes?: number[];
		locationNames?: string[];
		mediaObjectIds?: string[];
		mediaObjectTypes?: string[];
		sourceType?: string;
	}): Promise<LooseType> {
		(options as LooseType).homeId = this.mid;
		return this.client.createPost(options as LooseType);
	}
	public deletePost(options: {
		postId: string;
	}) {
		(options as LooseType).homeId = this.mid;
		return this.client.deletePost(options as LooseType);
	}

	public listPost(options?: {
		postId?: string;
		updatedTime?: number;
		sourceType?: string;
	}): Promise<LooseType> {
		(options as LooseType).homeId = this.mid;
		return this.client.listPost(options as LooseType);
	}
}

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
	static async from(squareMid: string, client: Client) {
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
	constructor(
		public rawSouce: LINETypes.GetSquareChatResponse,
		private client: Client,
		polling: boolean = false
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
		if (polling) {
			this.startListen()
		}
	}

	/**
	 * @description Generate from mid.
	 */
	static async from(squareChatMid: string, client: Client, polling: boolean = true) {
		return new this(await client.getSquareChat({ squareChatMid }), client, polling);
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
	public async startListen(): Promise<void> {
		while (true) {
			const noneEvent = await this.client.fetchSquareChatEvents({ squareChatMid: this.mid, syncToken: this.syncToken })
			this.syncToken = noneEvent.syncToken
			if (noneEvent.events.length === 0) {
				break
			}
		}
		this.IS_POLLING = true
		while (this.IS_POLLING && this.client.metadata?.authToken) {
			try {
				const response = await this.client.fetchSquareChatEvents({ squareChatMid: this.mid, syncToken: this.syncToken })
				this.syncToken = response.syncToken
				for (const event of response.events) {
					this.emit("event", event)
					if (event.type === "SEND_MESSAGE" && event.payload.sendMessage) {
						this.emit("message", new SquareMessage({ squareEventSendMessage: event.payload.sendMessage }, this.client))
					} else if (event.type === "RECEIVE_MESSAGE" && event.payload.receiveMessage) {
						this.emit("message", new SquareMessage({ squareEventReceiveMessage: event.payload.receiveMessage }, this.client))
					}
				}
				await new Promise<void>((resolve) => setTimeout(resolve, 500))
			} catch (e) {
				this.client.log("SquareChatPollingError", e)
				await new Promise<void>((resolve) => setTimeout(resolve, 2000))
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
	static async from(squareMemberMid: string, client: Client) {
		return new this(
			await client
				.getSquareMember({ squareMemberMid })
				.then((r) => r.squareMember),
			client,
		);
	}
}

/**
 * @description LINE user (contact) utils
 */
export class User extends TypedEventEmitter<UserEvents> {
	public rawSource: LINETypes.Contact;
	public mid: string;
	public createdTime: Date;
	public type: LINETypes.ContactType;
	public status: LINETypes.ContactStatus;
	public relation: LINETypes.ContactRelation;
	public displayName: string;
	public phoneticName: string;
	public pictureStatus: string;
	public thumbnailUrl: string;
	public statusMessage: string;
	public displayNameOverridden: string;
	public favoriteTime: Date;
	public capableVoiceCall: boolean;
	public capableVideoCall: boolean;
	public capableMyhome: boolean;
	public capableBuddy: boolean;
	public attributes: number;
	public picturePath: string;
	public recommendParams: string;
	public friendRequestStatus: LINETypes.FriendRequestStatus;
	public musicProfile: string;
	public videoProfile: string;
	public statusMessageContentMetadata: { [k: string]: string };
	public avatarProfile: LINETypes.AvatarProfile;
	public friendRingtone: string;
	public friendRingbackTone: string;
	public nftProfile: boolean;
	public pictureSource: LINETypes.PictureSource;
	public groupStatus: Record<string, LooseType> & {
		joinedAt?: Date;
		invitedAt?: Date;
	} = {};
	public birthday: LINETypes.ContactCalendarEvent;

	/**
	 * @description Generate from mid.
	 */
	static async from(mid: string, client: Client) {
		if (mid === client.user?.mid) {
			return new this(
				{
					...(await client.getContactsV2({ mids: [mid] })).contacts[mid],
					contact: await client.getContact({ mid }, false),
				},
				client,
			);
		}
		return new this(
			(await client.getContactsV2({ mids: [mid] })).contacts[mid],
			client,
		);
	}

	constructor(
		contactEntry: LINETypes.ContactEntry,
		private client: Client,
	) {
		super();

		const { contact } = contactEntry;
		this.birthday =
			contactEntry.calendarEvents?.events &&
			contactEntry.calendarEvents.events[0];
		this.rawSource = contact;
		console.log(contactEntry);
		this.mid = contact.mid;
		this.createdTime = new Date((contact.createdTime as number) * 1000);
		this.type = contact.type;
		this.status = contact.status;
		this.relation = contact.relation;
		this.displayName = contact.displayName;
		this.phoneticName = contact.phoneticName;
		this.pictureStatus = contact.pictureStatus;
		this.thumbnailUrl = contact.thumbnailUrl;
		this.statusMessage = contact.statusMessage;
		this.displayNameOverridden = contact.displayNameOverridden;
		this.favoriteTime = new Date((contact.favoriteTime as number) * 1000);
		this.capableVoiceCall = contact.capableVoiceCall;
		this.capableVideoCall = contact.capableVideoCall;
		this.capableMyhome = contact.capableMyhome;
		this.capableBuddy = contact.capableBuddy;
		this.attributes = contact.attributes;
		this.picturePath = contact.picturePath;
		this.recommendParams = contact.recommendParams;
		this.friendRequestStatus = contact.friendRequestStatus;
		this.musicProfile = contact.musicProfile;
		this.videoProfile = contact.videoProfile;
		this.statusMessageContentMetadata = contact.statusMessageContentMetadata;
		this.avatarProfile = contact.avatarProfile;
		this.friendRingtone = contact.friendRingtone;
		this.friendRingbackTone = contact.friendRingbackTone;
		this.nftProfile = contact.nftProfile;
		this.pictureSource = contact.pictureSource;
	}

	/**
	 * @description Update status.
	 */
	public updateStatusFrom(contactEntry: LINETypes.ContactEntry) {
		const { contact } = contactEntry;
		this.birthday = contactEntry.calendarEvents.events[0];
		this.rawSource = contact;
		this.mid = contact.mid;
		this.createdTime = new Date((contact.createdTime as number) * 1000);
		this.type = contact.type;
		this.status = contact.status;
		this.relation = contact.relation;
		this.displayName = contact.displayName;
		this.phoneticName = contact.phoneticName;
		this.pictureStatus = contact.pictureStatus;
		this.thumbnailUrl = contact.thumbnailUrl;
		this.statusMessage = contact.statusMessage;
		this.displayNameOverridden = contact.displayNameOverridden;
		this.favoriteTime = new Date((contact.favoriteTime as number) * 1000);
		this.capableVoiceCall = contact.capableVoiceCall;
		this.capableVideoCall = contact.capableVideoCall;
		this.capableMyhome = contact.capableMyhome;
		this.capableBuddy = contact.capableBuddy;
		this.attributes = contact.attributes;
		this.picturePath = contact.picturePath;
		this.recommendParams = contact.recommendParams;
		this.friendRequestStatus = contact.friendRequestStatus;
		this.musicProfile = contact.musicProfile;
		this.videoProfile = contact.videoProfile;
		this.statusMessageContentMetadata = contact.statusMessageContentMetadata;
		this.avatarProfile = contact.avatarProfile;
		this.friendRingtone = contact.friendRingtone;
		this.friendRingbackTone = contact.friendRingbackTone;
		this.nftProfile = contact.nftProfile;
		this.pictureSource = contact.pictureSource;
	}

	/**
	 * @description Send msg to user.
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
				chunk?: string[] | Buffer[];
				e2ee?: boolean;
			},
	): Promise<LINETypes.Message> {
		if (typeof options === "string") {
			return this.send({ text: options });
		} else {
			const _options: LooseType = options;
			_options.to = this.mid;
			return this.client.sendMessage(_options);
		}
	}

	/**
	 * @description Update status (auto).
	 */
	public async updateStatus() {
		this.updateStatusFrom(
			(await this.client.getContactsV2({ mids: [this.mid] })).contacts[
			this.mid
			],
		);
	}

	/**
	 * @description Kickout from group.
	 */
	public kick(
		chatMid: string = "",
	): Promise<LINETypes.DeleteOtherFromChatResponse> {
		return this.client.deleteOtherFromChat({ to: chatMid, mid: this.mid });
	}

	/**
	 * @description Invite to group.
	 */
	public invite(chatMid: string): Promise<LINETypes.InviteIntoChatResponse> {
		return this.client.inviteIntoChat({ to: chatMid, mids: [this.mid] });
	}

	/**
	 * @description Add to friend.
	 */
	public addFriend() {
		return this.client.addFriendByMid({ mid: this.mid });
	}

	public isMe() {
		return this.client.user?.mid === this.mid;
	}
}

/**
 * @description LINE group (chat) utils
 */
export class Group extends TypedEventEmitter<GroupEvents> {
	public rawSource: LINETypes.Chat;
	public mid: string;
	public createdTime: Date;
	public name: string;
	public picturePath: string;
	public preventedJoinByTicket: boolean;
	public invitationTicket: string;
	public notificationDisabled: boolean;
	public note: Note;

	/**
	 * @description Generate from groupMid or {Chat}.
	 */
	static async from(gidOrChat: string | LINETypes.Chat, client: Client) {
		const chat: LINETypes.Chat =
			typeof gidOrChat === "string"
				? await client.getChat({ gid: gidOrChat })
				: gidOrChat;
		const creator = await User.from(chat.extra.groupExtra.creator, client);
		const _members = (
			await client.getContactsV2({
				mids: Object.keys(chat.extra.groupExtra.memberMids),
			})
		).contacts;
		const members: User[] = [];
		for (const key in _members) {
			if (Object.prototype.hasOwnProperty.call(_members, key)) {
				let user: User;
				if (key === client.user?.mid) {
					user = new User(
						{
							..._members[key],
							contact: await client.getContact({ mid: key }),
						},
						client,
					);
				} else {
					user = new User(_members[key], client);
				}
				user.groupStatus.joinedAt = new Date(
					(chat.extra.groupExtra.memberMids[key] as number) * 1000,
				);
				user.kick = user.kick.bind(user, chat.chatMid);
				members.push();
			}
		}
		const _invitee = (
			await client.getContactsV2({
				mids: Object.keys(chat.extra.groupExtra.inviteeMids),
			})
		).contacts;
		const invitee: User[] = [];
		for (const key in _invitee) {
			if (Object.prototype.hasOwnProperty.call(_invitee, key)) {
				let user: User;
				if (key === client.user?.mid) {
					user = new User(
						{
							..._invitee[key],
							contact: await client.getContact({ mid: key }),
						},
						client,
					);
				} else {
					user = new User(_invitee[key], client);
				}
				user.groupStatus.invitedAt = new Date(
					(chat.extra.groupExtra.inviteeMids[key] as number) * 1000,
				);
				user.kick = user.kick.bind(user, chat.chatMid);
				members.push();
			}
		}
		return new this(chat, client, creator, members, invitee);
	}
	constructor(
		chat: LINETypes.Chat,
		private client: Client,
		public creator: User,
		public members: User[],
		public invitee: User[],
	) {
		super();

		this.rawSource = chat;
		this.mid = chat.chatMid;
		this.createdTime = new Date((chat.createdTime as number) * 1000);
		this.name = chat.chatName;
		this.picturePath = chat.picturePath;
		this.notificationDisabled = chat.notificationDisabled;
		const { groupExtra } = chat.extra;
		this.preventedJoinByTicket = groupExtra.preventedJoinByTicket;
		this.invitationTicket = groupExtra.invitationTicket;
		this.note = new Note(this.mid, client);
		// client.on("message",(msg)=>msg.to===this.mid:this.emit("message",msg)?undefined)
	}

	/**
	 * @description Send msg to group.
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
				chunk?: string[] | Buffer[];
				e2ee?: boolean;
			},
	): Promise<LINETypes.Message> {
		if (typeof options === "string") {
			return this.send({ text: options });
		} else {
			const _options: LooseType = options;
			_options.to = this.mid;
			return this.client.sendMessage(_options);
		}
	}

	/**
	 * @description Update group status.
	 */
	public set(options: {
		chatSet: Partial<LINETypes.Chat>;
		updatedAttribute: LINETypes.ChatAttribute;
	}): Promise<LINETypes.UpdateChatResponse> {
		const _options: LooseType = options;
		_options.chatMid = this.mid;
		return this.client.updateChat(_options);
	}

	/**
	 * @description Update group name.
	 */
	public setName(name: string): Promise<LINETypes.UpdateChatResponse> {
		return this.set({ chatSet: { chatName: name }, updatedAttribute: 1 });
	}

	/**
	 * @description Invite user.
	 */
	public invite(mids: string[]): Promise<LINETypes.InviteIntoChatResponse> {
		return this.client.inviteIntoChat({ to: this.mid, mids });
	}

	/**
	 * @description Kickout user.
	 */
	public kick(mid: string): Promise<LINETypes.DeleteOtherFromChatResponse> {
		return this.client.deleteOtherFromChat({ to: this.mid, mid: mid });
	}
}

/**
 * @description LINE talk event utils
 */
export class Operation {
	public rawSource: LINETypes.Operation;
	protected client?: Client;
	public message?: Message | TalkMessage;
	public revision: number;
	public createdTime: Date;
	public type: LINETypes.OpType;
	public reqSeq: number = 0;
	public checksum?: string;
	public status?: "ALERT_DISABLED" | LINETypes.OpStatus;
	public param: { 1?: string; 2?: string; 3?: string } = {};
	public event?:
		| SendChatRemoved
		| SendChatChecked
		| NotifiedReadMessage
		| NotifiedSendReaction
		| SendReaction
		| NotifiedUpdateProfile
		| NotifiedUpdateProfileContent
		| DestroyMessage
		| NotifiedDestroyMessage
		| NotifiedJoinChat
		| NotifiedAcceptChatInvitation
		| InviteIntoChat
		| DeleteSelfFromChat
		| NotifiedLeaveChat
		| DeleteOtherFromChat;

	constructor(
		source: LINETypes.Operation,
		client?: Client,
		emit: boolean = false,
	) {
		this.rawSource = source;
		this.client = client;
		this.revision = source.revision as number;
		this.checksum = source.checksum;
		this.createdTime = new Date((source.createdTime as number) * 1000);
		this.type =
			(parseEnum("OpType", source.type) as LINETypes.OpType) || source.type;
		this.reqSeq = source.reqSeq;
		this.status =
			(parseEnum("OpStatus", source.status) as LINETypes.OpStatus) ||
			source.status;
		this.param = {
			1: source.param1,
			2: source.param2,
			3: source.param3,
		};
		if (
			source.type === "RECEIVE_MESSAGE" ||
			source.type === "SEND_MESSAGE" ||
			source.type === "SEND_CONTENT"
		) {
			if (client) {
				this.message = new TalkMessage({ message: source.message }, client);
			} else {
				this.message = new Message({ message: source.message });
			}
		}
		if (source.type == "SEND_CHAT_REMOVED") {
			this.event = new SendChatRemoved(this);
		} else if (source.type == "SEND_CHAT_CHECKED") {
			this.event = new SendChatChecked(this);
		} else if (source.type == "NOTIFIED_READ_MESSAGE") {
			this.event = new NotifiedReadMessage(this);
		} else if (source.type == "NOTIFIED_SEND_REACTION") {
			this.event = new NotifiedSendReaction(this);
		} else if (source.type == "SEND_REACTION") {
			this.event = new SendReaction(this);
		} else if (source.type == "NOTIFIED_UPDATE_PROFILE") {
			this.event = new NotifiedUpdateProfile(this);
		} else if (source.type == "NOTIFIED_UPDATE_PROFILE_CONTENT") {
			this.event = new NotifiedUpdateProfileContent(this);
		} else if (source.type == "DESTROY_MESSAGE") {
			this.event = new DestroyMessage(this);
		} else if (source.type == "NOTIFIED_DESTROY_MESSAGE") {
			this.event = new NotifiedDestroyMessage(this);
		} else if (source.type == "NOTIFIED_JOIN_CHAT") {
			this.event = new NotifiedJoinChat(this);
		} else if (source.type == "NOTIFIED_ACCEPT_CHAT_INVITATION") {
			this.event = new NotifiedAcceptChatInvitation(this);
		} else if (source.type == "INVITE_INTO_CHAT") {
			this.event = new InviteIntoChat(this);
		} else if (source.type == "DELETE_SELF_FROM_CHAT") {
			this.event = new DeleteSelfFromChat(this);
		} else if (source.type == "NOTIFIED_LEAVE_CHAT") {
			this.event = new NotifiedLeaveChat(this);
		} else if (source.type == "DELETE_OTHER_FROM_CHAT") {
			this.event = new DeleteOtherFromChat(this);
		} else if (source.type == "NOTIFIED_DELETE_OTHER_FROM_CHAT") {
			this.event = new DeleteOtherFromChat(this);
		}
		if (emit && client) {
			client.emit("event", source);
		}
	}
}

/**
 * @description you unsend the message
 */
export class DestroyMessage {
	public readonly name: string = "DestroyMessage";
	public messageId: string;
	public chatMid: string;

	constructor(op: Operation) {
		if (op.type !== "DESTROY_MESSAGE") {
			throw new TypeError("Wrong operation type");
		}
		if (
			typeof op.param[1] === "undefined" ||
			typeof op.param[2] === "undefined"
		) {
			throw new TypeError("Wrong param");
		}
		this.messageId = op.param[2];
		this.chatMid = op.param[1];
	}
}

/**
 * @description the user unsend the message
 */
export class NotifiedDestroyMessage {
	public readonly name: string = "NotifiedDestroyMessage";
	public messageId: string;
	public chatMid: string;

	constructor(op: Operation) {
		if (op.type !== "NOTIFIED_DESTROY_MESSAGE") {
			throw new TypeError("Wrong operation type");
		}
		if (
			typeof op.param[1] === "undefined" ||
			typeof op.param[2] === "undefined"
		) {
			throw new TypeError("Wrong param");
		}
		this.messageId = op.param[2];
		this.chatMid = op.param[1];
	}
}

/**
 * @description the user joined the chat
 */
export class NotifiedJoinChat {
	public readonly name: string = "NotifiedJoinChat";
	public userMid: string;
	public chatMid: string;

	constructor(op: Operation) {
		if (op.type !== "NOTIFIED_JOIN_CHAT") {
			throw new TypeError("Wrong operation type");
		}
		if (
			typeof op.param[1] === "undefined" ||
			typeof op.param[2] === "undefined"
		) {
			throw new TypeError("Wrong param");
		}
		this.userMid = op.param[2];
		this.chatMid = op.param[1];
	}
}

/**
 * @description the user accepted the chat invitation
 */
export class NotifiedAcceptChatInvitation {
	public readonly name: string = "NotifiedAcceptChatInvitation";
	public userMid: string;
	public chatMid: string;

	constructor(op: Operation) {
		if (op.type !== "NOTIFIED_ACCEPT_CHAT_INVITATION") {
			throw new TypeError("Wrong operation type");
		}
		if (
			typeof op.param[1] === "undefined" ||
			typeof op.param[2] === "undefined"
		) {
			throw new TypeError("Wrong param");
		}
		this.userMid = op.param[2];
		this.chatMid = op.param[1];
	}
}

/**
 * @description the user was invited into chat by you
 */
export class InviteIntoChat {
	public readonly name: string = "InviteIntoChat";
	public userMid: string;
	public chatMid: string;

	constructor(op: Operation) {
		if (op.type !== "INVITE_INTO_CHAT") {
			throw new TypeError("Wrong operation type");
		}
		if (
			typeof op.param[1] === "undefined" ||
			typeof op.param[2] === "undefined"
		) {
			throw new TypeError("Wrong param");
		}
		this.userMid = op.param[2];
		this.chatMid = op.param[1];
	}
}

/**
 * @description you left the chat
 */
export class DeleteSelfFromChat {
	public readonly name: string = "DeleteSelfFromChat";
	public chatMid: string;

	constructor(op: Operation) {
		if (op.type !== "DELETE_SELF_FROM_CHAT") {
			throw new TypeError("Wrong operation type");
		}
		if (typeof op.param[1] === "undefined") {
			throw new TypeError("Wrong param");
		}
		this.chatMid = op.param[1];
	}
}

/**
 * @description the user left (kicked) the chat
 */
export class NotifiedLeaveChat {
	public readonly name: string = "NotifiedLeaveChat";
	public userMid: string;
	public chatMid: string;

	constructor(op: Operation) {
		if (op.type !== "NOTIFIED_LEAVE_CHAT") {
			throw new TypeError("Wrong operation type");
		}
		if (
			typeof op.param[1] === "undefined" ||
			typeof op.param[2] === "undefined"
		) {
			throw new TypeError("Wrong param");
		}
		this.userMid = op.param[2];
		this.chatMid = op.param[1];
	}
}

/**
 * @description the other user was kicked from chat by you
 */
export class DeleteOtherFromChat {
	public readonly name: string = "DeleteOtherFromChat";
	public userMid: string;
	public chatMid: string;

	constructor(op: Operation) {
		if (op.type !== "DELETE_OTHER_FROM_CHAT") {
			throw new TypeError("Wrong operation type");
		}
		if (
			typeof op.param[1] === "undefined" ||
			typeof op.param[2] === "undefined"
		) {
			throw new TypeError("Wrong param");
		}
		this.userMid = op.param[2];
		this.chatMid = op.param[1];
	}
}

/**
 * @description the profile content was updated by user
 */
export class NotifiedUpdateProfileContent {
	public readonly name: string = "NotifiedUpdateProfileContent";
	public userMid: string;
	public profileAttributes: (LINETypes.ProfileAttribute | null)[] = [];

	constructor(op: Operation) {
		if (op.type !== "NOTIFIED_UPDATE_PROFILE_CONTENT") {
			throw new TypeError("Wrong operation type");
		}
		if (
			typeof op.param[1] === "undefined" ||
			typeof op.param[2] === "undefined"
		) {
			throw new TypeError("Wrong param");
		}
		this.userMid = op.param[1];
		const attr = parseEnum("ProfileAttribute", op.param[2]);
		if (attr !== null) {
			this.profileAttributes[0] =
				attr as LooseType as LINETypes.ProfileAttribute;
		} else {
			const arr: LINETypes.ProfileAttribute[] = [];
			parseInt(op.param[2])
				.toString(2)
				.split("")
				.reverse()
				.forEach((e, i) => {
					if (e === "1") {
						arr.push(
							parseEnum(
								"ProfileAttribute",
								2 ** i,
							) as LooseType as LINETypes.ProfileAttribute,
						);
					}
				});
			this.profileAttributes = arr;
		}
	}
}

/**
 * @description the profile was updated by user
 */
export class NotifiedUpdateProfile {
	public readonly name: string = "NotifiedUpdateProfile";
	public userMid: string;
	public profileAttributes: (LINETypes.ProfileAttribute | null)[] = [];
	public info: Record<string, LooseType> = {};

	constructor(op: Operation) {
		if (op.type !== "NOTIFIED_UPDATE_PROFILE") {
			throw new TypeError("Wrong operation type");
		}
		if (
			typeof op.param[1] === "undefined" ||
			typeof op.param[2] === "undefined" ||
			typeof op.param[3] === "undefined"
		) {
			throw new TypeError("Wrong param");
		}
		this.userMid = op.param[1];
		const attr = parseEnum("ProfileAttribute", op.param[2]);
		if (attr !== null) {
			this.profileAttributes[0] =
				attr as LooseType as LINETypes.ProfileAttribute;
		} else {
			const arr: LINETypes.ProfileAttribute[] = [];
			parseInt(op.param[2])
				.toString(2)
				.split("")
				.reverse()
				.forEach((e, i) => {
					if (e === "1") {
						arr.push(
							parseEnum(
								"ProfileAttribute",
								2 ** i,
							) as LooseType as LINETypes.ProfileAttribute,
						);
					}
				});
			this.profileAttributes = arr;
		}
		this.info = JSON.parse(op.param[3]);
	}
}

/**
 * @description the message was reacted by ypu
 */
export class SendReaction {
	public readonly name: string = "SendReaction";
	public chatMid: string;
	public chatType: LINETypes.MIDType;
	public messageId: string;
	public reactionType: LINETypes.PredefinedReactionType;
	constructor(op: Operation) {
		if (op.type !== "SEND_REACTION") {
			throw new TypeError("Wrong operation type");
		}
		if (
			typeof op.param[1] === "undefined" ||
			typeof op.param[2] === "undefined"
		) {
			throw new TypeError("Wrong param");
		}
		this.messageId = op.param[1];
		const data = JSON.parse(op.param[2]);
		this.chatMid = data.chatMid;
		this.chatType = getMidType(this.chatMid) as LooseType;
		this.reactionType = parseEnum(
			"PredefinedReactionType",
			data.curr.predefinedReactionType,
		) as LINETypes.PredefinedReactionType;
	}
}

/**
 * @description the message was reacted by user
 */
export class NotifiedSendReaction {
	public readonly name: string = "NotifiedSendReaction";
	public chatMid: string;
	public chatType: LINETypes.MIDType;
	public messageId: string;
	public userMid: string;
	public reactionType: LINETypes.PredefinedReactionType;
	constructor(op: Operation) {
		if (op.type !== "NOTIFIED_SEND_REACTION") {
			throw new TypeError("Wrong operation type");
		}
		if (
			typeof op.param[1] === "undefined" ||
			typeof op.param[2] === "undefined" ||
			typeof op.param[3] === "undefined"
		) {
			throw new TypeError("Wrong param");
		}
		this.messageId = op.param[1];
		this.userMid = op.param[3];
		const data = JSON.parse(op.param[2]);
		this.chatMid = data.chatMid;
		this.chatType = getMidType(this.chatMid) as LooseType;
		this.reactionType = parseEnum(
			"PredefinedReactionType",
			data.curr.predefinedReactionType,
		) as LINETypes.PredefinedReactionType;
	}
}

/**
 * @description the message was read by user
 */
export class NotifiedReadMessage {
	public readonly name: string = "NotifiedReadMessage";
	public chatMid: string;
	public chatType: LINETypes.MIDType;
	public messageId: string;
	public userMid: string;

	constructor(op: Operation) {
		if (op.type !== "NOTIFIED_READ_MESSAGE") {
			throw new TypeError("Wrong operation type");
		}
		if (
			typeof op.param[1] === "undefined" ||
			typeof op.param[2] === "undefined" ||
			typeof op.param[3] === "undefined"
		) {
			throw new TypeError("Wrong param");
		}
		this.chatMid = op.param[1];
		this.userMid = op.param[2];
		this.messageId = op.param[3];
		this.chatType = getMidType(op.param[1]) as LooseType;
	}
}

/**
 * @description the message was read by you
 */
export class SendChatChecked {
	public readonly name: string = "SendChatChecked";
	public chatMid: string;
	public chatType: LINETypes.MIDType;
	public messageId: string;

	constructor(op: Operation) {
		if (op.type !== "SEND_CHAT_CHECKED") {
			throw new TypeError("Wrong operation type");
		}
		if (
			typeof op.param[1] === "undefined" ||
			typeof op.param[2] === "undefined"
		) {
			throw new TypeError("Wrong param");
		}
		this.chatMid = op.param[1];
		this.messageId = op.param[2];
		this.chatType = getMidType(op.param[1]) as LooseType;
	}
}

/**
 * @description the chatroom history was removed by you
 */
export class SendChatRemoved {
	public readonly name: string = "SendChatRemoved";
	public chatMid: string;
	public chatType: LINETypes.MIDType | null;
	public messageId: string;

	constructor(op: Operation) {
		if (op.type !== "SEND_CHAT_REMOVED") {
			throw new TypeError("Wrong operation type");
		}
		if (
			typeof op.param[1] === "undefined" ||
			typeof op.param[2] === "undefined"
		) {
			throw new TypeError("Wrong param");
		}
		this.chatMid = op.param[1];
		this.messageId = op.param[2];
		this.chatType = getMidType(op.param[1]);
	}
}

/**
 * @description LINE message base utils
 */
export class Message {
	public sourceType: 0 | 1 | 2 | 3 | 4; // op noti recv send msg
	public rawSource:
		| LINETypes.Operation
		| LINETypes.SquareEventNotificationMessage
		| LINETypes.SquareEventReceiveMessage
		| LINETypes.SquareEventSendMessage
		| undefined;
	public rawMessage: LINETypes.Message;
	public toType: LINETypes.MIDType;
	public to: string;
	public fromType: LINETypes.MIDType;
	public from: string;
	public contentType: LINETypes.ContentType;
	public contentMetadata: Record<string, LooseType>;
	public _senderDisplayName: string | undefined;
	public id: string;
	public createdTime: Date;
	public text: string | undefined;
	public content: string | undefined;

	constructor(options: {
		operation?: LINETypes.Operation;
		squareEventNotificationMessage?: LINETypes.SquareEventNotificationMessage;
		squareEventReceiveMessage?: LINETypes.SquareEventReceiveMessage;
		squareEventSendMessage?: LINETypes.SquareEventSendMessage;
		message?: LINETypes.Message;
	}) {
		if (Object.keys(options).length != 1) {
			throw new TypeError("Invalid argument");
		}
		const {
			message,
			operation,
			squareEventNotificationMessage,
			squareEventReceiveMessage,
			squareEventSendMessage,
		} = options;
		if (
			operation &&
			(operation.type === "SEND_MESSAGE" ||
				operation.type === 25 ||
				operation.type === "RECEIVE_MESSAGE" ||
				operation.type === 26 ||
				operation.type === "SEND_CONTENT" ||
				operation.type === 43)
		) {
			this.rawSource = operation;
			this.rawMessage = operation.message;
			this.sourceType = 0;
		} else if (squareEventNotificationMessage) {
			this.rawSource = squareEventNotificationMessage;
			this.rawMessage = squareEventNotificationMessage.squareMessage.message;
			this._senderDisplayName =
				squareEventNotificationMessage.senderDisplayName;
			this.sourceType = 1;
		} else if (squareEventReceiveMessage) {
			this.rawSource = squareEventReceiveMessage;
			this.rawMessage = squareEventReceiveMessage.squareMessage.message;
			this._senderDisplayName = squareEventReceiveMessage.senderDisplayName;
			this.sourceType = 2;
		} else if (squareEventSendMessage) {
			this.rawSource = squareEventSendMessage;
			this.rawMessage = squareEventSendMessage.squareMessage.message;
			this._senderDisplayName = squareEventSendMessage.senderDisplayName;
			this.sourceType = 3;
		} else if (message) {
			this.rawMessage = message;
			this.sourceType = 4;
		} else {
			throw new TypeError("Invalid argument");
		}
		this.toType =
			(parseEnum("MIDType", this.rawMessage.toType) as LINETypes.MIDType) ||
			this.rawMessage.toType;
		this.to = this.rawMessage.to;
		this.from = this.rawMessage._from;
		this.fromType = getMidType(this.from) as LINETypes.MIDType;
		this.contentType =
			(parseEnum(
				"ContentType",
				this.rawMessage.contentType,
			) as LINETypes.ContentType) || this.rawMessage.contentType;
		this.createdTime = new Date((this.rawMessage.createdTime as number) * 1000);
		this.id = this.rawMessage.id;
		if (this.rawMessage.text) {
			this.content = this.rawMessage.text;
			this.text = this.rawMessage.text;
		}
		this.contentMetadata = {};
		for (const key in this.rawMessage.contentMetadata) {
			if (
				Object.prototype.hasOwnProperty.call(
					this.rawMessage.contentMetadata,
					key,
				)
			) {
				let value: string = this.rawMessage.contentMetadata[key].toString();
				if (value.startsWith("{") || value.startsWith("[")) {
					value = JSON.parse(value);
				}
				this.contentMetadata[key] = value;
			}
		}
	}

	/**
	 * @return {string[]} chat event mids
	 */
	public getChatEvent(): string[] {
		if (this.contentType !== "CHATEVENT") {
			throw new InternalError("MessageParserErr", "Not ChatEvent Message");
		}
		const eventData = this.contentMetadata as chatEventMeta;
		return eventData.LOC_ARGS.toString().split("\x1E");
	}

	/**
	 * @return {string} sticker url
	 */
	public getSticker(): string {
		if (this.contentType !== "STICKER") {
			throw new InternalError("MessageParserErr", "Not Sticker Message");
		}
		const stkData = this.contentMetadata as stkMeta;
		if (stkData.STKOPT === "A") {
			return `https://stickershop.line-scdn.net/stickershop/v1/sticker/${stkData.STKID}/android/sticker.png`;
		} else {
			return `https://stickershop.line-scdn.net/stickershop/v1/sticker/${stkData.STKID}/android/sticker_animation.png`;
		}
	}

	/**
	 * @return {string[]} emoji urls
	 */
	public getEmojis(): string[] {
		if (this.contentType !== "NONE") {
			throw new InternalError("MessageParserErr", "Not Text Message");
		}
		const emojiUrls: string[] = [];
		const emojiData = this.contentMetadata as emojiMeta;
		(emojiData?.REPLACE?.sticon?.resources || []).forEach((e) => {
			emojiUrls.push(
				`https://stickershop.line-scdn.net/sticonshop/v1/sticon/${e.productId}/android/${e.sticonId}.png`,
			);
		});
		return emojiUrls;
	}

	/**
	 * @return {string[]} mention mids
	 */
	public getMentions(): string[] {
		if (this.contentType !== "NONE") {
			throw new InternalError("MessageParserErr", "Not Text Message");
		}
		const mentionees: string[] = [];
		const mentionData = this.contentMetadata as mentionMeta;
		(mentionData?.MENTION?.MENTIONEES || []).forEach((e) => {
			const mid = e.A ? "ALL" : e.M;
			if (mid) mentionees.push(mid);
		});
		return mentionees;
	}

	/**
	 * @description Gets text decorations (emoji,mention)
	 */
	public getTextDecorations(): decorationText[] {
		if (this.contentType !== "NONE") {
			throw new InternalError("MessageParserErr", "Not Text Message");
		}
		const texts: decorationText[] = [];
		const splits: splitInfo[] = [];
		const mentionData = this.contentMetadata as mentionMeta;
		const emojiData = this.contentMetadata as emojiMeta;
		(mentionData?.MENTION?.MENTIONEES || []).forEach((e, i) => {
			splits.push({ start: parseInt(e.S), end: parseInt(e.E), mention: i });
		});
		(emojiData?.REPLACE?.sticon?.resources || []).forEach((e, i) => {
			splits.push({ start: e.S, end: e.E, emoji: i });
		});
		let lastSplit = 0;
		splits
			.sort((a, b) => a.start - b.start)
			.forEach((e) => {
				texts.push({
					text: this.content?.substring(lastSplit, e.start) as string,
				});
				const content: decorationText = {
					text: this.content?.substring(e.start, e.end) as string,
				};
				if (typeof e.emoji === "number") {
					const emoji = emojiData.REPLACE.sticon.resources[e.emoji];
					const url = `https://stickershop.line-scdn.net/sticonshop/v1/sticon/${emoji.productId}/android/${emoji.sticonId}.png`;
					content.emoji = {
						...emoji,
						url,
					};
				} else if (typeof e.mention === "number") {
					const mention = mentionData.MENTION.MENTIONEES[e.mention];
					content.mention = {
						mid: mention.M,
						all: mention.A ? true : undefined,
					};
				}
				texts.push(content);
				lastSplit = e.end;
			});
		texts.push({
			text: this.content?.substring(lastSplit) as string,
		});
		return texts;
	}

	/**
	 * @description Build text decorations (emoji,mention)
	 */
	static buildTextDecorations(decorationText: decorationText[]): [
		string,
		{
			REPLACE?: string;
			STICON_OWNERSHIP?: string;
			MENTION?: string;
		},
	] {
		let text = "";
		let hasMention = false;
		let hasEmoji = false;
		const _contentMetadata: Partial<emojiMeta & mentionMeta> = {
			REPLACE: {
				sticon: {
					resources: [],
				},
			},
			STICON_OWNERSHIP: [],
			MENTION: {
				MENTIONEES: [],
			},
		};
		decorationText.forEach((e) => {
			if (e.emoji) {
				if (!e.text) {
					e.text = "(linejs)";
				}
				hasEmoji = true;
				_contentMetadata.REPLACE!.sticon.resources.push({
					S: text.length,
					E: text.length + e.text.length,
					productId: e.emoji.productId,
					sticonId: e.emoji.sticonId,
					version: e.emoji.version || 1,
					resourceType: e.emoji.resourceType || "STATIC",
				});
				if (!_contentMetadata.STICON_OWNERSHIP?.includes(e.emoji.productId)) {
					_contentMetadata.STICON_OWNERSHIP!.push(e.emoji.productId);
				}
			} else if (e.mention) {
				if (!e.text) {
					e.text = "@unkonau";
				}
				hasMention = true;
				if (e.mention.all) {
					_contentMetadata.MENTION!.MENTIONEES.push({
						S: text.length.toString(),
						E: (text.length + e.text.length).toString(),
						A: "1",
					});
				} else {
					_contentMetadata.MENTION!.MENTIONEES.push({
						S: text.length.toString(),
						E: (text.length + e.text.length).toString(),
						M: e.mention.mid,
					});
				}
			}
			text += e.text || "";
		});
		const contentMetadata: {
			REPLACE?: string;
			STICON_OWNERSHIP?: string;
			MENTION?: string;
		} = {
			REPLACE: JSON.stringify(_contentMetadata.REPLACE),
			STICON_OWNERSHIP: JSON.stringify(_contentMetadata.STICON_OWNERSHIP),
			MENTION: JSON.stringify(_contentMetadata.MENTION),
		};
		if (!hasEmoji) {
			delete contentMetadata.REPLACE;
			delete contentMetadata.STICON_OWNERSHIP;
		}
		if (!hasMention) {
			delete contentMetadata.MENTION;
		}
		return [text, contentMetadata];
	}

	/**
	 * @return {contactMeta} contactData
	 */
	public getContact(): contactMeta {
		if (this.contentType !== "CONTACT") {
			throw new InternalError("MessageParserErr", "Not Contact Message");
		}
		const contactData = this.contentMetadata as contactMeta;
		return { mid: contactData.mid, displayName: contactData.displayName };
	}

	/**
	 * @return flex data
	 */
	public getFlex(): {
		flexJson: Record<string, LooseType>;
		altText: string;
		ver: string;
		tag: string | undefined;
	} {
		if (this.contentType !== "FLEX") {
			throw new InternalError("MessageParserErr", "Not Flex Message");
		}
		const flexData = this.contentMetadata as flexMeta;
		return {
			flexJson: flexData.FLEX_JSON,
			altText: flexData.ALT_TEXT,
			ver: flexData.FLEX_VER,
			tag: flexData.EFFECT_TAG,
		};
	}

	/**
	 * @return {string} message id
	 */
	public getReply(): string | undefined {
		if (
			this.rawMessage.relatedMessageId &&
			(this.rawMessage.messageRelationType === 3 ||
				this.rawMessage.messageRelationType === "REPLY")
		) {
			return this.rawMessage.relatedMessageId;
		}
	}

	/**
	 * @return {} file infomation
	 */
	public getFileInfo(): {
		size: number;
		expire: Date;
		name: string;
	} {
		if (this.contentType !== "FILE") {
			throw new InternalError("MessageParserErr", "Not File Message");
		}
		const fileData = this.contentMetadata as fileMeta;
		return {
			size: parseInt(fileData.FILE_SIZE),
			expire: new Date(parseInt(fileData.FILE_EXPIRE_TIMESTAMP) * 1000),
			name: fileData.FILE_NAME,
		};
	}
}

export class ClientMessage extends Message {
	protected client: Client;

	constructor(
		options: {
			operation?: LINETypes.Operation;
			squareEventNotificationMessage?: LINETypes.SquareEventNotificationMessage;
			squareEventReceiveMessage?: LINETypes.SquareEventReceiveMessage;
			squareEventSendMessage?: LINETypes.SquareEventSendMessage;
			message?: LINETypes.Message;
		},
		client: Client,
	) {
		super(options);
		this.client = client;
	}

	/**
	 * @return {Blob} message data
	 */
	public getData(preview?: boolean): Promise<Blob> {
		if (!hasContents.includes(this.contentType as string)) {
			throw new InternalError("MessageParserErr", "message have no contents");
		}
		if (this.contentMetadata.DOWNLOAD_URL) {
			if (preview) {
				return this.client
					.customFetch(this.contentMetadata.PREVIEW_URL)
					.then((r) => r.blob());
			} else {
				return this.client
					.customFetch(this.contentMetadata.DOWNLOAD_URL)
					.then((r) => r.blob());
			}
		}
		return this.client.getMessageObsData(this.id, preview, this.toType === "SQUARE_CHAT");
	}
}

/**
 * @description LINE talk message utils
 */
export class TalkMessage extends ClientMessage {
	constructor(
		options: { message?: LINETypes.Message; operation?: LINETypes.Operation },
		client: Client,
	) {
		super(options, client);
	}

	/**
	 * @return {Promise<LINETypes.Contact>} message author
	 */
	public getAuthor(): Promise<User> {
		return User.from(this.from, this.client);
	}

	/**
	 * @description groupTalk only
	 * @return {Promise<LINETypes.Chat>} Chat(group)
	 */
	public getGroup(): Promise<Group> | undefined {
		if (this.toType === "GROUP" || this.toType === "ROOM") {
			return Group.from(this.to, this.client);
		}
	}

	/**
	 * @description userTalk only
	 * @return {Promise<LINETypes.Contact>} Contact
	 */
	public getUser(): Promise<User> | undefined {
		if (this.toType === "USER") {
			if (this.getAuthorIsMe()) {
				return User.from(this.to, this.client);
			} else {
				return User.from(this.from, this.client);
			}
		}
	}

	/**
	 * @description Gets author is me
	 */
	public getAuthorIsMe(): boolean {
		return this.from === this.client.user?.mid;
	}

	/**
	 * @description Sends in this talk
	 */
	public async send(
		options:
			| {
				text?: string | undefined;
				contentType?: number | undefined;
				contentMetadata?: LooseType;
				relatedMessageId?: string | undefined;
				location?: LooseType;
				chunk?: string[] | undefined;
				e2ee?: boolean | undefined;
			}
			| string,
	): Promise<TalkMessage> {
		if (typeof options === "string") {
			return this.send({ text: options });
		} else {
			const _options: LooseType = options;
			_options.to =
				this.toType === "GROUP" || this.toType === "ROOM"
					? this.to
					: this.getAuthorIsMe()
						? this.to
						: this.from;
			return new TalkMessage(
				{ message: await this.client.sendMessage(_options) },
				this.client,
			);
		}
	}

	/**
	 * @description Sends in this talk with replying this message
	 */
	public async reply(
		options:
			| {
				text?: string | undefined;
				contentType?: number | undefined;
				contentMetadata?: LooseType;
				relatedMessageId?: string | undefined;
				location?: LooseType;
				chunk?: string[] | undefined;
				e2ee?: boolean | undefined;
			}
			| string,
	): Promise<TalkMessage> {
		if (typeof options === "string") {
			return this.reply({ text: options });
		} else {
			const _options: LooseType = options;
			_options.to =
				this.toType === "GROUP" || this.toType === "ROOM"
					? this.to
					: this.getAuthorIsMe()
						? this.to
						: this.from;
			_options.relatedMessageId = this.id;
			return new TalkMessage(
				{ message: await this.client.sendMessage(_options) },
				this.client,
			);
		}
	}

	/**
	 * @description React to this message
	 */
	public react(
		type: LINETypes.MessageReactionType,
	): Promise<LINETypes.ReactToMessageResponse> {
		if (typeof type === "string") {
			type = LINETypes.MessageReactionType[type];
		}
		return this.client.reactToMessage({
			reactionType: type as LINETypes.MessageReactionType & number,
			messageId: this.id,
		});
	}

	/**
	 * @description Announce this message
	 */
	public announce(): Promise<LINETypes.ChatRoomAnnouncement> {
		if (!this.text) {
			throw new InternalError("MessageParserErr", "Not Text message");
		}
		if (this.toType !== "ROOM" && this.toType !== "GROUP") {
			throw new InternalError("MessageParserErr", "not Group");
		}
		return this.client.createChatRoomAnnouncement({
			chatRoomMid: this.to,
			text: this.text,
			link: `line://nv/chatMsg?chatId=${this.to}&messageId=${this.id}`,
		});
	}

	/**
	 * @description Unsend this message
	 */
	public unsend(): Promise<LINETypes.UnsendMessageResponse> {
		if (!this.getAuthorIsMe()) {
			throw new InternalError("MessageParserErr", "Can't Unsend");
		}
		return this.client.unsendMessage({
			messageId: this.id,
		});
	}
}

/**
 * @description LINE square message utils
 */
export class SquareMessage extends ClientMessage {
	constructor(
		options: {
			squareEventNotificationMessage?: LINETypes.SquareEventNotificationMessage;
			squareEventReceiveMessage?: LINETypes.SquareEventReceiveMessage;
			squareEventSendMessage?: LINETypes.SquareEventSendMessage;
			message?: LINETypes.Message;
		},
		client: Client,
	) {
		super(options, client);
	}

	/**
	 * @return {Promise<LINETypes.GetSquareMemberResponse>} message author
	 */
	public getAuthor(): Promise<LINETypes.GetSquareMemberResponse> {
		return this.client.getSquareMember({ squareMemberMid: this.from });
	}

	/**
	 * @return {Promise<LINETypes.GetSquareChatResponse>} this squareChat
	 */
	public getSquareChat(): Promise<LINETypes.GetSquareChatResponse> {
		return this.client.getSquareChat({ squareChatMid: this.to });
	}

	/**
	 * @return {Promise<LINETypes.GetSquareResponse>} this square
	 */
	public async getSquare(): Promise<LINETypes.GetSquareResponse> {
		return await this.client.getSquare({
			squareMid: (await this.getSquareChat()).squareChat.squareMid,
		});
	}

	/**
	 * @description Gets author is me
	 */
	public async getAuthorIsMe(): Promise<boolean> {
		return (
			this.from ===
			(await this.getSquareChat()).squareChatMember.squareMemberMid
		);
	}

	public async getMySquareProfile(): Promise<LINETypes.SquareMember> {
		return (await this.getSquare()).myMembership;
	}
	/**
	 * @description Sends in this squareChat
	 */
	public send(
		options:
			| {
				text?: string | undefined;
				contentType?: LooseType;
				contentMetadata?: LooseType;
				relatedMessageId?: string | undefined;
			}
			| string,
		safe: boolean = true,
	): Promise<SquareMessage> {
		if (typeof options === "string") {
			return this.send({ text: options });
		} else {
			const _options: LooseType = options;
			_options.squareChatMid = this.to;
			return this.client
				.sendSquareMessage(_options, safe)
				.then(
					(r) =>
						new SquareMessage(
							{ message: r.createdSquareMessage.message },
							this.client,
						),
				);
		}
	}

	/**
	 * @description Sends in this squareChat with replying this message
	 */
	public reply(
		options:
			| {
				text?: string | undefined;
				contentType?: LooseType;
				contentMetadata?: LooseType;
				relatedMessageId?: string | undefined;
			}
			| string,
		safe: boolean = true,
	): Promise<SquareMessage> {
		if (typeof options === "string") {
			return this.reply({ text: options });
		} else {
			const _options: LooseType = options;
			_options.squareChatMid = this.to;
			_options.relatedMessageId = this.id;
			return this.client
				.sendSquareMessage(_options, safe)
				.then(
					(r) =>
						new SquareMessage(
							{ message: r.createdSquareMessage.message },
							this.client,
						),
				);
		}
	}

	/**
	 * @description React to this message
	 */
	public react(
		type: LINETypes.MessageReactionType,
	): Promise<LINETypes.ReactToMessageResponse> {
		if (typeof type === "string") {
			type = LINETypes.MessageReactionType[type];
		}
		return this.client.reactToSquareMessage({
			squareChatMid: this.to,
			reactionType: type as LINETypes.MessageReactionType & number,
			squareMessageId: this.id,
		});
	}

	/**
	 * @description Announce this message
	 */
	public announce(): Promise<LINETypes.CreateSquareChatAnnouncementResponse> {
		if (!this.text) {
			throw new InternalError("MessageParserErr", "Not Text message");
		}
		return this.client.createSquareChatAnnouncement({
			squareChatMid: this.to,
			senderSquareMemberMid: this.from,
			squareMessageId: this.id,
			text: this.text,
			createdAt: this.rawMessage.createdTime as number,
			announcementType: 0,
		});
	}

	/**
	 * @description Unsend this message
	 */
	public async unsend(): Promise<LINETypes.UnsendMessageResponse> {
		if (!(await this.getAuthorIsMe())) {
			throw new InternalError("MessageParserErr", "Can't Unsend");
		}
		return this.client.unsendSquareMessage({
			squareMessageId: this.id,
			squareChatMid: this.to,
		});
	}

	/**
	 * @description Delete this message
	 */
	public delete(): Promise<LINETypes.DestroyMessageResponse> {
		return this.client.destroySquareMessage({
			messageId: this.id,
			squareChatMid: this.to,
		});
	}
}
