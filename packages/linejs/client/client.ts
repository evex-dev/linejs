import type { BaseClient } from "../base/mod.ts";
import { connect, type Connection, type ConnectOptions } from "./connection.ts";

export class Client {
  readonly base: BaseClient
  constructor(base: BaseClient) {
    this.base = base
  }

  connect(opts: ConnectOptions): Connection {
    return connect(this, opts)
  }

  /** Gets auth token for LINE. */
  get authToken(): string {
    // NOTE: client is constructed when logined, so authToken is not undefined.
    return this.base.authToken as string
  }
}
