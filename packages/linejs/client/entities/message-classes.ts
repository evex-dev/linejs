import * as LINETypes from "../../../types/line_types.ts";
import { parseEnum } from "../../../types/thrift.ts";
import type { Client } from "../../client/index.ts";
import type { LooseType } from "./common.ts";
import { Buffer } from "node:buffer";

const hasContents = ["IMAGE", "VIDEO", "AUDIO", "FILE"];

type booleanString = "true" | "false";

type splitInfo = {
	start: number;
	end: number;
	mention?: number;
	emoji?: number;
};

type decorationText = {
	text: string;
	emoji?: {
		productId: string;
		sticonId: string;
		version: number;
		resourceType: string;
		url: string;
	};
	mention?: {
		mid?: string;
		all?: true;
	};
};

type stkMeta = {
	STKPKGID: string;
	STKID: string;
	STKTXT: string;
	STKVER: string;
	STKOPT?: string;
};
type mentionMeta = {
	MENTION: {
		MENTIONEES: {
			M?: string;
			S: string;
			E: string;
			A?: string;
		}[];
	};
};
type emojiMeta = {
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
type contactMeta = {
	mid: string;
	displayName: string;
};
type flexMeta = {
	FLEX_VER: string;
	FLEX_JSON: Record<string, LooseType>;
	ALT_TEXT: string;
	EFFECT_TAG?: string;
};

type fileMeta = {
	FILE_SIZE: string;
	FILE_EXPIRE_TIMESTAMP: string;
	FILE_NAME: string;
};

type imgExtMeta = {
	PREVIEW_URL: string;
	DOWNLOAD_URL: string;
};

type chatEventMeta = {
	LOC_KEY: string | "C_MI" | "C_MR"; // invite remove ?
	LOC_ARGS: string; // mid * n
	SKIP_BADGE_COUNT: booleanString;
};

type callMeta = {
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

type postNotificationMetq = {
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

/**
 * @description LINE user (contact) utils
 */
export class User {
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
	public settings: number;
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
		return new this(
			(await client.getContactsV2({ mids: [mid] })).contacts[mid],
			client,
		);
	}

	public constructor(
		contactEntry: LINETypes.ContactEntry,
		private client: Client,
	) {
		const { contact } = contactEntry;
		this.birthday = contactEntry.calendarEvents.events[0];
		this.rawSource = contact;
		this.mid = contact.mid;
		this.createdTime = new Date(contact.createdTime * 1000);
		this.type = contact.type;
		this.status = contact.status;
		this.relation = contact.relation;
		this.displayName = contact.displayName;
		this.phoneticName = contact.phoneticName;
		this.pictureStatus = contact.pictureStatus;
		this.thumbnailUrl = contact.thumbnailUrl;
		this.statusMessage = contact.statusMessage;
		this.displayNameOverridden = contact.displayNameOverridden;
		this.favoriteTime = new Date(contact.favoriteTime * 1000);
		this.capableVoiceCall = contact.capableVoiceCall;
		this.capableVideoCall = contact.capableVideoCall;
		this.capableMyhome = contact.capableMyhome;
		this.capableBuddy = contact.capableBuddy;
		this.attributes = contact.attributes;
		this.settings = contact.settings;
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
		this.createdTime = new Date(contact.createdTime * 1000);
		this.type = contact.type;
		this.status = contact.status;
		this.relation = contact.relation;
		this.displayName = contact.displayName;
		this.phoneticName = contact.phoneticName;
		this.pictureStatus = contact.pictureStatus;
		this.thumbnailUrl = contact.thumbnailUrl;
		this.statusMessage = contact.statusMessage;
		this.displayNameOverridden = contact.displayNameOverridden;
		this.favoriteTime = new Date(contact.favoriteTime * 1000);
		this.capableVoiceCall = contact.capableVoiceCall;
		this.capableVideoCall = contact.capableVideoCall;
		this.capableMyhome = contact.capableMyhome;
		this.capableBuddy = contact.capableBuddy;
		this.attributes = contact.attributes;
		this.settings = contact.settings;
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
}

/**
 * @description LINE group (chat) utils
 */
export class Group {
	public rawSource: LINETypes.Chat;
	public mid: string;
	public createdTime: Date;
	public name: string;
	public picturePath: string;
	public preventedJoinByTicket: boolean;
	public invitationTicket: string;
	public notificationDisabled: boolean;
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
				const user = new User(_members[key], client);
				user.groupStatus.joinedAt = new Date(
					chat.extra.groupExtra.memberMids[key] * 1000,
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
				const user = new User(_invitee[key], client);
				user.groupStatus.invitedAt = new Date(
					chat.extra.groupExtra.inviteeMids[key] * 1000,
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
		this.rawSource = chat;
		this.mid = chat.chatMid;
		this.createdTime = new Date(chat.createdTime * 1000);
		this.name = chat.chatName;
		this.picturePath = chat.picturePath;
		this.notificationDisabled = chat.notificationDisabled;
		const { groupExtra } = chat.extra;
		this.preventedJoinByTicket = groupExtra.preventedJoinByTicket;
		this.invitationTicket = groupExtra.invitationTicket;
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
	public sendChatRemoved?: SendChatRemoved;
	public sendChatChecked?: SendChatChecked;
	public notifiedReadMessage?: NotifiedReadMessage;
	public notifiedSendReaction?: NotifiedSendReaction;
	public sendReaction?: SendReaction;
	public notifiedUpdateProfile?: NotifiedUpdateProfile;
	public notifiedUpdateProfileContent?: NotifiedUpdateProfileContent;
	public destroyMessage?: DestroyMessage;
	public notifiedDestroyMessage?: NotifiedDestroyMessage;
	public notifiedJoinChat?: NotifiedJoinChat;
	public notifiedAcceptChatInvitation?: NotifiedAcceptChatInvitation;
	public inviteIntoChat?: InviteIntoChat;
	public deleteSelfFromChat?: DeleteSelfFromChat;
	public notifiedLeaveChat?: NotifiedLeaveChat;
	public deleteOtherFromChat?: DeleteOtherFromChat;

	constructor(
		source: LINETypes.Operation,
		client?: Client,
		emit: boolean = false,
	) {
		this.rawSource = source;
		this.client = client;
		this.revision = source.revision;
		this.checksum = source.checksum;
		this.createdTime = new Date(source.createdTime * 1000);
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
			this.sendChatRemoved = new SendChatRemoved(this);
		} else if (source.type == "SEND_CHAT_CHECKED") {
			this.sendChatChecked = new SendChatChecked(this);
		} else if (source.type == "NOTIFIED_READ_MESSAGE") {
			this.notifiedReadMessage = new NotifiedReadMessage(this);
		} else if (source.type == "NOTIFIED_SEND_REACTION") {
			this.notifiedSendReaction = new NotifiedSendReaction(this);
		} else if (source.type == "SEND_REACTION") {
			this.sendReaction = new SendReaction(this);
		} else if (source.type == "NOTIFIED_UPDATE_PROFILE") {
			this.notifiedUpdateProfile = new NotifiedUpdateProfile(this);
		} else if (source.type == "NOTIFIED_UPDATE_PROFILE_CONTENT") {
			this.notifiedUpdateProfileContent = new NotifiedUpdateProfileContent(
				this,
			);
		} else if (source.type == "DESTROY_MESSAGE") {
			this.destroyMessage = new DestroyMessage(this);
		} else if (source.type == "NOTIFIED_DESTROY_MESSAGE") {
			this.notifiedDestroyMessage = new NotifiedDestroyMessage(this);
		} else if (source.type == "NOTIFIED_JOIN_CHAT") {
			this.notifiedJoinChat = new NotifiedJoinChat(this);
		} else if (source.type == "NOTIFIED_ACCEPT_CHAT_INVITATION") {
			this.notifiedAcceptChatInvitation = new NotifiedAcceptChatInvitation(
				this,
			);
		} else if (source.type == "INVITE_INTO_CHAT") {
			this.inviteIntoChat = new InviteIntoChat(this);
		} else if (source.type == "DELETE_SELF_FROM_CHAT") {
			this.deleteSelfFromChat = new DeleteSelfFromChat(this);
		} else if (source.type == "NOTIFIED_LEAVE_CHAT") {
			this.notifiedLeaveChat = new NotifiedLeaveChat(this);
		} else if (source.type == "DELETE_OTHER_FROM_CHAT") {
			this.deleteOtherFromChat = new DeleteOtherFromChat(this);
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
			this.profileAttributes[0] = attr as any as LINETypes.ProfileAttribute;
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
							) as any as LINETypes.ProfileAttribute,
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
	public userMid: string;
	public profileAttributes: (LINETypes.ProfileAttribute | null)[] = [];
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
			this.profileAttributes[0] = attr as any as LINETypes.ProfileAttribute;
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
							) as any as LINETypes.ProfileAttribute,
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
		this.chatType = getMidType(this.chatMid) as any;
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
		this.chatType = getMidType(this.chatMid) as any;
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
		this.createdTime = new Date(this.rawMessage.createdTime * 1000);
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
	 * @return {string} sticker url
	 */
	public getSticker(): string {
		if (this.contentType !== "STICKER") {
			throw new Error("Not Sticker Message");
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
			throw new Error("Not Text Message");
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
			throw new Error("Not Text Message");
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
			throw new Error("Not Text Message");
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
	 * @return {contactMeta} contactData
	 */
	public getContact(): contactMeta {
		if (this.contentType !== "CONTACT") {
			throw new Error("Not Contact Message");
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
			throw new Error("Not Flex Message");
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
			throw new Error("Not File Message");
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
			throw new Error("message have no contents");
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
		return this.client.getMessageObsData(this.id, preview);
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
	public getAuthor(): Promise<LINETypes.Contact> {
		return this.client.getContact({ mid: this.from });
	}

	/**
	 * @description groupTalk only
	 * @return {Promise<LINETypes.Chat>} Chat(group)
	 */
	public getGroup(): Promise<LINETypes.Chat> | undefined {
		if (this.toType === "GROUP" || this.toType === "ROOM") {
			return this.client.getChats({ gids: [this.to] }).then((e) => {
				return e.chats[0] as LINETypes.Chat;
			});
		}
	}

	/**
	 * @description userTalk only
	 * @return {Promise<LINETypes.Contact>} Contact
	 */
	public getUser(): Promise<LINETypes.Contact> | undefined {
		if (this.toType === "USER") {
			if (this.getAuthorIsMe()) {
				return this.client.getContact({ mid: this.to });
			} else {
				return this.client.getContact({ mid: this.from });
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
	public send(
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
	): Promise<LINETypes.Message> {
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
			return this.client.sendMessage(_options);
		}
	}

	/**
	 * @description Sends in this talk with replying this message
	 */
	public reply(
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
	): Promise<LINETypes.Message> {
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
			return this.client.sendMessage(_options as LooseType);
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
			reactionType: type as LINETypes.MessageReactionType,
			messageId: this.id,
		});
	}

	/**
	 * @description Announce this message
	 */
	public announce() {
		if (!this.text) {
			throw new Error("not Text message");
		}
		if (this.toType !== "ROOM" && this.toType !== "GROUP") {
			throw new Error("not Group");
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
	public unsend() {
		if (!this.getAuthorIsMe()) {
			throw new Error("not Unsendable");
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
	): Promise<LINETypes.SendMessageResponse> {
		if (typeof options === "string") {
			return this.send({ text: options });
		} else {
			const _options: LooseType = options;
			_options.squareChatMid = this.to;
			return this.client.sendSquareMessage(_options, safe);
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
	): Promise<LINETypes.SendMessageResponse> {
		if (typeof options === "string") {
			return this.reply({ text: options });
		} else {
			const _options: LooseType = options;
			_options.squareChatMid = this.to;
			_options.relatedMessageId = this.id;
			return this.client.sendSquareMessage(_options, safe);
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
			reactionType: type as LINETypes.MessageReactionType,
			squareMessageId: this.id,
		});
	}

	/**
	 * @description Announce this message
	 */
	public announce() {
		if (!this.text) {
			throw new Error("not Text message");
		}
		return this.client.createSquareChatAnnouncement({
			squareChatMid: this.to,
			senderSquareMemberMid: this.from,
			squareMessageId: this.id,
			text: this.text,
			createdAt: this.rawMessage.createdTime,
			announcementType: 0,
		});
	}

	/**
	 * @description Unsend this message
	 */
	public async unsend() {
		if (!(await this.getAuthorIsMe())) {
			throw new Error("not Unsendable");
		}
		return this.client.unsendSquareMessage({
			squareMessageId: this.id,
			squareChatMid: this.to,
		});
	}

	/**
	 * @description Delete this message
	 */
	public delete() {
		return this.client.destroySquareMessage({
			messageId: this.id,
			squareChatMid: this.to,
		});
	}
}
