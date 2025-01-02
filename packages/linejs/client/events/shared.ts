import type { SourceEvent } from "./mod.ts";

export abstract class LINEEventBase {
	readonly source: SourceEvent;
	abstract readonly type: string;
	constructor(source: SourceEvent) {
		this.source = source;
	}
}
