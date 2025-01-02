import type { SourceEvent } from "./mod.ts";

export abstract class LINEEventBase {
	readonly source: SourceEvent;
	readonly eventType: SourceEvent["event"]["type"];
	abstract readonly type: string;
	constructor(source: SourceEvent) {
		this.source = source;
		this.eventType = source.event.type;
	}
}
