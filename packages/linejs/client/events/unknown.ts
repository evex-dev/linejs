import { LINEEventBase } from "./shared.ts";
import type { SourceEvent } from "./mod.ts";

export class UnknownLINEEvent extends LINEEventBase {
	readonly type: "unknown" = "unknown";
	constructor(source: SourceEvent) {
		super(source);
	}
}
