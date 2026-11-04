import type { CommandSpec } from "../command.ts";
import { UsageError } from "../errors.ts";
import { readFileAsBlob, writeBinaryFile } from "../files.ts";
import { withClient } from "../session.ts";
import { downloadTalkMessageData } from "./messages.ts";
import { limitOption, outOption } from "./shared.ts";

const uploadCommand: CommandSpec = {
	name: "media upload",
	summary: "Upload a file to a chat, optionally with E2EE.",
	category: "Media",
	args: [{ name: "file", description: "File to upload.", required: true }],
	options: [
		{
			name: "to",
			type: "string",
			valueName: "mid",
			description: "Target user/chat MID (required).",
		},
		{
			name: "type",
			type: "string",
			valueName: "type",
			choices: ["image", "video", "audio", "file", "gif"],
			description: "Media type (default: inferred).",
		},
		{ name: "filename", type: "string", valueName: "name", description: "Display filename." },
		{ name: "duration-ms", type: "number", valueName: "ms", description: "Video/audio duration." },
		{
			name: "e2ee",
			type: "boolean",
			description: "Encrypt with LINE E2EE (default: true for u.../c... MIDs).",
		},
	],
	examples: [
		"line media upload ./photo.jpg --to uxxxxxxxx",
		"line media upload ./file.pdf --to cxxxxxxxx --type file --no-e2ee",
	],
	auth: true,
	async run(context) {
		const to = context.requireString("to", "Missing --to");
		const file = await readFileAsBlob(context.requireArg(0, "file"), context.settings.cwd);
		const type = (context.getString("type") ??
			(file.blob.type.startsWith("video/")
				? "video"
				: file.blob.type.startsWith("audio/")
					? "audio"
					: file.blob.type === "image/gif"
						? "gif"
						: file.blob.type.startsWith("image/")
							? "image"
							: "file")) as "image" | "video" | "audio" | "file" | "gif";
		const useE2ee = context.getBool("e2ee", to.startsWith("u") || to.startsWith("c"));
		if (useE2ee && !(to.startsWith("u") || to.startsWith("c"))) {
			throw new UsageError("E2EE media can only be sent to u... or c... MIDs");
		}
		return await withClient(context, async ({ base }) => {
			if (useE2ee) {
				const message = await base.obs.uploadMediaByE2EE({
					data: file.blob,
					oType: type,
					to,
					filename: context.getString("filename") ?? file.filename,
					durationMs: context.getNumber("duration-ms"),
				});
				return { ok: true, e2ee: true, type, message };
			}
			const result = await base.obs.uploadObjTalk(
				to,
				type,
				file.blob,
				undefined,
				context.getString("filename") ?? file.filename,
				context.getNumber("duration-ms"),
			);
			return {
				ok: true,
				e2ee: false,
				type,
				objId: result.objId,
				objHash: result.objHash,
			};
		});
	},
	format(value) {
		const result = value as {
			e2ee: boolean;
			type: string;
			message?: Record<string, unknown>;
			objId?: string;
		};
		return result.e2ee
			? `Sent E2EE ${result.type} as message ${String(result.message?.id ?? "")}`
			: `Uploaded ${result.type} object ${result.objId ?? ""}`;
	},
};

const downloadCommand: CommandSpec = {
	name: "media download",
	summary: "Download media attached to a message.",
	category: "Media",
	args: [
		{ name: "chatMid", description: "Chat MID.", required: true },
		{ name: "messageId", description: "Message id.", required: true },
	],
	options: [
		outOption("Output file (default: line-<messageId>.<ext>)."),
		{
			name: "preview",
			type: "boolean",
			description: "Download the preview instead of the original.",
		},
		limitOption(100),
	],
	examples: ["line media download cxxxxxxxx 123456789 --out ./photo.jpg"],
	auth: true,
	run: downloadTalkMessageData,
	format(value) {
		const result = value as { path: string; size: number; type: string };
		return `Saved ${result.size} bytes (${result.type}) to ${result.path}`;
	},
};

const objectCommand: CommandSpec = {
	name: "media object",
	summary: "Download an OBS object by path and object id.",
	category: "Media",
	options: [
		{
			name: "path",
			type: "string",
			valueName: "obsPath",
			description: "OBS path (for example talk/m/...).",
		},
		{ name: "oid", type: "string", valueName: "oid", description: "Object id." },
		outOption("Output file (required)."),
	],
	examples: ["line media object --path talk/m/... --oid abc --out ./file.bin"],
	auth: true,
	async run(context) {
		const obsPath = context.requireString("path", "Missing --path");
		const oid = context.requireString("oid", "Missing --oid");
		const out = context.requireString("out", "Missing --out");
		return await withClient(context, async ({ base }) => {
			const blob = await base.obs.downloadObjectForService({ obsPath, oid });
			const written = await writeBinaryFile(out, blob, context.settings.cwd);
			return { ok: true, ...written, type: blob.type };
		});
	},
	format(value) {
		const result = value as { path: string; size: number };
		return `Saved ${result.size} bytes to ${result.path}`;
	},
};

export const mediaCommands: CommandSpec[] = [uploadCommand, downloadCommand, objectCommand];
