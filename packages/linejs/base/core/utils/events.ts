import type * as LINETypes from "@evex/linejs-types";
import { SyncData } from "../../polling/mod.ts";
// import type { Operation, SquareMessage, TalkMessage } from "../../event/mod.ts";
type LogType = "login" | "request" | "response" | (string & {});

export interface Log {
	type: LogType;
	data: any;
}

export type ClientEvents = {
	pincall: (pincode: string) => void;
	qrcall: (loginUrl: string) => void;
	ready: (user: LINETypes.Profile) => void;
	end: (user: LINETypes.Profile) => void;
	"update:authtoken": (authToken: string) => void;
	"update:profile": (profile: LINETypes.Profile) => void;
	"update:cert": (cert: string) => void;
	"update:qrcert": (qrCert: string) => void;
	"update:syncdata": (sync: SyncData) => void;
	log: (data: Log) => void;
};
