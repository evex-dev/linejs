import type { CommandSpec } from "../command.ts";
import { writeBinaryFile } from "../files.ts";
import { withClient } from "../session.ts";
import { outOption } from "./shared.ts";

const albumsCommand: CommandSpec = {
	name: "moa albums",
	summary: "List LINE Album (Moa) albums.",
	category: "Album (Moa)",
	options: [
		{ name: "cursor", type: "string", valueName: "cursor", description: "Pagination cursor." },
		{
			name: "order-by",
			type: "string",
			valueName: "order",
			description: "Order (default createTimeDesc).",
		},
		{
			name: "include",
			type: "string",
			valueName: "fields",
			description: "Additional fields to include.",
		},
	],
	examples: ["line moa albums", "line moa albums --json"],
	auth: true,
	async run(context) {
		return await withClient(context, async ({ base }) => {
			return await base.moa.getAlbums({
				cursor: context.getString("cursor"),
				orderBy: context.getString("order-by"),
				include: context.getString("include"),
			});
		});
	},
	format(value) {
		const result = value as {
			result?: { albums?: Array<Record<string, unknown>> };
			code?: number;
			message?: string;
		};
		if (result.code !== undefined && result.code !== 0) {
			return `Moa error ${result.code}: ${result.message ?? ""}`;
		}
		const albums = result.result?.albums ?? [];
		if (!albums.length) return "No albums.";
		return albums
			.map(
				(album) =>
					`${String(album.albumId ?? "")}  ${String(album.title ?? "")}  (${String(
						album.photoCount ?? 0,
					)} photos, chat ${String(album.chatId ?? "")})`,
			)
			.join("\n");
	},
};

const photosCommand: CommandSpec = {
	name: "moa photos",
	summary: "List photos in a LINE Album album.",
	category: "Album (Moa)",
	options: [
		{
			name: "chat-id",
			type: "string",
			valueName: "mid",
			description: "Chat MID owning the album.",
		},
		{ name: "album-id", type: "string", valueName: "id", description: "Album id." },
		{ name: "cursor", type: "string", valueName: "cursor", description: "Pagination cursor." },
		{ name: "page-size", type: "number", valueName: "n", description: "Page size (default 100)." },
		{
			name: "order-by",
			type: "string",
			valueName: "order",
			description: "Order (default createTimeDesc).",
		},
		{
			name: "include",
			type: "string",
			valueName: "fields",
			description: "Fields to include (default all).",
		},
		{ name: "filter-type", type: "string", valueName: "type", description: "Filter type." },
		{
			name: "target-user",
			type: "string",
			valueName: "mid",
			description: "Filter by uploader MID.",
		},
	],
	examples: ["line moa photos --chat-id cxxxxxxxx --album-id 123"],
	auth: true,
	async run(context) {
		const chatId = context.requireString("chat-id", "Missing --chat-id");
		const albumId = context.requireString("album-id", "Missing --album-id");
		return await withClient(context, async ({ base }) => {
			return await base.moa.getPhotos({
				chatId,
				albumId,
				cursor: context.getString("cursor"),
				pageSize: context.getNumber("page-size"),
				orderBy: context.getString("order-by"),
				include: context.getString("include"),
				filterType: context.getString("filter-type"),
				targetUser: context.getString("target-user"),
			});
		});
	},
	format(value) {
		const result = value as {
			result?: { photos?: Array<Record<string, unknown>> };
			code?: number;
			message?: string;
		};
		if (result.code !== undefined && result.code !== 0) {
			return `Moa error ${result.code}: ${result.message ?? ""}`;
		}
		const photos = result.result?.photos ?? [];
		if (!photos.length) return "No photos.";
		return photos
			.map(
				(photo) =>
					`${String(photo.oid ?? photo.photoId ?? photo.id ?? "")}  ${String(
						photo.createUserMid ?? "",
					)}  ${String(photo.shotTime ?? "")}`,
			)
			.join("\n");
	},
};

const downloadCommand: CommandSpec = {
	name: "moa download",
	summary: "Download an original photo or video from a LINE Album.",
	category: "Album (Moa)",
	options: [
		{ name: "chat-id", type: "string", valueName: "mid", description: "Chat MID." },
		{ name: "album-id", type: "string", valueName: "id", description: "Album id." },
		{ name: "oid", type: "string", valueName: "oid", description: "Object id." },
		{
			name: "prefix",
			type: "string",
			valueName: "prefix",
			choices: ["album/a", "album/v"],
			description: "Resource prefix (album/a for images, album/v for videos).",
		},
		outOption("Output file."),
	],
	examples: ["line moa download --chat-id cxxxxxxxx --album-id 123 --oid abc --out ./photo.jpg"],
	auth: true,
	async run(context) {
		const chatId = context.requireString("chat-id", "Missing --chat-id");
		const albumId = context.requireString("album-id", "Missing --album-id");
		const oid = context.requireString("oid", "Missing --oid");
		const out = context.requireString("out", "Missing --out");
		const prefix = (context.getString("prefix") ?? "album/a") as "album/a" | "album/v";
		return await withClient(context, async ({ base }) => {
			const data = await base.moa.downloadPhoto({ chatId, albumId, oid, prefix });
			const written = await writeBinaryFile(out, data, context.settings.cwd);
			return { ok: true, ...written };
		});
	},
	format(value) {
		const result = value as { path: string; size: number };
		return `Saved ${result.size} bytes to ${result.path}`;
	},
};

export const moaCommands: CommandSpec[] = [albumsCommand, photosCommand, downloadCommand];
