/**
 * @module
 * LINE SelfBot Client
 */

import { TypedEventEmitter } from "./typed-event-emitter/index.ts";
import type { ClientEvents } from "./entities/events.ts";
import type { User } from "./entities/user.ts";

/**
 * @description LINE SelfBot Client
 */
export class Client extends TypedEventEmitter<ClientEvents> {
	constructor() {
		super();
	}

	public user: User<"me"> = {};
}
