import type { OptionSpec } from "./args.ts";
import type { CommandContext } from "./context.ts";

export interface CommandArgument {
	name: string;
	description: string;
	required?: boolean;
	variadic?: boolean;
}

export interface CommandSpec {
	/** Space-separated command path, e.g. "auth login". */
	name: string;
	summary: string;
	description?: string;
	category: string;
	args?: readonly CommandArgument[];
	options?: readonly OptionSpec[];
	/** Requires an existing profile with an auth token. */
	auth?: boolean;
	/** The command blocks forever (listen, mcp). */
	longRunning?: boolean;
	/** Defaults to true. Set false to reject the command from MCP. */
	mcp?: boolean;
	/** Do not print the command result (streaming/protocol commands). */
	silent?: boolean;
	examples?: readonly string[];
	run(context: CommandContext): Promise<unknown>;
	/** Human-readable formatter. Defaults to pretty JSON. */
	format?(value: unknown, context: CommandContext): string;
}

export function commandUsage(command: CommandSpec): string {
	const args = (command.args ?? [])
		.map((arg) =>
			arg.variadic
				? `${arg.required ? "" : "["}${arg.name}...${arg.required ? "" : "]"}`
				: arg.required
					? `<${arg.name}>`
					: `[${arg.name}]`,
		)
		.join(" ");
	const options = command.options?.length ? " [options]" : "";
	return `line ${command.name}${args ? ` ${args}` : ""}${options}`;
}

export function commandOptions(command: CommandSpec): readonly OptionSpec[] {
	return command.options ?? [];
}

export function isMcpExecutable(command: CommandSpec): boolean {
	return command.mcp !== false && !command.longRunning;
}

export interface CommandMetadata {
	name: string;
	summary: string;
	description?: string;
	category: string;
	usage: string;
	args: readonly CommandArgument[];
	options: readonly OptionSpec[];
	auth: boolean;
	longRunning: boolean;
	mcpExecutable: boolean;
	silent: boolean;
	examples: readonly string[];
}

export function commandMetadata(command: CommandSpec, includeOptions = true): CommandMetadata {
	return {
		name: command.name,
		summary: command.summary,
		...(command.description ? { description: command.description } : {}),
		category: command.category,
		usage: commandUsage(command),
		args: command.args ?? [],
		options: includeOptions ? commandOptions(command) : [],
		auth: Boolean(command.auth),
		longRunning: Boolean(command.longRunning),
		mcpExecutable: isMcpExecutable(command),
		silent: Boolean(command.silent),
		examples: command.examples ?? [],
	};
}

export function groupNames(commands: readonly CommandSpec[]): string[] {
	const groups = new Set<string>();
	for (const command of commands) {
		const first = command.name.split(" ")[0]!;
		if (command.name.includes(" ")) groups.add(first);
	}
	return [...groups];
}

export function commandsInGroup(commands: readonly CommandSpec[], group: string): CommandSpec[] {
	return commands.filter((command) => command.name.split(" ")[0] === group);
}
