import type { Profile } from "@evex-dev/linejs-types";
import type { CommandSpec } from "../command.ts";
import { CliError, UsageError } from "../errors.ts";
import { readFileAsBlob } from "../files.ts";
import { withClient } from "../session.ts";

const getCommand: CommandSpec = {
	name: "profile get",
	summary: "Show the signed-in user's cached profile.",
	description:
		"Uses the profile cached by the last login or --check-session. Pass --check-session to refresh it with getProfile().",
	category: "Account",
	examples: ["line profile get", "line --check-session profile get", "line profile get --json"],
	auth: true,
	async run(context) {
		return await withClient(context, async ({ base }) => {
			if (!base.profile) {
				throw new CliError("AUTH_FAILED", "No cached profile is available", {
					details: {
						hint: "Run `line --check-session profile get` (or `line auth login`) once.",
					},
				});
			}
			return base.profile;
		});
	},
	format(value) {
		const profile = value as Record<string, unknown>;
		const lines = [
			`Display name: ${profile.displayName ?? ""}`,
			`MID:          ${profile.mid ?? ""}`,
			`User ID:      ${profile.userid || "(not set)"}`,
			`Status:       ${profile.statusMessage ?? ""}`,
			`Phone:        ${profile.phone || "(not set)"}`,
			`Email:        ${profile.email || "(not set)"}`,
			`Region:       ${profile.regionCode ?? ""}`,
			`Searchable:   userid=${String(profile.allowSearchByUserid)} email=${String(profile.allowSearchByEmail)}`,
		];
		return lines.join("\n");
	},
};

const updateCommand: CommandSpec = {
	name: "profile update",
	summary: "Update display name, status message, and profile settings.",
	category: "Account",
	options: [
		{ name: "display-name", type: "string", valueName: "name", description: "Display name." },
		{ name: "status-message", type: "string", valueName: "text", description: "Status message." },
		{ name: "phonetic-name", type: "string", valueName: "name", description: "Phonetic name." },
		{ name: "music-profile", type: "string", valueName: "text", description: "Music profile." },
		{
			name: "allow-search-by-userid",
			type: "boolean",
			description: "Allow being found by LINE ID (use --no-allow-search-by-userid to disable).",
		},
		{
			name: "allow-search-by-email",
			type: "boolean",
			description: "Allow being found by email (use --no-allow-search-by-email to disable).",
		},
		{
			name: "hidden-from-list",
			type: "boolean",
			description: "Hide from friend lists (use --no-hidden-from-list to show).",
		},
	],
	examples: [
		'line profile update --display-name "New name" --status-message "Hello"',
		"line profile update --no-allow-search-by-userid",
	],
	auth: true,
	async run(context) {
		const update = {
			...(context.has("display-name")
				? { displayName: context.getString("display-name") ?? "" }
				: {}),
			...(context.has("status-message")
				? { statusMessage: context.getString("status-message") ?? "" }
				: {}),
			...(context.has("phonetic-name")
				? { phoneticName: context.getString("phonetic-name") ?? "" }
				: {}),
			...(context.has("music-profile")
				? { musicProfile: context.getString("music-profile") ?? "" }
				: {}),
			...(context.has("allow-search-by-userid")
				? { allowSearchByUserid: context.getBool("allow-search-by-userid") }
				: {}),
			...(context.has("allow-search-by-email")
				? { allowSearchByEmail: context.getBool("allow-search-by-email") }
				: {}),
			...(context.has("hidden-from-list")
				? { hiddenFromList: context.getBool("hidden-from-list") }
				: {}),
		};
		if (!Object.keys(update).length) {
			throw new UsageError("Nothing to update. Pass at least one profile option.");
		}
		return await withClient(context, async ({ client, base, store }) => {
			await client.updateMyProfile(update);
			const merged = {
				...(base.profile ?? store.data.profile),
				...update,
			} as Record<string, unknown>;
			base.profile = merged as unknown as Profile;
			await store.setCachedProfile(merged, {
				...(typeof merged.mid === "string" ? { mid: merged.mid } : {}),
				...(typeof merged.displayName === "string" ? { displayName: merged.displayName } : {}),
				...(typeof merged.statusMessage === "string"
					? { statusMessage: merged.statusMessage }
					: {}),
			});
			return { ok: true, update, profile: merged };
		});
	},
	format(value) {
		const result = value as { update: Record<string, unknown> };
		const lines = ["Profile updated."];
		for (const [key, entry] of Object.entries(result.update)) {
			lines.push(`  ${key}: ${String(entry)}`);
		}
		return lines.join("\n");
	},
};

const imageCommand: CommandSpec = {
	name: "profile image",
	summary: "Upload a new profile picture.",
	category: "Account",
	args: [{ name: "file", description: "Image file (JPEG or PNG).", required: true }],
	examples: ["line profile image ./avatar.png"],
	auth: true,
	async run(context) {
		const file = await readFileAsBlob(context.requireArg(0, "file"), context.settings.cwd);
		return await withClient(context, async ({ client }) => {
			const result = await client.uploadMyProfileImage(file.blob);
			return { ok: true, ...result, file: file.path, mime: file.blob.type };
		});
	},
	format(value) {
		const result = value as { objId: string; objHash: string };
		return `Profile image uploaded (objId=${result.objId}, hash=${result.objHash})`;
	},
};

const backgroundCommand: CommandSpec = {
	name: "profile background",
	summary: "Upload a new profile background (cover) image.",
	category: "Account",
	args: [{ name: "file", description: "Image file.", required: true }],
	examples: ["line profile background ./cover.jpg"],
	auth: true,
	async run(context) {
		const file = await readFileAsBlob(context.requireArg(0, "file"), context.settings.cwd);
		return await withClient(context, async ({ client }) => {
			const result = await client.uploadMyProfileBackground(file.blob);
			return { ok: true, ...result, file: file.path, mime: file.blob.type };
		});
	},
	format(value) {
		const result = value as { objId: string; objHash: string };
		return `Profile background uploaded (objId=${result.objId}, hash=${result.objHash})`;
	},
};

export const profileCommands: CommandSpec[] = [
	getCommand,
	updateCommand,
	imageCommand,
	backgroundCommand,
];
