/**
 * @module
 * LINE SelfBot Client
 */
import { CoreClient } from "./core.ts";

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
