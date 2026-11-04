import type { CommandSpec } from "../command.ts";
import { UsageError } from "../errors.ts";
import { readFileAsBlob } from "../files.ts";
import { formatJson } from "../output.ts";
import { withClient } from "../session.ts";
import { YES_OPTION } from "./shared.ts";

const postOptions = [
	{ name: "text", type: "string", valueName: "text", description: "Post text." },
	{
		name: "text-size-mode",
		type: "string",
		valueName: "mode",
		choices: ["AUTO", "NORMAL"],
		description: "Text size mode.",
	},
	{
		name: "background-color",
		type: "string",
		valueName: "hex",
		description: "Background color (for example #FFFFFF).",
	},
	{
		name: "text-animation",
		type: "string",
		valueName: "animation",
		choices: ["NONE", "SLIDE", "ZOOM", "BUZZ", "BOUNCE", "BLINK"],
		description: "Text animation.",
	},
	{
		name: "read-permission",
		type: "string",
		valueName: "type",
		choices: ["ALL", "FRIEND", "GROUP", "EVENT", "NONE"],
		description: "Read permission.",
	},
	{
		name: "shared-post-id",
		type: "string",
		valueName: "postId",
		description: "Share an existing post.",
	},
	{
		name: "media-object-id",
		type: "array",
		valueName: "objId",
		description: "Media object id (repeatable).",
	},
	{
		name: "media-object-type",
		type: "array",
		valueName: "type",
		description: "Media object type (repeatable; PHOTO or VIDEO).",
	},
	{ name: "sticker-id", type: "array", valueName: "id", description: "Sticker id (repeatable)." },
	{
		name: "sticker-package-id",
		type: "array",
		valueName: "id",
		description: "Sticker package id (repeatable).",
	},
	{
		name: "location-latitude",
		type: "array",
		valueName: "n",
		description: "Location latitude (repeatable).",
	},
	{
		name: "location-longitude",
		type: "array",
		valueName: "n",
		description: "Location longitude (repeatable).",
	},
	{
		name: "location-name",
		type: "array",
		valueName: "name",
		description: "Location name (repeatable).",
	},
	{
		name: "source-type",
		type: "string",
		valueName: "type",
		description: "Source type (default TIMELINE).",
	},
	{ name: "holding-time", type: "number", valueName: "ms", description: "Holding time." },
] as const;

function postInput(
	context: import("../context.ts").CommandContext,
	homeId: string,
	textStart: number,
) {
	const text = context.getString("text") ?? context.rest(textStart);
	const mediaObjectIds = context.getArray("media-object-id");
	const mediaObjectTypes = context.getArray("media-object-type");
	if (mediaObjectIds.length && mediaObjectIds.length !== mediaObjectTypes.length) {
		throw new UsageError("--media-object-id and --media-object-type must have the same length");
	}
	const input: Record<string, unknown> = { homeId };
	const set = (key: string, value: unknown) => {
		if (value === undefined) return;
		if (Array.isArray(value) && value.length === 0) return;
		input[key] = value;
	};
	set("text", text || undefined);
	set("textSizeMode", context.getString("text-size-mode"));
	set("backgroundColor", context.getString("background-color"));
	set("textAnimation", context.getString("text-animation"));
	set("readPermissionType", context.getString("read-permission"));
	set("sharedPostId", context.getString("shared-post-id"));
	set("mediaObjectIds", mediaObjectIds);
	set("mediaObjectTypes", mediaObjectTypes);
	set("stickerIds", context.getArray("sticker-id"));
	set("stickerPackageIds", context.getArray("sticker-package-id"));
	set("locationLatitudes", context.getArray("location-latitude").map(Number));
	set("locationLongitudes", context.getArray("location-longitude").map(Number));
	set("locationNames", context.getArray("location-name"));
	set("sourceType", context.getString("source-type"));
	set("holdingTime", context.getNumber("holding-time"));
	return input;
}

const postCommand: CommandSpec = {
	name: "timeline post",
	summary: "Create a timeline/Note post.",
	category: "Timeline / Note",
	args: [
		{ name: "homeId", description: "Group chat MID (c...) or square MID (s...).", required: true },
		{ name: "text", description: "Post text.", required: false, variadic: true },
	],
	options: postOptions,
	examples: ["line timeline post cxxxxxxxx 'Hello!'", "line note post cxxxxxxxx --text 'Hello'"],
	auth: true,
	async run(context) {
		const homeId = context.requireArg(0, "homeId");
		return await withClient(context, async ({ base }) => {
			const result = await base.timeline.createPost(postInput(context, homeId, 1) as never);
			return result;
		});
	},
	format(value) {
		const result = value as { code?: number; message?: string };
		return result.code === 0 || result.code === undefined
			? "Post created."
			: `Timeline error ${result.code}: ${result.message ?? ""}`;
	},
};

const listCommand: CommandSpec = {
	name: "timeline list",
	summary: "List timeline/Note posts.",
	category: "Timeline / Note",
	args: [{ name: "homeId", description: "Group or square MID.", required: true }],
	options: [
		{ name: "post-id", type: "string", valueName: "postId", description: "Fetch one post." },
		{ name: "updated-time", type: "number", valueName: "ms", description: "Updated-time cursor." },
		{ name: "source-type", type: "string", valueName: "type", description: "Source type." },
	],
	examples: ["line timeline list cxxxxxxxx"],
	auth: true,
	async run(context) {
		const homeId = context.requireArg(0, "homeId");
		return await withClient(context, async ({ base }) => {
			const result = await base.timeline.listPost({
				homeId,
				postId: context.getString("post-id"),
				updatedTime: context.getNumber("updated-time"),
				sourceType: context.getString("source-type"),
			});
			return result;
		});
	},
	format: formatTimeline,
};

const getCommand: CommandSpec = {
	name: "timeline get",
	summary: "Fetch one timeline/Note post.",
	category: "Timeline / Note",
	args: [
		{ name: "homeId", description: "Group or square MID.", required: true },
		{ name: "postId", description: "Post id.", required: true },
	],
	examples: ["line timeline get cxxxxxxxx 123456"],
	auth: true,
	async run(context) {
		const homeId = context.requireArg(0, "homeId");
		const postId = context.requireArg(1, "postId");
		return await withClient(context, async ({ base }) => {
			return await base.timeline.getPost({ homeId, postId });
		});
	},
	format: formatTimeline,
};

const updateCommand: CommandSpec = {
	name: "timeline update",
	summary: "Update a timeline/Note post.",
	category: "Timeline / Note",
	args: [
		{ name: "homeId", description: "Group or square MID.", required: true },
		{ name: "postId", description: "Post id.", required: true },
	],
	options: postOptions,
	examples: ["line timeline update cxxxxxxxx 123456 --text 'Edited'"],
	auth: true,
	async run(context) {
		const homeId = context.requireArg(0, "homeId");
		const postId = context.requireArg(1, "postId");
		const input = postInput(context, homeId, 2);
		return await withClient(context, async ({ base }) => {
			return await base.timeline.updatePost({ ...input, postId } as never);
		});
	},
	format: formatTimeline,
};

const deleteCommand: CommandSpec = {
	name: "timeline delete",
	summary: "Delete a timeline/Note post.",
	category: "Timeline / Note",
	args: [
		{ name: "homeId", description: "Group or square MID.", required: true },
		{ name: "postId", description: "Post id.", required: true },
	],
	options: [YES_OPTION],
	examples: ["line timeline delete cxxxxxxxx 123456 --yes"],
	auth: true,
	async run(context) {
		const homeId = context.requireArg(0, "homeId");
		const postId = context.requireArg(1, "postId");
		if (!context.getBool("yes")) throw new UsageError("Pass --yes to confirm deleting the post");
		return await withClient(context, async ({ base }) => {
			return await base.timeline.deletePost({ homeId, postId });
		});
	},
	format: formatTimeline,
};

const shareCommand: CommandSpec = {
	name: "timeline share",
	summary: "Share a timeline/Note post to a chat.",
	category: "Timeline / Note",
	args: [
		{ name: "homeId", description: "Group or square MID.", required: true },
		{ name: "postId", description: "Post id.", required: true },
		{ name: "chatMid", description: "Destination chat MID.", required: true },
	],
	examples: ["line timeline share cxxxxxxxx 123456 cxxxxxxxx"],
	auth: true,
	async run(context) {
		const homeId = context.requireArg(0, "homeId");
		const postId = context.requireArg(1, "postId");
		const chatMid = context.requireArg(2, "chatMid");
		return await withClient(context, async ({ base }) => {
			return await base.timeline.sharePost({ homeId, postId, chatMid });
		});
	},
	format: formatTimeline,
};

const likeCommand: CommandSpec = {
	name: "timeline like",
	summary: "Like a timeline/Note post.",
	category: "Timeline / Note",
	args: [
		{ name: "homeId", description: "Group or square MID.", required: true },
		{ name: "postId", description: "Post id.", required: true },
	],
	options: [
		{
			name: "type",
			type: "string",
			valueName: "code",
			choices: ["1003", "1001", "1002", "1004", "1006", "1005"],
			description: "Like type (default 1003 GOOD).",
		},
	],
	examples: ["line timeline like cxxxxxxxx 123456 --type 1001"],
	auth: true,
	async run(context) {
		const homeId = context.requireArg(0, "homeId");
		const contentId = context.requireArg(1, "postId");
		const likeType = (context.getString("type") ?? "1003") as never;
		return await withClient(context, async ({ base }) => {
			return await base.timeline.likePost({ homeId, contentId, likeType });
		});
	},
	format: formatTimeline,
};

const commentCommand: CommandSpec = {
	name: "timeline comment",
	summary: "Comment on a timeline/Note post.",
	category: "Timeline / Note",
	args: [
		{ name: "homeId", description: "Group or square MID.", required: true },
		{ name: "postId", description: "Post id.", required: true },
		{ name: "text", description: "Comment text.", required: true, variadic: true },
	],
	examples: ["line timeline comment cxxxxxxxx 123456 'Nice!'"],
	auth: true,
	async run(context) {
		const homeId = context.requireArg(0, "homeId");
		const contentId = context.requireArg(1, "postId");
		const commentText = context.rest(2);
		if (!commentText) throw new UsageError("Missing comment text");
		return await withClient(context, async ({ base }) => {
			return await base.timeline.createComment({ homeId, contentId, commentText });
		});
	},
	format: formatTimeline,
};

const uploadCommand: CommandSpec = {
	name: "timeline upload",
	summary: "Upload an image or video for a Note post.",
	category: "Timeline / Note",
	args: [{ name: "file", description: "Image or video file.", required: true }],
	options: [
		{
			name: "type",
			type: "string",
			valueName: "type",
			choices: ["image", "video"],
			description: "Media type (default: inferred).",
		},
	],
	examples: ["line timeline upload ./photo.jpg"],
	auth: true,
	async run(context) {
		const file = await readFileAsBlob(context.requireArg(0, "file"), context.settings.cwd);
		const type = (context.getString("type") ??
			(file.blob.type.startsWith("video/") ? "video" : "image")) as "image" | "video";
		return await withClient(context, async ({ base }) => {
			const result = await base.timeline.uploadNoteMedia(type, file.blob);
			return { ...result, type, file: file.path };
		});
	},
	format(value) {
		const result = value as { objId: string; objHash: string };
		return `Uploaded ${result.objId} (${result.objHash})`;
	},
};

function formatTimeline(value: unknown): string {
	const result = value as {
		code?: number;
		message?: string;
		result?: { posts?: Array<Record<string, unknown>> };
	};
	if (result.code !== undefined && result.code !== 0) {
		return `Timeline error ${result.code}: ${result.message ?? ""}`;
	}
	const posts = result.result?.posts;
	if (Array.isArray(posts)) {
		if (!posts.length) return "No posts.";
		return posts
			.map((post) => `${String(post.id ?? post.postId ?? "")}  ${String(post.text ?? "")}`)
			.join("\n");
	}
	return formatJson(value);
}

export const timelineCommands: CommandSpec[] = [
	postCommand,
	listCommand,
	getCommand,
	updateCommand,
	deleteCommand,
	shareCommand,
	likeCommand,
	commentCommand,
	uploadCommand,
];

export const noteCommands: CommandSpec[] = timelineCommands
	.filter((command) => command.name !== "timeline upload")
	.map((command) => ({
		...command,
		name: command.name.replace(/^timeline/, "note"),
		category: "Timeline / Note",
		summary: command.summary.replace("timeline/Note", "Note"),
		examples: (command.examples ?? []).map((example) =>
			example.replace(/^line timeline/, "line note"),
		),
	}));
