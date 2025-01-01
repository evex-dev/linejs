import { Operation, SquareEvent } from "@evex/linejs-types";
import { LINEEvent } from "./shared.ts";

export class UnknownLINEEvent extends LINEEvent {
  readonly raw: Operation | SquareEvent
  constructor(evt: Operation | SquareEvent) {
    super()
    this.raw = evt
  }
}
