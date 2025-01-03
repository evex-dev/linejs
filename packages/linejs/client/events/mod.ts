import type { Operation, SquareEvent } from "@evex/linejs-types";
import { createMessageLINEEvent, type MessageLINEEvent } from "./message.ts";
import { UnknownLINEEvent } from "./unknown.ts";
import type { Client } from "../client.ts";

export type SourceEvent = {
	type: "square";
	event: SquareEvent;
} | {
	type: "talk";
	event: Operation;
};

export const wrapEvents = (source: SourceEvent, client: Client): LINEEvent => {
	if (source.type === "talk") {
		switch (source.event.type) {
			case "RECEIVE_MESSAGE":
			case "SEND_MESSAGE":
				return createMessageLINEEvent(source, client);
		}
	} else {
		switch (source.event.type) {
			case "RECEIVE_MESSAGE":
				return createMessageLINEEvent(source, client);
		}
	}
	return new UnknownLINEEvent(source);
};

export type LINEEvent = MessageLINEEvent | UnknownLINEEvent;
