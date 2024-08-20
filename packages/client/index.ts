/**
 * @module
 * LINE SelfBot Client
 */

import { TypedEventEmitter } from "./typed-event-emitter/index.ts";
import type { ClientEvents } from "./types/events.ts";
import type { User } from "./types/user.ts";

/**
 * @description LINE SelfBot Client
 */
export class Client extends TypedEventEmitter<ClientEvents> {
	constructor() {
		super();
	}

	public user: User = {};
}
