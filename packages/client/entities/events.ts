import type { Log } from "./log.ts";
import type { User } from "./user.ts";
import type * as LINETypes from "../libs/thrift/line_types.ts";
import type { SquareMessage, Message } from "./message.ts";
import type { LooseType } from "./common.ts";

export type ClientEvents = {
	pincall: (pincode: string) => void;
	qrcall: (pincode: string) => void;
	ready: (user: User<"me">) => void;
	end: (user: User<"me">) => void;
	"update:authtoken": (authtoken: string) => void;
	"update:profile": (profile: LINETypes.Profile) => void;
	"update:cert": (cert: string) => void;
	"update:qrcert": (qrCert: string) => void;
	log: (data: Log) => void;
	"square:message": (squareMessage: SquareMessage) => void;
	"square:event": (squareEvent: LINETypes.SquareEvent) => void;
	"talk:message": (message: Message) => void;
	"talk:event": (talkEvent: LINETypes.Operation) => void;
};
