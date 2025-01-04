import type { Operation, SquareEvent } from "@evex/linejs-types";
import {
	type MessageLINEEvent,
	MessageSquareLINEEvent,
	MessageTalkLINEEvent,
} from "./message.ts";
import { UnknownLINEEvent } from "./unknown.ts";
import type { Client } from "../client.ts";
import {
	UnsendMessageLINEEvent,
	ReadMessageLINEEvent,
	SendChatCheckedLINEEvent,
	SendReactionLINEEvent,
	NotifiedSendReactionLINEEvent,
	NotifiedUpdateProfileLINEEvent,
	NotifiedUpdateProfileContentLINEEvent,
	NotifiedJoinChatLINEEvent,
	NotifiedAcceptChatInvitationLINEEvent,
	InviteIntoChatLINEEvent,
	DeleteSelfFromChatLINEEvent,
	NotifiedLeaveChatLINEEvent,
	DeleteOtherFromChatLINEEvent
} from "./talk-events/mod.ts";

export type SourceEvent = {
	type: "square";
	event: SquareEvent;
} | {
	type: "talk";
	event: Operation;
};

export const wrapEvents = async (
	source: SourceEvent,
	client: Client,
): Promise<LINEEvent> => {
	if (source.type === "talk") {
		switch (source.event.type) {
			case "RECEIVE_MESSAGE":
			case "SEND_MESSAGE":
				return await MessageTalkLINEEvent.fromSource(source, client)
			case "NOTIFIED_READ_MESSAGE":
				return new ReadMessageLINEEvent(source);
			case "DESTROY_MESSAGE":
			case "NOTIFIED_DESTROY_MESSAGE":
				return new UnsendMessageLINEEvent(source);
			case "SEND_CHAT_REMOVED":
				return new UnsendMessageLINEEvent(source);
			case "SEND_CHAT_CHECKED":
				return new SendChatCheckedLINEEvent(source);
			case "SEND_REACTION":
				return new SendReactionLINEEvent(source);
			case "NOTIFIED_SEND_REACTION":
				return new NotifiedSendReactionLINEEvent(source);
			case "NOTIFIED_UPDATE_PROFILE":
				return new NotifiedUpdateProfileLINEEvent(source);
			case "NOTIFIED_UPDATE_PROFILE_CONTENT":
				return new NotifiedUpdateProfileContentLINEEvent(source);
			case "NOTIFIED_JOIN_CHAT":
				return new NotifiedJoinChatLINEEvent(source);
			case "NOTIFIED_ACCEPT_CHAT_INVITATION":
				return new NotifiedAcceptChatInvitationLINEEvent(source);
			case "INVITE_INTO_CHAT":
				return new InviteIntoChatLINEEvent(source);
			case "DELETE_SELF_FROM_CHAT":
				return new DeleteSelfFromChatLINEEvent(source);
			case "NOTIFIED_LEAVE_CHAT":
				return new NotifiedLeaveChatLINEEvent(source);
			case "DELETE_OTHER_FROM_CHAT":
				return new DeleteOtherFromChatLINEEvent(source);
		}
	} else {
		switch (source.event.type) {
			case "SEND_MESSAGE":
			case "RECEIVE_MESSAGE":
			case "NOTIFICATION_MESSAGE":
				return new MessageSquareLINEEvent(source, client);
		}
	}
	return new UnknownLINEEvent(source);
};

export type LINEEvent =
	MessageLINEEvent |
	UnsendMessageLINEEvent |
	ReadMessageLINEEvent |
	SendChatCheckedLINEEvent |
	SendReactionLINEEvent |
	NotifiedSendReactionLINEEvent |
	NotifiedUpdateProfileLINEEvent |
	NotifiedUpdateProfileContentLINEEvent |
	NotifiedJoinChatLINEEvent |
	NotifiedAcceptChatInvitationLINEEvent |
	InviteIntoChatLINEEvent |
	DeleteSelfFromChatLINEEvent |
	NotifiedLeaveChatLINEEvent |
	DeleteOtherFromChatLINEEvent |
	MessageSquareLINEEvent |
	UnknownLINEEvent |
	MessageTalkLINEEvent
