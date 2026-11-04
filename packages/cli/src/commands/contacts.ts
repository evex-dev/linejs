import type { User } from "@evex-dev/linejs";
import type { CommandSpec } from "../command.ts";
import { UsageError } from "../errors.ts";
import { withClient } from "../session.ts";
import { asRecord, summaryLine, userSummary } from "./shared.ts";

function contactSummaryFromRaw(raw: unknown): Record<string, unknown> {
	const record = asRecord(raw);
	const profile = asRecord(record.targetProfileDetail);
	const status = asRecord(profile.statusMessage);
	return {
		mid: record.targetUserMid ?? record.mid,
		displayName: profile.profileName ?? record.displayName,
		statusMessage: status.value ?? record.statusMessage,
		picturePath: profile.picturePath ?? record.picturePath,
		pictureStatus: profile.pictureStatus ?? record.pictureStatus,
		musicProfile: profile.musicProfile ?? record.musicProfile,
		hiddenFromList: profile.hiddenFromList ?? record.hiddenFromList,
	};
}

const listCommand: CommandSpec = {
	name: "contacts list",
	summary: "List friends.",
	category: "Contacts",
	options: [
		{
			name: "status",
			type: "string",
			valueName: "text",
			description: "Filter by text in name or status.",
		},
	],
	examples: ["line contacts list", "line contacts list --json"],
	auth: true,
	async run(context) {
		return await withClient(context, async ({ client }) => {
			const users = await client.fetchUsers();
			const filter = context.getString("status")?.toLowerCase();
			const rows = users
				.map((user) => userSummary(user, context.json))
				.filter((row) => {
					if (!filter) return true;
					return (
						String(row.displayName ?? "")
							.toLowerCase()
							.includes(filter) ||
						String(row.statusMessage ?? "")
							.toLowerCase()
							.includes(filter)
					);
				});
			return { contacts: rows };
		});
	},
	format(value) {
		const rows = (value as { contacts: Array<Record<string, unknown>> }).contacts;
		if (!rows.length) return "No contacts.";
		const lines = ["MID  DISPLAY NAME  STATUS"];
		for (const row of rows) {
			lines.push(
				`${String(row.mid ?? "")}  ${String(row.displayName ?? "")}  ${String(row.statusMessage ?? "")}`,
			);
		}
		return lines.join("\n");
	},
};

const getCommand: CommandSpec = {
	name: "contacts get",
	summary: "Show one contact by MID.",
	category: "Contacts",
	args: [{ name: "mid", description: "User MID (u...).", required: true }],
	examples: ["line contacts get uxxxxxxxx"],
	auth: true,
	async run(context) {
		const mid = context.requireArg(0, "mid");
		return await withClient(context, async ({ client }) => {
			const user = await client.getUser(mid);
			return userSummary(user, context.json);
		});
	},
	format(value) {
		const record = value as Record<string, unknown>;
		return [
			`MID:     ${String(record.mid ?? "")}`,
			`Name:    ${String(record.displayName ?? "")}`,
			`Status:  ${String(record.statusMessage ?? "")}`,
			`Picture: ${String(record.pictureStatus ?? "")}`,
		].join("\n");
	},
};

const addCommand: CommandSpec = {
	name: "contacts add",
	summary: "Add a friend by MID, LINE ID, or phone number.",
	category: "Contacts",
	options: [
		{ name: "mid", type: "string", valueName: "mid", description: "Target user MID." },
		{
			name: "user-id",
			type: "string",
			valueName: "id",
			description: "LINE ID (include @ for official accounts).",
		},
		{
			name: "phone",
			type: "string",
			valueName: "e164",
			description: "Phone number in E.164 form.",
		},
		{
			name: "reference",
			type: "string",
			valueName: "json",
			description: "Tracking reference JSON for MID adds.",
		},
		{
			name: "tracking-meta-hint",
			type: "string",
			valueName: "hint",
			description: "Tracking meta hint for MID adds.",
		},
		{
			name: "tracking-meta-type",
			type: "number",
			valueName: "n",
			description: "Tracking meta type for MID adds.",
		},
	],
	examples: [
		"line contacts add --mid uxxxxxxxx",
		'line contacts add --user-id "@livecast"',
		"line contacts add --phone +819012345678",
	],
	auth: true,
	async run(context) {
		const mid = context.getString("mid");
		const userId = context.getString("user-id");
		const phone = context.getString("phone");
		const selected = [mid, userId, phone].filter(Boolean);
		if (selected.length !== 1) {
			throw new UsageError("Pass exactly one of --mid, --user-id, or --phone");
		}
		return await withClient(context, async ({ base }) => {
			if (mid) {
				const result = await base.relation.addFriendByMid({
					mid,
					...(context.getString("reference") ? { reference: context.getString("reference")! } : {}),
					...(context.getString("tracking-meta-hint")
						? { trackingMetaHint: context.getString("tracking-meta-hint")! }
						: {}),
					...(context.getNumber("tracking-meta-type") !== undefined
						? { trackingMetaType: context.getNumber("tracking-meta-type")! }
						: {}),
				});
				return { ok: true, target: { mid }, result };
			}
			if (userId) {
				const result = await base.relation.addFriendByUserId({ userId });
				return { ok: true, target: { userId }, result };
			}
			const result = await base.relation.addFriendByPhone({ phone: phone! });
			return { ok: true, target: { phone }, result };
		});
	},
	format(value) {
		return `Friend request sent: ${summaryLine((value as { target: Record<string, unknown> }).target)}`;
	},
};

const searchCommand: CommandSpec = {
	name: "contacts search",
	summary: "Look up a contact by LINE ID or phone number.",
	category: "Contacts",
	options: [
		{ name: "id", type: "string", valueName: "searchId", description: "LINE ID or ticket." },
		{
			name: "phone",
			type: "string",
			valueName: "e164",
			description: "Phone number in E.164 form.",
		},
	],
	examples: ['line contacts search --id "@livecast"', "line contacts search --phone +819012345678"],
	auth: true,
	async run(context) {
		const id = context.getString("id");
		const phone = context.getString("phone");
		if (Boolean(id) === Boolean(phone)) {
			throw new UsageError("Pass exactly one of --id or --phone");
		}
		return await withClient(context, async ({ base }) => {
			if (id) {
				const contact = await base.relation.findContactBySearchIdOrTicketV3({ searchId: id });
				return { contact: contactSummaryFromRaw(contact), raw: context.json ? contact : undefined };
			}
			const contact = await base.relation.findContactByPhoneV3({ phone: phone! });
			return { contact: contactSummaryFromRaw(contact), raw: context.json ? contact : undefined };
		});
	},
	format(value) {
		const contact = (value as { contact: Record<string, unknown> }).contact;
		return [
			`MID:     ${String(contact.mid ?? "")}`,
			`Name:    ${String(contact.displayName ?? "")}`,
			`Status:  ${String(contact.statusMessage ?? "")}`,
		].join("\n");
	},
};

const renameCommand: CommandSpec = {
	name: "contacts rename",
	summary: "Set or clear a display-name override for a contact.",
	category: "Contacts",
	args: [
		{ name: "mid", description: "User MID.", required: true },
		{ name: "name", description: "New display name (omit with --clear).", required: false },
	],
	options: [{ name: "clear", type: "boolean", description: "Remove the display-name override." }],
	examples: ["line contacts rename uxxxxxxxx Alice", "line contacts rename uxxxxxxxx --clear"],
	auth: true,
	async run(context) {
		const mid = context.requireArg(0, "mid");
		const clear = context.getBool("clear");
		const name = context.rest(1);
		if (!clear && !name) throw new UsageError("Pass a display name or --clear");
		return await withClient(context, async ({ client }) => {
			const user = await client.getUser(mid);
			await user.rename(clear ? null : name!);
			return { ok: true, mid, name: clear ? null : name };
		});
	},
	format(value) {
		const result = value as { mid: string; name: string | null };
		return result.name === null
			? `Cleared display-name override for ${result.mid}`
			: `Renamed ${result.mid} to ${result.name}`;
	},
};

function toggleCommand(options: {
	name: string;
	summary: string;
	action: (user: User, enabled: boolean) => Promise<void>;
	optionDescription: string;
	format: (mid: string, enabled: boolean) => string;
}): CommandSpec {
	return {
		name: options.name,
		summary: options.summary,
		category: "Contacts",
		args: [{ name: "mid", description: "User MID.", required: true }],
		options: [{ name: "off", type: "boolean", description: options.optionDescription }],
		examples: [`line ${options.name} uxxxxxxxx`, `line ${options.name} uxxxxxxxx --off`],
		auth: true,
		async run(context) {
			const mid = context.requireArg(0, "mid");
			const enabled = !context.getBool("off");
			return await withClient(context, async ({ client }) => {
				const user = await client.getUser(mid);
				await options.action(user, enabled);
				return { ok: true, mid, enabled };
			});
		},
		format(value) {
			const result = value as { mid: string; enabled: boolean };
			return options.format(result.mid, result.enabled);
		},
	};
}

const favoriteCommand = toggleCommand({
	name: "contacts favorite",
	summary: "Mark or unmark a contact as a favorite.",
	action: (user, enabled) => user.setFavorite(enabled),
	optionDescription: "Remove the favorite mark.",
	format: (mid, enabled) => (enabled ? `Favorited ${mid}` : `Unfavorited ${mid}`),
});

const muteCommand = toggleCommand({
	name: "contacts mute",
	summary: "Mute or unmute notifications for a contact.",
	action: (user, enabled) => user.setNotificationDisabled(enabled),
	optionDescription: "Unmute instead of mute.",
	format: (mid, enabled) => (enabled ? `Muted ${mid}` : `Unmuted ${mid}`),
});

const hideCommand = toggleCommand({
	name: "contacts hide",
	summary: "Hide or unhide a contact from the friend list.",
	action: (user, enabled) => user.setHidden(enabled),
	optionDescription: "Unhide instead of hide.",
	format: (mid, enabled) => (enabled ? `Hid ${mid}` : `Unhid ${mid}`),
});

const calendarCommand: CommandSpec = {
	name: "contacts calendar",
	summary: "Fetch a contact's calendar events (for example birthdays).",
	category: "Contacts",
	args: [{ name: "mid", description: "User MID.", required: true }],
	options: [
		{
			name: "event-kind",
			type: "array",
			valueName: "kind",
			description: "Filter event kinds (repeatable).",
		},
	],
	examples: [
		"line contacts calendar uxxxxxxxx",
		"line contacts calendar uxxxxxxxx --event-kind BIRTHDAY",
	],
	auth: true,
	async run(context) {
		const mid = context.requireArg(0, "mid");
		const kinds = context.getArray("event-kind");
		return await withClient(context, async ({ client }) => {
			const user = await client.getUser(mid);
			const events = await user.fetchCalendarEvents((kinds.length ? kinds : undefined) as never);
			return { mid, events };
		});
	},
	format(value) {
		const result = value as { mid: string; events: Array<Record<string, unknown>> };
		if (!result.events.length) return `No calendar events for ${result.mid}.`;
		return result.events
			.map((event) =>
				summaryLine({
					id: event.id,
					state: event.state,
					date: `${String(event.year)}-${String(event.month)}-${String(event.day)}`,
				}),
			)
			.join("\n");
	},
};

const blockCommand: CommandSpec = {
	name: "contacts block",
	summary: "Block a contact.",
	category: "Contacts",
	args: [{ name: "mid", description: "User MID.", required: true }],
	examples: ["line contacts block uxxxxxxxx"],
	auth: true,
	async run(context) {
		const mid = context.requireArg(0, "mid");
		return await withClient(context, async ({ base }) => {
			await base.talk.blockContact({ reqSeq: await base.getReqseq(), id: mid } as never);
			return { ok: true, mid, blocked: true };
		});
	},
	format(value) {
		return `Blocked ${(value as { mid: string }).mid}`;
	},
};

const unblockCommand: CommandSpec = {
	name: "contacts unblock",
	summary: "Unblock a contact.",
	category: "Contacts",
	args: [{ name: "mid", description: "User MID.", required: true }],
	examples: ["line contacts unblock uxxxxxxxx"],
	auth: true,
	async run(context) {
		const mid = context.requireArg(0, "mid");
		return await withClient(context, async ({ base }) => {
			await base.talk.unblockContact({
				reqSeq: await base.getReqseq(),
				id: mid,
				reference: undefined,
			} as never);
			return { ok: true, mid, blocked: false };
		});
	},
	format(value) {
		return `Unblocked ${(value as { mid: string }).mid}`;
	},
};

const blockedCommand: CommandSpec = {
	name: "contacts blocked",
	summary: "List blocked contacts.",
	category: "Contacts",
	examples: ["line contacts blocked"],
	auth: true,
	async run(context) {
		return await withClient(context, async ({ base }) => {
			const mids = await base.talk.getBlockedContactIds();
			return { mids };
		});
	},
	format(value) {
		const mids = (value as { mids: string[] }).mids;
		return mids.length ? mids.join("\n") : "No blocked contacts.";
	},
};

export const contactsCommands: CommandSpec[] = [
	listCommand,
	getCommand,
	addCommand,
	searchCommand,
	renameCommand,
	favoriteCommand,
	muteCommand,
	hideCommand,
	calendarCommand,
	blockCommand,
	unblockCommand,
	blockedCommand,
];
