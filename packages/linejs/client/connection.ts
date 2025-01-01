import { MessageLINEEvent } from "./events/message.ts";
import type { LINEEvent } from "./events/shared.ts";
import { UnknownLINEEvent } from "./events/unknown.ts";
import type { Client } from "./mod.ts";
import type { Operation, SquareEvent } from '@evex/linejs-types'

export interface Connection {
  _getReadableTalk(): ReadableStream<Operation> | null
  _getReadableSquare(): ReadableStream<SquareEvent> | null
  _getReadable(): ReadableStream<SquareEvent | Operation>
  listen(): AsyncGenerator<LINEEvent>
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
    _getReadableTalk() {
      if (!talkReadable) {
        return null
      }
      const [a, b] = talkReadable.tee()
      talkReadable = a
      return b
    },
    _getReadableSquare() {
      if (!squareReadable) {
        return null
      }
      const [a, b] = squareReadable.tee()
      squareReadable = a
      return b
    },
    _getReadable() {
      const talk = this._getReadableTalk()?.getReader()
      const square = this._getReadableSquare()?.getReader()
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
      const reader = this._getReadable().getReader()
      while (true) {
        const { done, value } = await reader.read()
        if (value) {
          let event: LINEEvent
          switch (value.type) {
            case 'RECEIVE_MESSAGE':
              event = new MessageLINEEvent(value, client)
              break
            default:
              event  = new UnknownLINEEvent(value)
              break
          }
          yield event
        }
        if (done) {
          return
        }
      }
    },
  }
}
