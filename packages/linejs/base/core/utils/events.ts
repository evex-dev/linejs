import type * as LINETypes from "@evex/linejs-types";
import type { SyncData } from "../../polling/mod.ts";
import type { LooseType } from "@evex/loose-types";
// import type { Operation, SquareMessage, TalkMessage } from "../../event/mod.ts";
type LogType = "login" | "request" | "response" | (string & Record<PropertyKey, never>);

export interface Log {
	type: LogType;
	data: LooseType;
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
