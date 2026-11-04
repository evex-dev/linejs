import type { CommandSpec } from "../command.ts";
import { UsageError } from "../errors.ts";
import { formatJson } from "../output.ts";
import { withClient } from "../session.ts";

function formatCall(value: unknown): string {
	return formatJson(value);
}

const routeCommand: CommandSpec = {
	name: "call route",
	summary: "Acquire a 1:1 call route.",
	category: "Calls",
	args: [{ name: "to", description: "Peer user MID.", required: true }],
	options: [
		{
			name: "call-type",
			type: "string",
			valueName: "type",
			choices: ["AUDIO", "VIDEO"],
			description: "Call type (default AUDIO).",
		},
	],
	examples: ["line call route uxxxxxxxx --call-type AUDIO"],
	auth: true,
	async run(context) {
		const to = context.requireArg(0, "to");
		return await withClient(context, async ({ client }) => {
			return await client.call.acquireRoute({
				to,
				callType: (context.getString("call-type") ?? "AUDIO") as never,
			});
		});
	},
	format: formatCall,
};

const groupRouteCommand: CommandSpec = {
	name: "call group-route",
	summary: "Acquire a group call route.",
	category: "Calls",
	args: [{ name: "chatMid", description: "Group chat MID.", required: true }],
	options: [
		{
			name: "media-type",
			type: "string",
			valueName: "type",
			choices: ["AUDIO", "VIDEO"],
			description: "Media type (default AUDIO).",
		},
		{ name: "initial-host", type: "boolean", description: "Request host capability." },
		{
			name: "capability",
			type: "array",
			valueName: "cap",
			description: "Capability (repeatable).",
		},
	],
	examples: ["line call group-route cxxxxxxxx --media-type AUDIO --initial-host"],
	auth: true,
	async run(context) {
		const chatMid = context.requireArg(0, "chatMid");
		const capabilities = context.getArray("capability");
		return await withClient(context, async ({ base }) => {
			return await base.call.acquireGroupCallRoute({
				chatMid,
				mediaType: (context.getString("media-type") ?? "AUDIO") as never,
				isInitialHost: context.getBool("initial-host"),
				capabilities: capabilities.length ? capabilities : ["AUDIO", "VIDEO"],
			} as never);
		});
	},
	format: formatCall,
};

const groupCommand: CommandSpec = {
	name: "call group",
	summary: "Show the current group call state.",
	category: "Calls",
	args: [{ name: "chatMid", description: "Group chat MID.", required: true }],
	examples: ["line call group cxxxxxxxx"],
	auth: true,
	async run(context) {
		const chatMid = context.requireArg(0, "chatMid");
		return await withClient(context, async ({ client }) => {
			return await client.call.getGroupCall(chatMid);
		});
	},
	format: formatCall,
};

const urlListCommand: CommandSpec = {
	name: "call url list",
	summary: "List group call URLs.",
	category: "Calls",
	examples: ["line call url list"],
	auth: true,
	async run(context) {
		return await withClient(context, async ({ base }) => {
			return await base.call.getGroupCallUrls({} as never);
		});
	},
	format: formatCall,
};

const urlCreateCommand: CommandSpec = {
	name: "call url create",
	summary: "Create a group call URL.",
	category: "Calls",
	args: [{ name: "title", description: "URL title.", required: true }],
	examples: ["line call url create 'Team standup'"],
	auth: true,
	async run(context) {
		const title = context.rest(0);
		if (!title) throw new UsageError("Missing URL title");
		return await withClient(context, async ({ base }) => {
			return await base.call.createGroupCallUrl({ request: { title } });
		});
	},
	format: formatCall,
};

const urlGetCommand: CommandSpec = {
	name: "call url get",
	summary: "Get information about a group call URL.",
	category: "Calls",
	args: [{ name: "ticket", description: "Group call URL ticket.", required: true }],
	examples: ["line call url get TICKET"],
	auth: true,
	async run(context) {
		const ticket = context.requireArg(0, "ticket");
		return await withClient(context, async ({ client }) => {
			return await client.call.getGroupCallUrl(ticket);
		});
	},
	format: formatCall,
};

const urlUpdateCommand: CommandSpec = {
	name: "call url update",
	summary: "Update a group call URL.",
	category: "Calls",
	options: [
		{ name: "url-id", type: "string", valueName: "id", description: "Group call URL id." },
		{
			name: "target-attribute",
			type: "string",
			valueName: "attr",
			description: "Attribute to update.",
		},
	],
	examples: ["line call url update --url-id ID --target-attribute TITLE"],
	auth: true,
	async run(context) {
		const urlId = context.requireString("url-id", "Missing --url-id");
		const targetAttribute = context.requireString("target-attribute", "Missing --target-attribute");
		return await withClient(context, async ({ base }) => {
			return await base.call.updateGroupCallUrl({
				request: { urlId, targetAttribute: targetAttribute as never },
			});
		});
	},
	format: formatCall,
};

const urlDeleteCommand: CommandSpec = {
	name: "call url delete",
	summary: "Delete a group call URL.",
	category: "Calls",
	args: [{ name: "urlId", description: "Group call URL id.", required: true }],
	options: [{ name: "yes", type: "boolean", description: "Confirm deletion." }],
	examples: ["line call url delete ID --yes"],
	auth: true,
	async run(context) {
		const urlId = context.requireArg(0, "urlId");
		if (!context.getBool("yes")) throw new UsageError("Pass --yes to confirm deletion");
		return await withClient(context, async ({ base }) => {
			return await base.call.deleteGroupCallUrl({ request: { urlId } });
		});
	},
	format: formatCall,
};

const joinCommand: CommandSpec = {
	name: "call join",
	summary: "Join a chat by group call URL.",
	category: "Calls",
	args: [{ name: "urlId", description: "Group call URL id.", required: true }],
	examples: ["line call join ID"],
	auth: true,
	async run(context) {
		const urlId = context.requireArg(0, "urlId");
		return await withClient(context, async ({ base }) => {
			return await base.call.joinChatByCallUrl({
				request: { urlId, reqSeq: await base.getReqseq() },
			});
		});
	},
	format: formatCall,
};

const inviteCommand: CommandSpec = {
	name: "call invite",
	summary: "Invite users to a group call.",
	category: "Calls",
	args: [
		{ name: "chatMid", description: "Group chat MID.", required: true },
		{ name: "mid", description: "User MID(s).", required: true, variadic: true },
	],
	options: [
		{
			name: "media-type",
			type: "string",
			valueName: "type",
			choices: ["AUDIO", "VIDEO"],
			description: "Media type (default AUDIO).",
		},
	],
	examples: ["line call invite cxxxxxxxx uxxxx"],
	auth: true,
	async run(context) {
		const chatMid = context.requireArg(0, "chatMid");
		const memberMids = context.positionals.slice(1);
		if (!memberMids.length) throw new UsageError("Pass at least one user MID");
		return await withClient(context, async ({ base }) => {
			await base.call.inviteIntoGroupCall({
				chatMid,
				memberMids,
				mediaType: (context.getString("media-type") ?? "AUDIO") as never,
			} as never);
			return { ok: true, chatMid, memberMids };
		});
	},
	format(value) {
		const result = value as { chatMid: string; memberMids: string[] };
		return `Invited ${result.memberMids.join(", ")} to the call in ${result.chatMid}`;
	},
};

const kickCommand: CommandSpec = {
	name: "call kick",
	summary: "Remove users from a group call.",
	category: "Calls",
	args: [
		{ name: "chatMid", description: "Group chat MID.", required: true },
		{ name: "mid", description: "User MID(s).", required: true, variadic: true },
	],
	examples: ["line call kick cxxxxxxxx uxxxx"],
	auth: true,
	async run(context) {
		const chatMid = context.requireArg(0, "chatMid");
		const targetMids = context.positionals.slice(1);
		if (!targetMids.length) throw new UsageError("Pass at least one user MID");
		return await withClient(context, async ({ base }) => {
			return await base.call.kickoutFromGroupCall({
				kickoutFromGroupCallRequest: { chatMid, targetMids },
			});
		});
	},
	format: formatCall,
};

export const callCommands: CommandSpec[] = [
	routeCommand,
	groupRouteCommand,
	groupCommand,
	urlListCommand,
	urlCreateCommand,
	urlGetCommand,
	urlUpdateCommand,
	urlDeleteCommand,
	joinCommand,
	inviteCommand,
	kickCommand,
];
