import { LINEEventBase } from "./shared.ts";
import type { SourceEvent } from "./mod.ts";

export class UnknownLINEEvent extends LINEEventBase {
	constructor(source: SourceEvent) {
		super(source);
	}
}
