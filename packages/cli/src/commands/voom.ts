import type { CommandSpec } from "../command.ts";
import { UsageError } from "../errors.ts";
import { formatJson } from "../output.ts";
import { withClient } from "../session.ts";

/** Mirrors VoomChannelId exported by the client feature module. */
const VOOM_CHANNELS = {
	TIMELINE: "1341209950",
	HOME: "1341209850",
	HOME26: "2007835442",
	NOTE: "1655599932",
	SQUARE_NOTE: "1657618623",
	ALBUM: "1375220249",
} as const;
type VoomChannel = keyof typeof VOOM_CHANNELS;
const channels = Object.keys(VOOM_CHANNELS) as VoomChannel[];

function requireChannel(value: string | undefined): VoomChannel {
	if (!value) throw new UsageError(`Missing channel (${channels.join(", ")})`);
	if (!(value in VOOM_CHANNELS)) {
		throw new UsageError(`Unknown channel: ${value} (expected ${channels.join(", ")})`);
	}
	return value as VoomChannel;
}

const tokenCommand: CommandSpec = {
	name: "voom token",
	summary: "Issue a VOOM channel token.",
	category: "VOOM",
	args: [{ name: "channel", description: channels.join(", "), required: true }],
	examples: ["line voom token TIMELINE"],
	auth: true,
	async run(context) {
		const channel = requireChannel(context.requireArg(0, "channel"));
		return await withClient(context, async ({ client }) => {
			const token = await client.voom.getToken(channel);
			return { channel, token };
		});
	},
	format(value) {
		return (value as { token: string }).token;
	},
};

const feedCommand: CommandSpec = {
	name: "voom feed",
	summary: "Fetch the VOOM timeline feed.",
	category: "VOOM",
	options: [
		{
			name: "post-limit",
			type: "number",
			valueName: "n",
			description: "Posts per page (default 10).",
		},
		{
			name: "following-max-page",
			type: "number",
			valueName: "n",
			description: "Following pages (default 2).",
		},
	],
	examples: ["line voom feed", "line voom feed --post-limit 20"],
	auth: true,
	async run(context) {
		return await withClient(context, async ({ client }) => {
			return await client.voom.feed({
				postLimit: context.getNumber("post-limit"),
				followingMaxPage: context.getNumber("following-max-page"),
			});
		});
	},
	format(value) {
		return formatJson(value);
	},
};

const statusCommand: CommandSpec = {
	name: "voom status",
	summary: "Fetch the VOOM timeline status.",
	category: "VOOM",
	examples: ["line voom status"],
	auth: true,
	async run(context) {
		return await withClient(context, async ({ client }) => {
			return await client.voom.timelineStatus();
		});
	},
	format(value) {
		return formatJson(value);
	},
};

const callCommand: CommandSpec = {
	name: "voom call",
	summary: "Call an arbitrary VOOM REST endpoint.",
	category: "VOOM",
	args: [{ name: "channel", description: channels.join(", "), required: true }],
	options: [
		{ name: "path", type: "string", valueName: "path", description: "REST path (required)." },
		{
			name: "routing",
			type: "string",
			valueName: "prefix",
			choices: [
				"MYHOME",
				"MYHOME_RENEWAL",
				"TIMELINE",
				"TIMELINE_GATEWAY",
				"NOTE",
				"HOMEAPI",
				"SQUARE_NOTE",
				"ALBUM",
				"STORY",
				"SOCIAL_NOTIFICATION",
				"TRANSLATION",
			],
			description: "Routing prefix.",
		},
		{
			name: "method",
			type: "string",
			valueName: "method",
			choices: ["GET", "POST", "PUT", "DELETE"],
			description: "HTTP method.",
		},
		{ name: "body", type: "string", valueName: "json", description: "JSON request body." },
		{ name: "host", type: "string", valueName: "host", description: "Host override." },
	],
	examples: ["line voom call TIMELINE --path /api/v57/timeline/tab/status.json --routing TIMELINE"],
	auth: true,
	async run(context) {
		const channel = requireChannel(context.requireArg(0, "channel"));
		const path = context.requireString("path", "Missing --path");
		const body = context.getJson("body");
		return await withClient(context, async ({ client }) => {
			return await client.voom.call(channel, {
				path,
				routing: context.getString("routing") as never,
				method: context.getString("method") as never,
				body,
				host: context.getString("host"),
			});
		});
	},
	format(value) {
		return formatJson(value);
	},
};

export const voomCommands: CommandSpec[] = [tokenCommand, feedCommand, statusCommand, callCommand];
