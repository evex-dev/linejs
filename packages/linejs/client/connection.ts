import type { Client } from "./mod.ts";
import type { Operation, SquareEvent } from '@evex/linejs-types'

export interface Connection {
  getReadableTalk(): ReadableStream<Operation>
  getReadableSquare(): ReadableStream<SquareEvent>
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
        throw new Error('Connection doesn\'t include talk.')
      }
      const [a, b] = talkReadable.tee()
      talkReadable = a
      return b
    },
    getReadableSquare() {
      if (!squareReadable) {
        throw new Error('Connection doesn\'t include square.')
      }
      const [a, b] = squareReadable.tee()
      squareReadable = a
      return b
    },
  }
}
