import { readFile, stat, writeFile } from "node:fs/promises";
import { extname, resolve } from "node:path";
import { CliError, UsageError } from "./errors.ts";

const MIME_BY_EXTENSION: Record<string, string> = {
	".jpg": "image/jpeg",
	".jpeg": "image/jpeg",
	".png": "image/png",
	".gif": "image/gif",
	".webp": "image/webp",
	".heic": "image/heic",
	".mp4": "video/mp4",
	".mov": "video/quicktime",
	".m4v": "video/mp4",
	".webm": "video/webm",
	".mp3": "audio/mpeg",
	".m4a": "audio/mp4",
	".aac": "audio/aac",
	".wav": "audio/wav",
	".ogg": "audio/ogg",
	".pdf": "application/pdf",
	".txt": "text/plain",
	".json": "application/json",
	".zip": "application/zip",
};

export function mimeFromFilename(filename: string): string {
	return MIME_BY_EXTENSION[extname(filename).toLowerCase()] ?? "application/octet-stream";
}

export function resolveInputPath(path: string, cwd: string): string {
	return path === "-" ? "-" : resolve(cwd, path);
}

export async function readTextInput(
	path: string | undefined,
	cwd: string,
	stdin: NodeJS.ReadableStream = process.stdin,
): Promise<string> {
	if (path === undefined || path === "-") {
		let text = "";
		for await (const chunk of stdin) {
			text += typeof chunk === "string" ? chunk : Buffer.from(chunk).toString("utf8");
		}
		return text;
	}
	return await readFile(resolve(cwd, path), "utf8");
}

export async function readFileAsBlob(
	path: string,
	cwd: string,
): Promise<{ blob: Blob; filename: string; path: string }> {
	const resolved = resolve(cwd, path);
	let info;
	try {
		info = await stat(resolved);
	} catch (error) {
		throw new CliError("NOT_FOUND", `File not found: ${resolved}`, { cause: error });
	}
	if (!info.isFile()) throw new UsageError(`Not a file: ${resolved}`);
	const data = await readFile(resolved);
	const filename = resolved.split(/[\\/]/).at(-1) ?? "file";
	return {
		blob: new Blob([data], { type: mimeFromFilename(filename) }),
		filename,
		path: resolved,
	};
}

export async function writeBinaryFile(
	path: string,
	data: Blob | Uint8Array | ArrayBuffer,
	cwd: string,
): Promise<{ path: string; size: number }> {
	const resolved = resolve(cwd, path);
	const bytes =
		data instanceof Blob
			? new Uint8Array(await data.arrayBuffer())
			: data instanceof ArrayBuffer
				? new Uint8Array(data)
				: data;
	await writeFile(resolved, bytes);
	return { path: resolved, size: bytes.byteLength };
}
