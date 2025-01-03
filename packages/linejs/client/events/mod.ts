import type { Operation, SquareEvent } from "@evex/linejs-types";
import { MessageSquareLINEEvent, MessageTalkLINEEvent, type MessageLINEEvent } from "./message.ts";
import { UnknownLINEEvent } from "./unknown.ts";
import type { Client } from "../client.ts";
import { ReadMessageLINEEvent } from "./read-message.ts";

export type SourceEvent = {
	type: "square";
	event: SquareEvent;
} | {
	type: "talk";
	event: Operation;
};

export const wrapEvents = async (source: SourceEvent, client: Client): Promise<LINEEvent> => {
	if (source.type === "talk") {
		switch (source.event.type) {
			case "RECEIVE_MESSAGE":
			case "SEND_MESSAGE":
				return await MessageTalkLINEEvent.fromSource(source, client);
			case "NOTIFIED_READ_MESSAGE":
				return new ReadMessageLINEEvent(source);
		}
	} else {
		switch (source.event.type) {
			case "RECEIVE_MESSAGE":
			case "NOTIFICATION_MESSAGE":
				return new MessageSquareLINEEvent(source, client);
		}
	}
	return new UnknownLINEEvent(source);
};

export type LINEEvent = MessageLINEEvent | UnknownLINEEvent | ReadMessageLINEEvent;

