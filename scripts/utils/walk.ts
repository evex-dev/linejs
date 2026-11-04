/**
 * @description Minimal filesystem walker used by the APK tooling to scan
 *              decompiled trees. Yields files (and, when asked, directories)
 *              depth-first, filtered by extension.
 */
import { readdir } from "node:fs/promises";
import { join } from "node:path";

export interface WalkEntry {
	path: string;
	name: string;
	isFile: boolean;
	isDirectory: boolean;
}

export interface WalkOptions {
	/** Only yield files whose name ends with one of these extensions. */
	exts?: string[];
	/** Also yield directories. Defaults to false. */
	includeDirs?: boolean;
}

async function* walkDir(dir: string, opts: WalkOptions): AsyncGenerator<WalkEntry> {
	for (const entry of await readdir(dir, { withFileTypes: true })) {
		const path = join(dir, entry.name);
		if (entry.isDirectory()) {
			if (opts.includeDirs) {
				yield {
					path,
					name: entry.name,
					isFile: false,
					isDirectory: true,
				};
			}
			yield* walkDir(path, opts);
			continue;
		}
		if (!entry.isFile()) continue;
		if (opts.exts && !opts.exts.some((ext) => entry.name.endsWith(ext))) {
			continue;
		}
		yield { path, name: entry.name, isFile: true, isDirectory: false };
	}
}

export function walk(root: string, opts: WalkOptions = {}): AsyncGenerator<WalkEntry> {
	return walkDir(root, opts);
}
