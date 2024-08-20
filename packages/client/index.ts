/**
 * @module
 * LINE SelfBot Client
 */

import { TypedEventEmitter } from "./typed-event-emitter/index.ts";
import type { ClientEvents } from "./typed-event-emitter/events.ts";

/**
 * @description LINE SelfBot Client
 */
export class Client extends TypedEventEmitter<ClientEvents> {
	constructor() {
        super();
	}
}
