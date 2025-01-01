/**
 * Develop now
 * @experimental
 * for talk
 */
import type * as LINETypes from "@evex/linejs-types";
import { parseEnum } from "@evex/linejs-types/thrift";
import type { Client } from "../core/mod.ts";
import type { Buffer } from "node:buffer";
import { TypedEventEmitter } from "../core/typed-event-emitter/index.ts";
import { Message, TalkMessage } from "./message-class.ts";
import type { TimelineResponse } from "../timeline/mod.ts";

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

/**
 * @description Gets mid's type
 *
 * USER(0),\
 * ROOM(1),\
 * GROUP(2),\
 * SQUARE(3),\
 * SQUARE_CHAT(4),\
 * SQUARE_MEMBER(5),\
 * BOT(6);
 */
function getMidType(mid: string): LINETypes.MIDType | null {
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

function toBit(num: number): number[] {
	let i = 0;
	const nums = [];
	while (1 << i <= num) {
		nums.push(((1 << i) & num) >> i);
		i++;
	}
	return nums;
}

export class Note {
	constructor(
		public mid: string,
		private client: Client,
	) {}

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
	}): Promise<TimelineResponse> {
		(options as any).homeId = this.mid;
		return this.client.timeline.createPost(options as any);
	}
	public deletePost(options: {
		postId: string;
	}): Promise<TimelineResponse> {
		(options as any).homeId = this.mid;
		return this.client.timeline.deletePost(options as any);
	}

	public listPost(
		options: {
			homeId?: string;
			postId?: string;
			updatedTime?: number;
			sourceType?: string;
		} = {},
	): Promise<TimelineResponse> {
		(options as any).homeId = this.mid;
		return this.client.timeline.listPost(options as any);
	}

	public getPost(options: {
		postId: string;
	}): Promise<TimelineResponse> {
		(options as any).homeId = this.mid;
		return this.client.timeline.getPost(options as any);
	}
	public sharePost(options: {
		postId: string;
		chatMid: string;
	}): Promise<TimelineResponse> {
		(options as any).homeId = this.mid;
		return this.client.timeline.sharePost(options as any);
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
	public pictureSource: LINETypes.Pb1_N6;
	public groupStatus: Record<string, any> & {
		joinedAt?: Date;
		invitedAt?: Date;
	} = {};

	/**
	 * @description Generate from mid.
	 */
	static async from(mid: string, client: Client): Promise<User> {
		if (mid === client.profile?.mid) {
			return new this(
				{
					...(await client.talk.getContactsV2({ mids: [mid] }))
						.contacts[mid],
					contact: await client.talk.getContact({ mid }),
				},
				client,
			);
		}
		return new this(
			(await client.talk.getContactsV2({ mids: [mid] })).contacts[mid],
			client,
		);
	}

	constructor(
		contactEntry: LINETypes.ContactEntry,
		private client: Client,
	) {
		super();

		const { contact } = contactEntry;
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
				contentMetadata?: any;
				relatedMessageId?: string;
				location?: LINETypes.Location;
				chunk?: string[] | Buffer[];
				e2ee?: boolean;
			},
	): Promise<LINETypes.Message> {
		if (typeof options === "string") {
			return this.send({ text: options });
		} else {
			const _options: any = options;
			_options.to = this.mid;
			return this.client.talk.sendMessage(_options);
		}
	}

	/**
	 * @description Kickout from group.
	 */
	public kick(
		chatMid: string,
	): Promise<LINETypes.Pb1_M3> {
		return this.client.talk.deleteOtherFromChat({
			request: {
				targetUserMids: [this.mid],
				chatMid,
			},
		});
	}

	/**
	 * @description Invite to group.
	 */
	public async invite(chatMid: string): Promise<void> {
		await this.client.talk.inviteIntoChat({
			chatMid,
			targetUserMids: [this.mid],
		});
	}

	/**
	 * @description Add to friend.
	 */
	public async addFriend(): Promise<any> {
		return await this.client.relation.addFriendByMid({ mid: this.mid });
	}

	public isMe(): boolean {
		return this.client.profile?.mid === this.mid;
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
	static async from(
		gidOrChat: string | LINETypes.Chat,
		client: Client,
	): Promise<Group> {
		const chat: LINETypes.Chat = typeof gidOrChat === "string"
			? await client.talk.getChat({ chatMid: gidOrChat })
			: gidOrChat;
		const creator = await User.from(chat.extra.groupExtra.creator, client);
		const _members = (
			await client.talk.getContactsV2({
				mids: Object.keys(chat.extra.groupExtra.memberMids),
			})
		).contacts;
		const members: User[] = [];
		for (const key in _members) {
			if (Object.prototype.hasOwnProperty.call(_members, key)) {
				let user: User;
				if (key === client.profile?.mid) {
					user = new User(
						{
							..._members[key],
							contact: await client.talk.getContact({ mid: key }),
						},
						client,
					);
				} else {
					user = new User(_members[key], client);
				}
				user.groupStatus.joinedAt = new Date(
					(chat.extra.groupExtra.memberMids[key] as number) * 1000,
				);
				members.push();
			}
		}
		const _invitee = (
			await client.talk.getContactsV2({
				mids: Object.keys(chat.extra.groupExtra.inviteeMids),
			})
		).contacts;
		const invitee: User[] = [];
		for (const key in _invitee) {
			if (Object.prototype.hasOwnProperty.call(_invitee, key)) {
				let user: User;
				if (key === client.profile?.mid) {
					user = new User(
						{
							..._invitee[key],
							contact: await client.talk.getContact({ mid: key }),
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
	public async send(
		options:
			| string
			| {
				text?: string;
				contentType?: number;
				contentMetadata?: any;
				relatedMessageId?: string;
				location?: LINETypes.Location;
				chunk?: string[] | Buffer[];
				e2ee?: boolean;
			},
	): Promise<LINETypes.Message> {
		if (typeof options === "string") {
			return await this.send({ text: options });
		} else {
			const _options: any = options;
			_options.to = this.mid;
			return await this.client.talk.sendMessage(_options);
		}
	}

	/**
	 * @description Update group status.
	 */
	public async set(options: {
		chatSet: Partial<LINETypes.Chat>;
		updatedAttribute: LINETypes.Pb1_O2;
	}): Promise<LINETypes.Pb1_Zc> {
		const _options: any = options;
		_options.chatMid = this.mid;
		return await this.client.talk.updateChat(_options);
	}

	/**
	 * @description Update group name.
	 */
	public async setName(name: string): Promise<LINETypes.Pb1_Zc> {
		return await this.set({
			chatSet: { chatName: name },
			updatedAttribute: "NAME",
		});
	}

	/**
	 * @description Invite user.
	 */
	public async invite(
		mids: string[],
	): Promise<LINETypes.Pb1_J5> {
		return await this.client.talk.inviteIntoChat({
			targetUserMids: mids,
			chatMid: this.mid,
		});
	}

	/**
	 * @description Kickout user.
	 */
	public kick(mid: string): Promise<LINETypes.Pb1_M3> {
		return this.client.talk.deleteOtherFromChat({
			request: {
				targetUserMids: [mid],
				chatMid: this.mid,
			},
		});
	}
}

/**
 * @description LINE talk event utils
 */
export class Operation {
	public rawSource: LINETypes.Operation;
	protected client?: Client;
	public message?: TalkMessage;
	public revision: number;
	public createdTime: Date;
	public type: LINETypes.OpType;
	public reqSeq: number = 0;
	public checksum?: string;
	public status?: "ALERT_DISABLED" | LINETypes.Pb1_EnumC13127p6;
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
		client: Client,
	) {
		this.rawSource = source;
		this.client = client;
		this.revision = source.revision as number;
		this.checksum = source.checksum;
		this.createdTime = new Date((source.createdTime as number) * 1000);
		this.type = (parseEnum("OpType", source.type) as LINETypes.OpType) ||
			source.type;
		this.reqSeq = source.reqSeq;
		this.status = (parseEnum(
			"Pb1_EnumC13127p6",
			source.status,
		) as LINETypes.Pb1_EnumC13127p6) ||
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
			this.message = new TalkMessage(
				{ message: source.message },
				client,
			);
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
	public profileAttributes: (LINETypes.Pb1_K6 | null)[] = [];

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
			this.profileAttributes[0] = attr as any as LINETypes.Pb1_K6;
		} else {
			const arr: LINETypes.Pb1_K6[] = [];
			toBit(parseInt(op.param[2])).forEach((e, i) => {
				if (e === 1) {
					arr.push(
						parseEnum(
							"ProfileAttribute",
							2 ** i,
						) as any as LINETypes.Pb1_K6,
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
	public profileAttributes: (LINETypes.Pb1_K6 | null)[] = [];
	public info: Record<string, any> = {};

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
			this.profileAttributes[0] = attr as any as LINETypes.Pb1_K6;
		} else {
			const arr: LINETypes.Pb1_K6[] = [];
			toBit(parseInt(op.param[2])).forEach((e, i) => {
				if (e === 1) {
					arr.push(
						parseEnum(
							"ProfileAttribute",
							2 ** i,
						) as any as LINETypes.Pb1_K6,
					);
				}
			});
			this.profileAttributes = arr;
		}
		this.info = JSON.parse(op.param[3]);
	}
}

/**
 * @description the profile was updated by you
 */
export class UpdateProfile {
	public readonly name: string = "UpdateProfile";
	public profileAttributes: (LINETypes.Pb1_K6 | null)[] = [];
	public info: Record<string, any> = {};

	constructor(op: Operation) {
		if (op.type !== "UPDATE_PROFILE") {
			throw new TypeError("Wrong operation type");
		}
		if (
			typeof op.param[1] === "undefined" ||
			typeof op.param[2] === "undefined"
		) {
			throw new TypeError("Wrong param");
		}
		const attr = parseEnum("ProfileAttribute", op.param[1]);
		if (attr !== null) {
			this.profileAttributes[0] = attr as any as LINETypes.Pb1_K6;
		} else {
			const arr: LINETypes.Pb1_K6[] = [];
			toBit(parseInt(op.param[1])).forEach((e, i) => {
				if (e === 1) {
					arr.push(
						parseEnum(
							"ProfileAttribute",
							2 ** i,
						) as any as LINETypes.Pb1_K6,
					);
				}
			});
			this.profileAttributes = arr;
		}
		this.info = JSON.parse(op.param[2]);
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
	public reactionType: LINETypes.MessageReactionType;
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
		this.chatType = getMidType(this.chatMid) as any;
		this.reactionType = parseEnum(
			"MessageReactionType",
			data.curr.predefinedReactionType,
		) as LINETypes.MessageReactionType;
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
	public reactionType: LINETypes.MessageReactionType;
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
		this.chatType = getMidType(this.chatMid) as any;
		this.reactionType = parseEnum(
			"MessageReactionType",
			data.curr.predefinedReactionType,
		) as LINETypes.MessageReactionType;
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
		this.chatType = getMidType(op.param[1]) as any;
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
		this.chatType = getMidType(op.param[1]) as any;
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
