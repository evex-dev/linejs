import type { Operation, SquareEvent } from "@evex/linejs-types";
import { MessageSquareLINEEvent, MessageTalkLINEEvent, type MessageLINEEvent } from "./message.ts";
import { UnknownLINEEvent } from "./unknown.ts";
import type { Client } from "../client.ts";

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
		}
	} else {
		switch (source.event.type) {
			case "RECEIVE_MESSAGE":
				return new MessageSquareLINEEvent(source, client);
		}
	}
	return new UnknownLINEEvent(source);
};

export type LINEEvent = MessageLINEEvent | UnknownLINEEvent;
