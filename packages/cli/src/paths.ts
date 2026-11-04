import { homedir } from "node:os";
import { basename, isAbsolute, join, resolve, sep } from "node:path";

export interface ProfileLocation {
	/** Absolute path of the profile JSON file. */
	path: string;
	/** Profile name used for display. */
	name: string;
	/** Root directory used for named profiles. */
	home: string;
	/** True when the user supplied an explicit path instead of a name. */
	explicitPath: boolean;
}

export function linejsHome(env: NodeJS.ProcessEnv = process.env): string {
	const configured = env.LINEJS_HOME?.trim();
	if (configured) return resolve(configured);
	return join(homedir(), ".linejs");
}

function expandHome(value: string): string {
	if (value === "~") return homedir();
	if (value.startsWith(`~${sep}`) || value.startsWith("~/")) {
		return join(homedir(), value.slice(2));
	}
	return value;
}

function looksLikePath(value: string): boolean {
	return (
		isAbsolute(value) ||
		value.startsWith(".") ||
		value.startsWith("~") ||
		value.includes("/") ||
		value.includes("\\")
	);
}

function profileNameFromPath(path: string): string {
	const file = basename(path);
	return file.endsWith(".json") ? file.slice(0, -".json".length) : file;
}

/**
 * Resolve --profile:
 *   default / profile2      -> ~/.linejs/<name>.json
 *   profile2.json           -> ~/.linejs/profile2.json
 *   ./profiles/work.json    -> <cwd>/profiles/work.json
 *   /tmp/line.json          -> /tmp/line.json
 */
export function resolveProfileLocation(
	profile: string | undefined,
	env: NodeJS.ProcessEnv = process.env,
	cwd: string = process.cwd(),
): ProfileLocation {
	const home = linejsHome(env);
	const value = (profile ?? env.LINEJS_PROFILE ?? "default").trim();
	if (!value) throw new Error("Profile name must not be empty");
	if (value.includes("\0")) throw new Error("Profile name must not contain NUL bytes");
	if (value === "." || value === "..") {
		throw new Error(`Invalid profile name: ${value}`);
	}

	if (looksLikePath(value)) {
		const expanded = expandHome(value);
		const path = isAbsolute(expanded) ? resolve(expanded) : resolve(cwd, expanded);
		return { path, name: profileNameFromPath(path), home, explicitPath: true };
	}

	const file = value.endsWith(".json") ? value : `${value}.json`;
	const path = join(home, file);
	return { path, name: profileNameFromPath(path), home, explicitPath: false };
}
