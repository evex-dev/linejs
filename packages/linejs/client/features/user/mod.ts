import type * as line from "@evex/linejs-types";
import type { Client } from "../../mod.ts";

export interface UserInit {
	client?: Client;
	raw: line.GetContactV3Response;
}

export class User {
	#client?: Client;
	readonly mid: string;
	readonly raw: line.GetContactV3Response;
	constructor(init: UserInit) {
		this.#client = init.client;
		this.mid = init.raw.targetUserMid;
		this.raw = init.raw;
	}

	/**
	 * Fetches this user's contact calendar events (e.g. birthday) via
	 * `getContactCalendarEvents`.  Requires the User to have been
	 * constructed with a Client.
	 */
	async fetchCalendarEvents(
		eventKinds?: line.GetContactCalendarEventsRequest["requiredContactCalendarEvents"],
	): Promise<line.ContactCalendarEvent[]> {
		const client = this.#requireClient("fetchCalendarEvents");
		const res = await client.base.relation.getContactCalendarEvents({
			request: {
				targetUsers: [{ targetUserMid: this.mid }],
				requiredContactCalendarEvents: eventKinds,
			},
		});
		const entry = res.responses.find((r) => r.targetUserMid === this.mid);
		// NOTE: `ContactCalendarEvents.events` is missing a value-type in
		// the synced Thrift schema (apk-sync leaves it as a bare key:8).
		// Until the schema is fixed we treat the payload structurally and
		// reach in through `unknown`.
		const events =
			(entry?.ContactCalendarEvents as unknown as { events?: unknown })
				?.events;
		if (Array.isArray(events)) return events as line.ContactCalendarEvent[];
		if (events && typeof events === "object") {
			return Object.values(events) as line.ContactCalendarEvent[];
		}
		return [];
	}

	#requireClient(method: string): Client {
		if (!this.#client) {
			throw new Error(
				`User.${method}() requires a Client. ` +
					`Construct User with { client, raw } to enable RPC helpers.`,
			);
		}
		return this.#client;
	}
}
