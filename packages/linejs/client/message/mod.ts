import type { Operation, SquareEvent } from "@evex/linejs-types";
import type { Client } from "../mod.ts"

export class Message {
  readonly raw: Operation | SquareEvent
  #client: Client
  constructor(event: Operation | SquareEvent, client: Client) {
    this.raw = event
    this.#client = client
  }
  reply() {
    // TODO
  }
}

export class MessageTransformer extends TransformStream<Operation | SquareEvent, Message> {
  constructor(client: Client) {
    super({
      transform(event, controller) {
        if (event.type === 'RECEIVE_MESSAGE') {
          controller.enqueue(new Message(event, client))
        }
      }
    })
  }
}
