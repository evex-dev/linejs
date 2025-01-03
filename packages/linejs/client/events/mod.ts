import type { Operation, SquareEvent } from "@evex/linejs-types";
import {
	type MessageLINEEvent,
	MessageSquareLINEEvent,
	MessageTalkLINEEvent,
} from "./message.ts";
import { UnknownLINEEvent } from "./unknown.ts";
import type { Client } from "../client.ts";
import * as TalkEvent from "./talk-events.ts";

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
				return await MessageTalkLINEEvent.fromSource(source, client);
			case "SEND_CHAT_REMOVED":
				return new TalkEvent.SendChatRemoved(source);
			case "SEND_CHAT_CHECKED":
				return new TalkEvent.SendChatChecked(source);
			case "NOTIFIED_READ_MESSAGE":
				return new TalkEvent.NotifiedReadMessage(source);
			case "SEND_REACTION":
				return new TalkEvent.SendReaction(source);
			case "NOTIFIED_SEND_REACTION":
				return new TalkEvent.NotifiedSendReaction(source);
			case "NOTIFIED_UPDATE_PROFILE":
				return new TalkEvent.NotifiedUpdateProfile(source);
			case "NOTIFIED_UPDATE_PROFILE_CONTENT":
				return new TalkEvent.NotifiedUpdateProfileContent(source);
			case "DESTROY_MESSAGE":
				return new TalkEvent.DestroyMessage(source);
			case "NOTIFIED_DESTROY_MESSAGE":
				return new TalkEvent.NotifiedDestroyMessage(source);
			case "NOTIFIED_JOIN_CHAT":
				return new TalkEvent.NotifiedJoinChat(source);
			case "NOTIFIED_ACCEPT_CHAT_INVITATION":
				return new TalkEvent.NotifiedAcceptChatInvitation(source);
			case "INVITE_INTO_CHAT":
				return new TalkEvent.InviteIntoChat(source);
			case "DELETE_SELF_FROM_CHAT":
				return new TalkEvent.DeleteSelfFromChat(source);
			case "NOTIFIED_LEAVE_CHAT":
				return new TalkEvent.NotifiedLeaveChat(source);
			case "DELETE_OTHER_FROM_CHAT":
				return new TalkEvent.DeleteOtherFromChat(source);
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
	| MessageLINEEvent
	| UnknownLINEEvent
	| TalkEvent.SendChatRemoved
	| TalkEvent.SendChatChecked
	| TalkEvent.NotifiedReadMessage
	| TalkEvent.SendReaction
	| TalkEvent.NotifiedSendReaction
	| TalkEvent.NotifiedUpdateProfile
	| TalkEvent.NotifiedUpdateProfileContent
	| TalkEvent.DestroyMessage
	| TalkEvent.NotifiedDestroyMessage
	| TalkEvent.NotifiedJoinChat
	| TalkEvent.NotifiedAcceptChatInvitation
	| TalkEvent.InviteIntoChat
	| TalkEvent.DeleteSelfFromChat
	| TalkEvent.NotifiedLeaveChat
	| TalkEvent.DeleteOtherFromChat;
