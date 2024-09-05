import type { Log } from "./log.ts";
import type { User } from "./user.ts";
import type * as LINETypes from "../libs/thrift/line_types.ts";
import type { SquareMessage } from "./message.ts";
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
	"square:event": (squareEvent: LooseType) => void;
	"talk:message": (message: SquareMessage) => void;
	"talk:event": (talkEvent: LooseType) => void;
};
