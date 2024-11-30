/**
 * @module
 * LINE SelfBot Client
 */
import { TypedEventEmitter } from "./libs/typed-event-emitter/index.ts";
import type { ClientEvents } from './entities/events.ts'
import { CoreClient } from "./clients/base-client.ts";

/**
 * @classdesc LINE SelfBot Client
 * @constructor
 * 
 * @example
 * ```ts
 * import { Client } from '@evex/linejs'
 * 
 * const client = new Client()
 * ```
 */
export class Client {
    core: CoreClient
    constructor() {
        this.core = new CoreClient()
    }
}
