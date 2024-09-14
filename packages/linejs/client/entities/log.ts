import type { AlwaysType, LooseType } from "@evex/linejs-types/entities";

export type LogType = "login" | "request" | "response" | (string & AlwaysType);

export interface Log {
	type: LogType;
	data: LooseType;
}
