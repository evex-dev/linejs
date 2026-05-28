import type * as line from "@evex/linejs-types";
import type { Client } from "../../mod.ts";
import type {
	CompactMessageResponse,
	SendCompactMessageOptions,
} from "../../../base/service/talk/mod.ts";

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
		eventKinds?:
			line.GetContactCalendarEventsRequest["requiredContactCalendarEvents"],
	): Promise<line.ContactCalendarEvent[]> {
		const client = this.#requireClient("fetchCalendarEvents");
		const res = await client.base.relation.getContactCalendarEvents({
			request: {
				targetUsers: [{ targetUserMid: this.mid }],
				requiredContactCalendarEvents: eventKinds,
			},
		});
		const entry = res.responses.find((r) => r.targetUserMid === this.mid);
		const events = entry?.ContactCalendarEvents?.events;
		if (!events) return [];
		return Object.values(events);
	}

	/**
	 * Sends a compact talk message through `/CA5` or `/ECA5`.
	 */
	sendCompactMessage(
		input: string | Omit<SendCompactMessageOptions, "to">,
	): Promise<CompactMessageResponse> {
		const client = this.#requireClient("sendCompactMessage");
		if (typeof input === "string") {
			return client.base.talk.sendCompactMessage({
				to: this.mid,
				text: input,
			});
		}
		return client.base.talk.sendCompactMessage({
			...input,
			to: this.mid,
		});
	}

	/**
	 * Sets a display-name override (the "rename friend" feature in LINE
	 * Android: 友だち編集 → 表示名).  Pass `null` to clear the override.
	 *
	 * Backed by `talk.updateContactSetting` with flag =
	 * `CONTACT_SETTING_DISPLAY_NAME_OVERRIDE`.
	 */
	async rename(displayNameOverride: string | null): Promise<void> {
		const client = this.#requireClient("rename");
		await client.base.talk.updateContactSetting({
			reqSeq: await client.base.getReqseq(),
			mid: this.mid,
			flag: "CONTACT_SETTING_DISPLAY_NAME_OVERRIDE",
			value: displayNameOverride ?? "",
		});
	}

	/** Toggles favorite (☆) on this contact. */
	async setFavorite(favorite: boolean): Promise<void> {
		const client = this.#requireClient("setFavorite");
		await client.base.talk.updateContactSetting({
			reqSeq: await client.base.getReqseq(),
			mid: this.mid,
			flag: "CONTACT_SETTING_FAVORITE",
			value: favorite ? "true" : "false",
		});
	}

	/** Mutes notifications for this contact's chats. */
	async setNotificationDisabled(disabled: boolean): Promise<void> {
		const client = this.#requireClient("setNotificationDisabled");
		await client.base.talk.updateContactSetting({
			reqSeq: await client.base.getReqseq(),
			mid: this.mid,
			flag: "CONTACT_SETTING_NOTIFICATION_DISABLE",
			value: disabled ? "true" : "false",
		});
	}

	/** Hides this contact from the friend list. */
	async setHidden(hidden: boolean): Promise<void> {
		const client = this.#requireClient("setHidden");
		await client.base.talk.updateContactSetting({
			reqSeq: await client.base.getReqseq(),
			mid: this.mid,
			flag: "CONTACT_SETTING_CONTACT_HIDE",
			value: hidden ? "true" : "false",
		});
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
