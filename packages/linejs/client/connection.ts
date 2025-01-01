import { MessageTransformer, type Message } from "./message/mod.ts";
import type { Client } from "./mod.ts";
import type { Operation, SquareEvent } from '@evex/linejs-types'

export interface Connection {
  getReadableTalk(): ReadableStream<Operation> | null
  getReadableSquare(): ReadableStream<SquareEvent> | null
  getReadable(): ReadableStream<SquareEvent | Operation>
  listen(): AsyncGenerator<SquareEvent | Operation>

  getReadableMessages(): ReadableStream<Message>
  listenMessages(): AsyncGenerator<Message>
}
export interface ConnectOptions {
  talk?: boolean
  square?: boolean
}

export const connect = (client: Client, opts: ConnectOptions): Connection => {
  let talkReadable = opts.talk && new ReadableStream<Operation>({
    async start(controller) {
      for await (const evt of client.base.polling.listenTalkEvents({})) {
        controller.enqueue(evt)
      }
      controller.close()
    }
  })
  let squareReadable = opts.square && new ReadableStream<SquareEvent>({
    async start(controller) {
      for await (const evt of client.base.polling.listenSquareEvents({})) {
        controller.enqueue(evt)
      }
      controller.close()
    },
  })

  return {
    getReadableTalk() {
      if (!talkReadable) {
        return null
      }
      const [a, b] = talkReadable.tee()
      talkReadable = a
      return b
    },
    getReadableSquare() {
      if (!squareReadable) {
        return null
      }
      const [a, b] = squareReadable.tee()
      squareReadable = a
      return b
    },
    getReadable() {
      const talk = this.getReadableTalk()?.getReader()
      const square = this.getReadableSquare()?.getReader()
      return new ReadableStream({
        start: async (controller) => {
          const queue = async (reader: typeof talk | typeof square) => {
            if (!reader) {
              return
            }
            while (true) {
              const { done, value } = await reader.read()
              if (value) {
                controller.enqueue(value)
              }
              if (done) {
                break
              }
            }
          }
          await Promise.all([
            queue(talk),
            queue(square)
          ])
        }
      })
    },
    async * listen() {
      const reader = this.getReadable().getReader()
      while (true) {
        const { done, value } = await reader.read()
        if (value) {
          yield value
        }
        if (done) {
          return
        }
      }
    },
    getReadableMessages() {
      return this.getReadable().pipeThrough(new MessageTransformer(client))
    },
    async * listenMessages() {
      const reader = this.getReadableMessages().getReader()
      while (true) {
        const { done, value } = await reader.read()
        if (value) {
          yield value
        }
        if (done) {
          return
        }
      }
    },
  }
}
