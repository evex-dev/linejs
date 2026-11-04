import type { ParsedOptions } from "./args.ts";
import { CliError, UsageError } from "./errors.ts";
import type { Output } from "./output.ts";
import type { ProfileLocation } from "./paths.ts";

export interface CliSettings {
	profile: ProfileLocation;
	device?: string;
	appVersion?: string;
	endpoint?: string;
	timeout?: number;
	verbose: boolean;
	json: boolean;
	interactive: boolean;
	mcp: boolean;
	checkSession: boolean;
	env: NodeJS.ProcessEnv;
	cwd: string;
	signal: AbortSignal;
}

export class CommandContext {
	readonly options: ParsedOptions;
	readonly positionals: readonly string[];
	readonly output: Output;
	readonly settings: CliSettings;

	constructor(init: {
		options: ParsedOptions;
		positionals: readonly string[];
		output: Output;
		settings: CliSettings;
	}) {
		this.options = init.options;
		this.positionals = init.positionals;
		this.output = init.output;
		this.settings = init.settings;
	}

	get json(): boolean {
		return this.settings.json;
	}

	get interactive(): boolean {
		return this.settings.interactive;
	}

	get signal(): AbortSignal {
		return this.settings.signal;
	}

	has(name: string): boolean {
		return this.options[name] !== undefined;
	}

	getString(name: string): string | undefined {
		const value = this.options[name];
		if (value === undefined) return undefined;
		if (typeof value !== "string") return String(value);
		return value;
	}

	requireString(name: string, message = `Missing required option --${name}`): string {
		const value = this.getString(name);
		if (value === undefined || value === "") throw new UsageError(message);
		return value;
	}

	getNumber(name: string): number | undefined {
		const value = this.options[name];
		if (value === undefined) return undefined;
		const number = typeof value === "number" ? value : Number(value);
		if (!Number.isFinite(number)) throw new UsageError(`Invalid number for --${name}`);
		return number;
	}

	getBool(name: string, defaultValue = false): boolean {
		const value = this.options[name];
		if (value === undefined) return defaultValue;
		if (typeof value === "boolean") return value;
		if (typeof value === "string") return value === "true" || value === "1";
		return Boolean(value);
	}

	getArray(name: string): string[] {
		const value = this.options[name];
		if (value === undefined) return [];
		const list = Array.isArray(value) ? value : [String(value)];
		return list
			.flatMap((entry) => entry.split(","))
			.map((entry) => entry.trim())
			.filter(Boolean);
	}

	getJson<T = unknown>(name: string): T | undefined {
		const value = this.getString(name);
		if (value === undefined) return undefined;
		try {
			return JSON.parse(value) as T;
		} catch (error) {
			throw new UsageError(`--${name} is not valid JSON`, {
				cause: error instanceof Error ? error.message : String(error),
			});
		}
	}

	arg(index: number): string | undefined {
		return this.positionals[index];
	}

	requireArg(index: number, name: string): string {
		const value = this.positionals[index];
		if (value === undefined || value === "") {
			throw new UsageError(`Missing required argument <${name}>`);
		}
		return value;
	}

	rest(index: number): string {
		return this.positionals.slice(index).join(" ");
	}

	requireRest(index: number, name: string): string {
		const value = this.rest(index);
		if (!value) throw new UsageError(`Missing required argument <${name}>`);
		return value;
	}
}

export function requireConfirmation(context: CommandContext, message: string, yes: boolean): void {
	if (yes) return;
	if (!context.interactive) {
		throw new CliError("CONFIRMATION_REQUIRED", `${message} (pass --yes to confirm)`, {
			details: { hint: "This command is destructive; re-run with --yes." },
		});
	}
}
