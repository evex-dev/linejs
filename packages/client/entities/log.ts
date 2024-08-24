import type { AlwaysType, LooseType } from "./common.ts";

export type LogType = "login" | "request" | "response" | (string & AlwaysType);

export interface Log {
	type: LogType;
	data: LooseType;
}
