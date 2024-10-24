import type { Log } from "./log.ts";
import type * as LINETypes from "@evex/linejs-types";
import type { Message, SquareMessage } from "./message.ts";
import type { SquaerStatus } from "./square-events.ts";
import type * as LINEClass from "./class.ts"

export type ClientEvents = {
	pincall: (pincode: string) => void;
	qrcall: (loginUrl: string) => void;
	ready: (user: LINETypes.Profile) => void;
	end: (user: LINETypes.Profile) => void;
	"update:authtoken": (authtoken: string) => void;
	"update:profile": (profile: LINETypes.Profile) => void;
	"update:cert": (cert: string) => void;
	"update:qrcert": (qrCert: string) => void;
	log: (data: Log) => void;
	"square:message": (squareMessage: SquareMessage) => void;
	"square:status": (squareStatus: SquaerStatus) => void;
	"square:event": (squareEvent: LINETypes.SquareEvent) => void;
	message: (message: Message) => void;
	// TODO: Add more as square
	event: (talkEvent: LINETypes.Operation) => void;

	v2_event: (talkEvent: LINEClass.Operation) => void;
	v2_message: (message: LINEClass.TalkMessage) => void;
	v2_square_message: (message: LINEClass.SquareMessage) => void;
	v2_square_event: (talkEvent: LINETypes.SquareEvent) => void;
};
