import type { AlwaysType, LooseType } from "../utils/common.ts";

export type LogType = "login" | "request" | "response" | (string & AlwaysType);

export interface Log {
	type: LogType;
	data: LooseType;
}
