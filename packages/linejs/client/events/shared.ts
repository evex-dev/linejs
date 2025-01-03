import type { SourceEvent } from "./mod.ts";

export abstract class LINEEventBase {
	readonly source: SourceEvent;
	readonly eventType: SourceEvent["event"]["type"];
	abstract readonly type: string;

	readonly isSquare;
	readonly isTalk;

	constructor(source: SourceEvent) {
		this.source = source;
		this.eventType = source.event.type;

		this.isSquare = source.type === "square";
		this.isTalk = source.type === "talk";
	}
}
