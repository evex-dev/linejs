import type { SourceEvent } from "./mod.ts";

export abstract class LINEEventBase {
  readonly source: SourceEvent
  constructor(source: SourceEvent) {
    this.source = source
  }
}
