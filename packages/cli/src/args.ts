import { UsageError } from "./errors.ts";

export type OptionType = "boolean" | "string" | "number" | "array";

export interface OptionSpec {
	name: string;
	short?: string;
	type: OptionType;
	description: string;
	valueName?: string;
	choices?: readonly string[];
	default?: string | number | boolean;
	hidden?: boolean;
}

export type OptionValue = string | number | boolean | string[];
export type ParsedOptions = Record<string, OptionValue>;

export interface ParsedArguments {
	options: ParsedOptions;
	positionals: string[];
}

/** Options accepted before and after every command. */
export const GLOBAL_OPTIONS: readonly OptionSpec[] = [
	{
		name: "json",
		type: "boolean",
		description: "Print the command result as JSON (machine readable).",
	},
	{
		name: "check-session",
		type: "boolean",
		description:
			"Verify the saved auth token with getProfile() before running. Auth commands always check; other commands use the cached profile unless this flag is set.",
	},
	{
		name: "profile",
		type: "string",
		valueName: "name|path",
		description:
			"Profile name under ~/.linejs, or a path to a profile JSON file. Defaults to default.",
	},
	{
		name: "device",
		type: "string",
		valueName: "device",
		description:
			"Override the emulated device (DESKTOPWIN, DESKTOPMAC, ANDROID, ANDROIDSECONDARY, IOS, IOSIPAD, WATCHOS, WEAROS).",
	},
	{
		name: "app-version",
		type: "string",
		valueName: "version",
		description: "Override the emulated LINE app version.",
	},
	{
		name: "endpoint",
		type: "string",
		valueName: "host",
		description: "Override the LEGY endpoint (advanced).",
	},
	{
		name: "timeout",
		type: "number",
		valueName: "ms",
		description: "Request timeout in milliseconds (default: 30000).",
	},
	{
		name: "verbose",
		short: "v",
		type: "boolean",
		description: "Write LINEJS request logs to stderr.",
	},
	{
		name: "color",
		type: "boolean",
		description: "Colorize human output. Use --no-color to disable.",
	},
	{
		name: "help",
		short: "h",
		type: "boolean",
		description: "Show help for the command.",
	},
	{
		name: "version",
		type: "boolean",
		description: "Print the CLI version.",
	},
];

function buildLongMap(specs: readonly OptionSpec[]): Map<string, OptionSpec> {
	const map = new Map<string, OptionSpec>();
	for (const spec of specs) map.set(spec.name, spec);
	return map;
}

function buildShortMap(specs: readonly OptionSpec[]): Map<string, OptionSpec> {
	const map = new Map<string, OptionSpec>();
	for (const spec of specs) {
		if (spec.short) map.set(spec.short, spec);
	}
	return map;
}

function isNegativeNumber(value: string): boolean {
	return /^-?\d+(?:\.\d+)?$/.test(value);
}

/** True for `--foo`, `--no-foo`, and `-x`, but not for `-` or negative numbers. */
export function isOptionToken(token: string): boolean {
	return token.length > 1 && token.startsWith("-") && !isNegativeNumber(token);
}

function splitLongToken(token: string): { name: string; value?: string; negated: boolean } {
	let body = token.slice(2);
	let value: string | undefined;
	const equals = body.indexOf("=");
	if (equals !== -1) {
		value = body.slice(equals + 1);
		body = body.slice(0, equals);
	}
	if (body.startsWith("no-")) {
		return { name: body.slice(3), value, negated: true };
	}
	return { name: body, value, negated: false };
}

function parseBoolean(value: string, flag: string): boolean {
	switch (value.toLowerCase()) {
		case "1":
		case "true":
		case "yes":
		case "on":
			return true;
		case "0":
		case "false":
		case "no":
		case "off":
			return false;
		default:
			throw new UsageError(`Invalid boolean for ${flag}: ${value}`);
	}
}

function convertValue(spec: OptionSpec, raw: string): string | number {
	if (spec.choices && !spec.choices.includes(raw)) {
		throw new UsageError(
			`Invalid value for --${spec.name}: ${raw} (expected ${spec.choices.join(", ")})`,
		);
	}
	if (spec.type === "number") {
		const value = Number(raw);
		if (!Number.isFinite(value)) {
			throw new UsageError(`Invalid number for --${spec.name}: ${raw}`);
		}
		return value;
	}
	return raw;
}

function setOption(options: ParsedOptions, spec: OptionSpec, value: OptionValue): void {
	if (spec.type === "array") {
		const current = options[spec.name];
		const list = Array.isArray(current) ? current : [];
		const additions = Array.isArray(value) ? value : [String(value)];
		options[spec.name] = [...list, ...additions];
		return;
	}
	options[spec.name] = value;
}

/**
 * Parse command arguments. Values beginning with `-` are accepted as option
 * values (use `--opt=value` when the value itself looks like an option).
 */
export function parseOptions(
	tokens: readonly string[],
	specs: readonly OptionSpec[],
): ParsedArguments {
	const longMap = buildLongMap(specs);
	const shortMap = buildShortMap(specs);
	const options: ParsedOptions = {};
	const positionals: string[] = [];

	for (let index = 0; index < tokens.length; index += 1) {
		const token = tokens[index]!;
		if (token === "--") {
			positionals.push(...tokens.slice(index + 1));
			break;
		}
		if (!isOptionToken(token)) {
			positionals.push(token);
			continue;
		}

		if (token.startsWith("--")) {
			const { name, value, negated } = splitLongToken(token);
			const spec = longMap.get(name);
			if (!spec) {
				throw new UsageError(`Unknown option: --${name}`);
			}
			if (spec.type === "boolean") {
				if (negated) {
					if (value !== undefined) {
						throw new UsageError(`--no-${spec.name} does not accept a value`);
					}
					setOption(options, spec, false);
				} else if (value === undefined) {
					setOption(options, spec, true);
				} else {
					setOption(options, spec, parseBoolean(value, `--${spec.name}`));
				}
				continue;
			}
			if (negated) {
				throw new UsageError(`--no-${spec.name} is only valid for boolean options`);
			}
			let raw = value;
			if (raw === undefined) {
				raw = tokens[index + 1];
				if (raw === undefined) {
					throw new UsageError(`Missing value for --${spec.name}`);
				}
				index += 1;
			}
			if (spec.type === "array") {
				setOption(
					options,
					spec,
					raw
						.split(",")
						.map((entry) => entry.trim())
						.filter(Boolean),
				);
			} else {
				setOption(options, spec, convertValue(spec, raw));
			}
			continue;
		}

		const shortBody = token.slice(1);
		const shortName = shortBody[0]!;
		const spec = shortMap.get(shortName);
		if (!spec) {
			throw new UsageError(`Unknown option: -${shortName}`);
		}
		if (spec.type === "boolean") {
			if (shortBody.length > 1) {
				throw new UsageError(`Combined short options are not supported: ${token}`);
			}
			setOption(options, spec, true);
			continue;
		}
		let raw = shortBody.slice(1);
		if (raw.startsWith("=")) raw = raw.slice(1);
		if (!raw) {
			raw = tokens[index + 1];
			if (raw === undefined) {
				throw new UsageError(`Missing value for -${shortName}`);
			}
			index += 1;
		}
		if (spec.type === "array") {
			setOption(
				options,
				spec,
				raw
					.split(",")
					.map((entry) => entry.trim())
					.filter(Boolean),
			);
		} else {
			setOption(options, spec, convertValue(spec, raw));
		}
	}

	return { options, positionals };
}

/**
 * Remove global options that appear before the command path so the path can be
 * resolved. The tokens are re-parsed with the command's full option set later.
 */
export function splitLeadingGlobalOptions(tokens: readonly string[]): {
	leading: string[];
	rest: string[];
} {
	const specs = [...GLOBAL_OPTIONS];
	let index = 0;
	while (index < tokens.length) {
		const token = tokens[index]!;
		if (token === "--" || !isOptionToken(token)) break;
		const { next } = consumeOptionToken(tokens, index, specs);
		index = next;
	}
	return { leading: tokens.slice(0, index), rest: tokens.slice(index) };
}

function consumeOptionToken(
	tokens: readonly string[],
	index: number,
	specs: readonly OptionSpec[],
): { leading: string[]; next: number } {
	const longMap = buildLongMap(specs);
	const shortMap = buildShortMap(specs);
	const token = tokens[index]!;
	if (token.startsWith("--")) {
		const { name, value, negated } = splitLongToken(token);
		const spec = longMap.get(name);
		if (!spec) throw new UsageError(`Unknown option: --${name}`);
		if (spec.type === "boolean" || value !== undefined) {
			return { leading: [token], next: index + 1 };
		}
		if (negated) return { leading: [token], next: index + 1 };
		if (tokens[index + 1] === undefined) {
			throw new UsageError(`Missing value for --${spec.name}`);
		}
		return { leading: [token, tokens[index + 1]!], next: index + 2 };
	}
	const shortName = token[1]!;
	const spec = shortMap.get(shortName);
	if (!spec) throw new UsageError(`Unknown option: -${shortName}`);
	if (spec.type === "boolean") return { leading: [token], next: index + 1 };
	if (token.length > 2) return { leading: [token], next: index + 1 };
	if (tokens[index + 1] === undefined) {
		throw new UsageError(`Missing value for -${shortName}`);
	}
	return { leading: [token, tokens[index + 1]!], next: index + 2 };
}
