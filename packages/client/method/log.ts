import type { LooseType } from "../utils/common.ts";

// deno-lint-ignore ban-types
export type LogType = "login" | "request" | "response" | (string & {});

export interface Log {
	type: LogType;
	data: LooseType;
}
