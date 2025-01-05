import type { SourceEvent } from "../mod.ts";
import { LINEEventBase } from "../shared.ts";
import type * as line from "@evex/linejs-types";
import { parseEnum } from "@evex/linejs-types/thrift";

export { ReadMessageLINEEvent } from "./read-message.ts";
export { UnsendMessageLINEEvent } from "./unsend-message.ts";

/**
 * @description the user joined the chat
 */
export class NotifiedJoinChatLINEEvent extends LINEEventBase {
	readonly type: "NOTIFIED_JOIN_CHAT" = "NOTIFIED_JOIN_CHAT";
	readonly userMid: string;
	readonly chatMid: string;

	constructor(source: SourceEvent & { type: "talk" }) {
		super(source);
		const op = source.event;
		if (op.type !== "NOTIFIED_JOIN_CHAT") {
			throw new TypeError("Wrong operation type");
		}
		if (
			typeof op.param1 === "undefined" ||
			typeof op.param2 === "undefined"
		) {
			throw new TypeError("Wrong param");
		}
		this.userMid = op.param2;
		this.chatMid = op.param1;
	}
}

/**
 * @description the user accepted the chat invitation
 */
export class NotifiedAcceptChatInvitationLINEEvent extends LINEEventBase {
	readonly type: "NOTIFIED_ACCEPT_CHAT_INVITATION" =
		"NOTIFIED_ACCEPT_CHAT_INVITATION";
	userMid: string;
	chatMid: string;

	constructor(source: SourceEvent & { type: "talk" }) {
		super(source);
		const op = source.event;
		if (op.type !== "NOTIFIED_ACCEPT_CHAT_INVITATION") {
			throw new TypeError("Wrong operation type");
		}
		if (
			typeof op.param1 === "undefined" ||
			typeof op.param2 === "undefined"
		) {
			throw new TypeError("Wrong param");
		}
		this.userMid = op.param2;
		this.chatMid = op.param1;
	}
}

/**
 * @description the user was invited into chat by you
 */
export class InviteIntoChatLINEEvent extends LINEEventBase {
	readonly type: "INVITE_INTO_CHAT" = "INVITE_INTO_CHAT";
	userMid: string;
	chatMid: string;

	constructor(source: SourceEvent & { type: "talk" }) {
		super(source);
		const op = source.event;
		if (op.type !== "INVITE_INTO_CHAT") {
			throw new TypeError("Wrong operation type");
		}
		if (
			typeof op.param1 === "undefined" ||
			typeof op.param2 === "undefined"
		) {
			throw new TypeError("Wrong param");
		}
		this.userMid = op.param2;
		this.chatMid = op.param1;
	}
}

/**
 * @description you left the chat
 */
export class DeleteSelfFromChatLINEEvent extends LINEEventBase {
	readonly type: "DELETE_SELF_FROM_CHAT" = "DELETE_SELF_FROM_CHAT";
	chatMid: string;

	constructor(source: SourceEvent & { type: "talk" }) {
		super(source);
		const op = source.event;
		if (op.type !== "DELETE_SELF_FROM_CHAT") {
			throw new TypeError("Wrong operation type");
		}
		if (typeof op.param1 === "undefined") {
			throw new TypeError("Wrong param");
		}
		this.chatMid = op.param1;
	}
}

/**
 * @description the user left (kicked) the chat
 */
export class NotifiedLeaveChatLINEEvent extends LINEEventBase {
	readonly type: "NOTIFIED_LEAVE_CHAT" = "NOTIFIED_LEAVE_CHAT";
	userMid: string;
	chatMid: string;

	constructor(source: SourceEvent & { type: "talk" }) {
		super(source);
		const op = source.event;
		if (op.type !== "NOTIFIED_LEAVE_CHAT") {
			throw new TypeError("Wrong operation type");
		}
		if (
			typeof op.param1 === "undefined" ||
			typeof op.param2 === "undefined"
		) {
			throw new TypeError("Wrong param");
		}
		this.userMid = op.param2;
		this.chatMid = op.param1;
	}
}

/**
 * @description the other user was kicked from chat by you
 */
export class DeleteOtherFromChatLINEEvent extends LINEEventBase {
	readonly type: "DELETE_OTHER_FROM_CHAT" = "DELETE_OTHER_FROM_CHAT";
	userMid: string;
	chatMid: string;

	constructor(source: SourceEvent & { type: "talk" }) {
		super(source);
		const op = source.event;
		if (op.type !== "DELETE_OTHER_FROM_CHAT") {
			throw new TypeError("Wrong operation type");
		}
		if (
			typeof op.param1 === "undefined" ||
			typeof op.param2 === "undefined"
		) {
			throw new TypeError("Wrong param");
		}
		this.userMid = op.param2;
		this.chatMid = op.param1;
	}
}

/**
 * @description the profile content was updated by user
 */
export class NotifiedUpdateProfileContentLINEEvent extends LINEEventBase {
	readonly type: "NOTIFIED_UPDATE_PROFILE_CONTENT" =
		"NOTIFIED_UPDATE_PROFILE_CONTENT";
	userMid: string;
	profileAttributes: (line.Pb1_K6 | null)[] = [];

	constructor(source: SourceEvent & { type: "talk" }) {
		super(source);
		const op = source.event;
		if (op.type !== "NOTIFIED_UPDATE_PROFILE_CONTENT") {
			throw new TypeError("Wrong operation type");
		}
		if (
			typeof op.param1 === "undefined" ||
			typeof op.param2 === "undefined"
		) {
			throw new TypeError("Wrong param");
		}
		this.userMid = op.param1;
		const attr = parseEnum("ProfileAttribute", op.param2);
		if (attr !== null) {
			this.profileAttributes[0] = attr as any as line.Pb1_K6;
		} else {
			const arr: line.Pb1_K6[] = [];
			[...(parseInt(op.param2).toString(2))].forEach((e, i) => {
				if (e == "1") {
					arr.push(
						parseEnum(
							"ProfileAttribute",
							2 ** i,
						) as any as line.Pb1_K6,
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
export class NotifiedUpdateProfileLINEEvent extends LINEEventBase {
	readonly type: "NOTIFIED_UPDATE_PROFILE" = "NOTIFIED_UPDATE_PROFILE";
	userMid: string;
	profileAttributes: (line.Pb1_K6 | null)[] = [];
	info: Record<string, any> = {};

	constructor(source: SourceEvent & { type: "talk" }) {
		super(source);
		const op = source.event;
		if (op.type !== "NOTIFIED_UPDATE_PROFILE") {
			throw new TypeError("Wrong operation type");
		}
		if (
			typeof op.param1 === "undefined" ||
			typeof op.param2 === "undefined" ||
			typeof op.param3 === "undefined"
		) {
			throw new TypeError("Wrong param");
		}
		this.userMid = op.param1;
		const attr = parseEnum("ProfileAttribute", op.param2);
		if (attr !== null) {
			this.profileAttributes[0] = attr as any as line.Pb1_K6;
		} else {
			const arr: line.Pb1_K6[] = [];
			[...(parseInt(op.param2).toString(2))].forEach((e, i) => {
				if (e == "1") {
					arr.push(
						parseEnum(
							"ProfileAttribute",
							2 ** i,
						) as any as line.Pb1_K6,
					);
				}
			});
			this.profileAttributes = arr;
		}
		this.info = JSON.parse(op.param3);
	}
}

/**
 * @description the message was reacted by ypu
 */
export class SendReactionLINEEvent extends LINEEventBase {
	readonly type: "SEND_REACTION" = "SEND_REACTION";
	chatMid: string;
	messageId: string;
	reactionType: line.MessageReactionType;
	constructor(source: SourceEvent & { type: "talk" }) {
		super(source);
		const op = source.event;
		if (op.type !== "SEND_REACTION") {
			throw new TypeError("Wrong operation type");
		}
		if (
			typeof op.param1 === "undefined" ||
			typeof op.param2 === "undefined"
		) {
			throw new TypeError("Wrong param");
		}
		this.messageId = op.param1;
		const data = JSON.parse(op.param2);
		this.chatMid = data.chatMid;
		this.reactionType = parseEnum(
			"MessageReactionType",
			data.curr.predefinedReactionType,
		) as line.MessageReactionType;
	}
}

/**
 * @description the message was reacted by user
 */
export class NotifiedSendReactionLINEEvent extends LINEEventBase {
	readonly type: "NOTIFIED_SEND_REACTION" = "NOTIFIED_SEND_REACTION";
	chatMid: string;
	messageId: string;
	userMid: string;
	reactionType: line.MessageReactionType;
	constructor(source: SourceEvent & { type: "talk" }) {
		super(source);
		const op = source.event;
		if (op.type !== "NOTIFIED_SEND_REACTION") {
			throw new TypeError("Wrong operation type");
		}
		if (
			typeof op.param1 === "undefined" ||
			typeof op.param2 === "undefined" ||
			typeof op.param3 === "undefined"
		) {
			throw new TypeError("Wrong param");
		}
		this.messageId = op.param1;
		this.userMid = op.param3;
		const data = JSON.parse(op.param2);
		this.chatMid = data.chatMid;
		this.reactionType = parseEnum(
			"MessageReactionType",
			data.curr.predefinedReactionType,
		) as line.MessageReactionType;
	}
}

/**
 * @description the chatroom history was removed by you
 */
export class SendChatRemovedLINEEvent extends LINEEventBase {
	readonly type: "SEND_CHAT_REMOVED" = "SEND_CHAT_REMOVED";
	chatMid: string;
	messageId: string;

	constructor(source: SourceEvent & { type: "talk" }) {
		super(source);
		const op = source.event;
		if (op.type !== "SEND_CHAT_REMOVED") {
			throw new TypeError("Wrong operation type");
		}
		if (
			typeof op.param1 === "undefined" ||
			typeof op.param2 === "undefined"
		) {
			throw new TypeError("Wrong param");
		}
		this.chatMid = op.param1;
		this.messageId = op.param2;
	}
}
