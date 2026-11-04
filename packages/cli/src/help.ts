import { GLOBAL_OPTIONS, type OptionSpec } from "./args.ts";
import { type CommandSpec, commandMetadata, commandUsage } from "./command.ts";
import { allCommands } from "./registry.ts";
import { VERSION } from "./version.ts";

export function describeOption(spec: OptionSpec): string {
	const value =
		spec.type === "boolean"
			? ""
			: ` <${spec.valueName ?? (spec.type === "array" ? "value" : "value")}>`;
	const choices = spec.choices?.length ? ` (${spec.choices.join("|")})` : "";
	const short = spec.short ? `-${spec.short}, ` : "    ";
	return `${short}--${spec.name}${value}${choices}`;
}

function optionLines(specs: readonly OptionSpec[]): string[] {
	const visible = specs.filter((spec) => !spec.hidden);
	const width = Math.max(...visible.map((spec) => describeOption(spec).length), 0);
	return visible.map((spec) => `  ${describeOption(spec).padEnd(width)}  ${spec.description}`);
}

export function rootHelp(commands: readonly CommandSpec[] = allCommands): string {
	const lines = [
		`@evex-dev/linejs-cli ${VERSION}`,
		"LINEJS command-line interface",
		"",
		"Usage:",
		"  line <command> [options]",
		"  line help [command]",
		"  line commands [--json]",
		"",
	];
	const categories = new Map<string, CommandSpec[]>();
	for (const command of commands) {
		const list = categories.get(command.category) ?? [];
		list.push(command);
		categories.set(command.category, list);
	}
	for (const [category, entries] of categories) {
		lines.push(`${category}:`);
		const width = Math.max(...entries.map((entry) => entry.name.length));
		for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
			lines.push(`  ${entry.name.padEnd(width)}  ${entry.summary}`);
		}
		lines.push("");
	}
	lines.push("Global options:");
	lines.push(...optionLines(GLOBAL_OPTIONS));
	lines.push("");
	lines.push("Environment:");
	lines.push("  LINEJS_HOME       Profile directory (default: ~/.linejs)");
	lines.push("  LINEJS_PROFILE    Default profile name/path when --profile is omitted");
	lines.push("  NO_COLOR          Disable ANSI colors");
	lines.push("");
	lines.push("Run `line help <command>` for details.");
	return lines.join("\n");
}

export function groupHelp(group: string, commands: readonly CommandSpec[]): string {
	const entries = commands.filter(
		(command) => command.name === group || command.name.startsWith(`${group} `),
	);
	const lines = [`Usage: line ${group} <command> [options]`, "", `${group} commands:`];
	const width = Math.max(...entries.map((entry) => entry.name.length));
	for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
		lines.push(`  ${entry.name.padEnd(width)}  ${entry.summary}`);
	}
	lines.push("");
	lines.push("Global options:");
	lines.push(...optionLines(GLOBAL_OPTIONS));
	lines.push("");
	lines.push(`Run \`line help ${group} <command>\` for details.`);
	return lines.join("\n");
}

export function commandHelp(command: CommandSpec): string {
	const lines = [commandUsage(command), "", command.summary];
	if (command.description) {
		lines.push("", command.description);
	}
	if (command.args?.length) {
		lines.push("", "Arguments:");
		const width = Math.max(...command.args.map((arg) => arg.name.length));
		for (const arg of command.args) {
			lines.push(
				`  ${arg.name.padEnd(width)}  ${arg.description}${arg.required ? "" : " (optional)"}${arg.variadic ? " (multiple)" : ""}`,
			);
		}
	}
	const options = [...(command.options ?? []), ...GLOBAL_OPTIONS];
	if (options.length) {
		lines.push("", "Options:");
		lines.push(...optionLines(options));
	}
	if (command.examples?.length) {
		lines.push("", "Examples:");
		for (const example of command.examples) lines.push(`  ${example}`);
	}
	lines.push(
		"",
		command.auth
			? "Authentication: requires a logged-in profile."
			: "Authentication: not required.",
	);
	if (command.mcp === false || command.longRunning) {
		lines.push("MCP: not executable through execute_linejs_cli (long-running).");
	} else {
		lines.push("MCP: executable through execute_linejs_cli.");
	}
	return lines.join("\n");
}

export function commandsMetadata(commands: readonly CommandSpec[] = allCommands): unknown[] {
	return commands.map((command) => commandMetadata(command));
}
