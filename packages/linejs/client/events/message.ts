import type { Client } from "../mod.ts"
import { LINEEventBase } from "./shared.ts"
import type { SourceEvent } from "./mod.ts";

export class MessageLINEEvent extends LINEEventBase {
  #client: Client
  constructor(source: SourceEvent, client: Client) {
    super(source)
    this.#client = client
  }
  reply() {
    // TODO
  }
}
