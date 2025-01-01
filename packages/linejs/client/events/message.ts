import type { Operation, SquareEvent } from "@evex/linejs-types";
import type { Client } from "../mod.ts"
import { LINEEvent } from "./shared.ts"

export class MessageLINEEvent extends LINEEvent {
  readonly raw: Operation | SquareEvent
  #client: Client
  constructor(event: Operation | SquareEvent, client: Client) {
    super()
    this.raw = event
    this.#client = client
  }
  reply() {
    // TODO
  }
}
