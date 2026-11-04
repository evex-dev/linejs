import {
	GLOBAL_OPTIONS,
	type OptionSpec,
	parseOptions,
	splitLeadingGlobalOptions,
} from "./args.ts";
import type { CommandSpec } from "./command.ts";
import { CommandContext, type CliSettings } from "./context.ts";
import { CliError, UsageError, errorMessage, toErrorPayload } from "./errors.ts";
import { commandHelp, commandsMetadata, groupHelp, rootHelp } from "./help.ts";
import { Output } from "./output.ts";
import { resolveProfileLocation } from "./paths.ts";
import { allCommands, resolveCommandTokens } from "./registry.ts";
import { VERSION } from "./version.ts";

export interface RunCliOptions {
	stdout?: (chunk: string) => void;
	stderr?: (chunk: string) => void;
	env?: NodeJS.ProcessEnv;
	cwd?: string;
	interactive?: boolean;
	color?: boolean;
	mcp?: boolean;
	signal?: AbortSignal;
	handleSignals?: boolean;
}

export interface RunCliResult {
	exitCode: number;
}

const COMMANDS_OPTIONS: OptionSpec[] = [
	...GLOBAL_OPTIONS,
	{
		name: "category",
		type: "string",
		valueName: "category",
		description: "Filter by category or command name.",
	},
];

function detectJson(argv: readonly string[]): boolean {
	for (const token of argv) {
		if (token === "--json") return true;
		if (token === "--json=true" || token === "--json=1") return true;
		if (token === "--json=false" || token === "--json=0") return false;
		if (token === "--") break;
	}
	return false;
}

function reportError(error: unknown, output: Output, json: boolean, verbose: boolean): void {
	const payload = toErrorPayload(error);
	if (json) {
		output.writeErrLine(JSON.stringify({ error: payload }));
	} else {
		output.writeErrLine(`${output.style("red", "error:")} ${payload.message}`);
		const details = payload.details;
		if (details && typeof details === "object" && "hint" in details) {
			output.writeErrLine(`${output.style("dim", "hint:")} ${String(details.hint)}`);
		}
		if (error instanceof CliError && error.code === "USAGE") {
			output.writeErrLine(output.dim("Run `line help` to list commands."));
		}
		if (verbose && error instanceof Error && error.stack) {
			output.writeErrLine(error.stack);
		}
	}
}

function suggest(name: string): string[] {
	const lower = name.toLowerCase();
	const candidates = allCommands
		.map((command) => command.name)
		.filter(
			(command) => command.toLowerCase().includes(lower) || lower.includes(command.split(" ")[0]!),
		);
	return candidates.slice(0, 5);
}

function uniqueOptions(
	primary: readonly OptionSpec[],
	secondary: readonly OptionSpec[],
): OptionSpec[] {
	const seen = new Set<string>();
	const output: OptionSpec[] = [];
	for (const spec of [...primary, ...secondary]) {
		if (seen.has(spec.name)) continue;
		seen.add(spec.name);
		output.push(spec);
	}
	return output;
}

function commandTable(output: Output, commands: readonly CommandSpec[]): void {
	output.table(
		commands.map((command) => ({
			name: command.name,
			category: command.category,
			summary: command.summary,
		})),
		[
			{ key: "name", label: "COMMAND", maxWidth: 34 },
			{ key: "category", label: "CATEGORY", maxWidth: 20 },
			{ key: "summary", label: "SUMMARY", maxWidth: 80 },
		],
	);
}

async function runMetaCommand(
	argv: readonly string[],
	output: Output,
	json: boolean,
	options: { help: boolean; version: boolean },
): Promise<RunCliResult> {
	if (options.version) {
		output.writeLine(VERSION);
		return { exitCode: 0 };
	}
	if (argv[0] === "help") {
		const helpArgs = argv.slice(1);
		const { leading, rest } = splitLeadingGlobalOptions(helpArgs);
		const parsed = parseOptions(leading, GLOBAL_OPTIONS);
		const helpJson = Boolean(parsed.options.json) || json;
		const target = resolveCommandTokens(rest);
		if (target.unknown) {
			throw new UsageError(`Unknown command: ${target.unknown}`, {
				hint: suggest(target.unknown).join(", "),
			});
		}
		if (target.command) {
			if (helpJson) {
				output.writeLine(JSON.stringify(commandsMetadata([target.command])[0], null, 2));
			} else {
				output.writeLine(commandHelp(target.command));
			}
			return { exitCode: 0 };
		}
		if (target.group) {
			if (helpJson) {
				const entries = target.groupCommands ?? [];
				output.writeLine(
					JSON.stringify(
						{
							group: target.group,
							commands: commandsMetadata(entries),
						},
						null,
						2,
					),
				);
			} else {
				output.writeLine(groupHelp(target.group, target.groupCommands ?? []));
			}
			return { exitCode: 0 };
		}
		if (helpJson) {
			output.writeLine(JSON.stringify({ version: VERSION, commands: commandsMetadata() }, null, 2));
		} else {
			output.writeLine(rootHelp());
		}
		return { exitCode: 0 };
	}

	if (argv[0] === "commands") {
		const parsed = parseOptions(argv.slice(1), COMMANDS_OPTIONS);
		const effectiveJson = Boolean(parsed.options.json) || json;
		const filter = String(parsed.options.category ?? "")
			.trim()
			.toLowerCase();
		const commands = allCommands.filter((command) => {
			if (!filter) return true;
			return (
				command.category.toLowerCase().includes(filter) ||
				command.name.toLowerCase().includes(filter)
			);
		});
		if (effectiveJson) {
			output.writeLine(
				JSON.stringify(
					{
						commandCount: commands.length,
						commands: commandsMetadata(commands),
					},
					null,
					2,
				),
			);
		} else {
			commandTable(output, commands);
		}
		return { exitCode: 0 };
	}

	if (json) {
		output.writeLine(JSON.stringify({ version: VERSION, commands: commandsMetadata() }, null, 2));
	} else {
		output.writeLine(rootHelp());
	}
	return { exitCode: 0 };
}

export async function runCli(
	argv: readonly string[],
	options: RunCliOptions = {},
): Promise<RunCliResult> {
	const env = options.env ?? process.env;
	const cwd = options.cwd ?? process.cwd();
	const stdout = options.stdout ?? ((chunk: string) => process.stdout.write(chunk));
	const stderr = options.stderr ?? ((chunk: string) => process.stderr.write(chunk));
	const jsonHint = detectJson(argv);
	const color =
		options.color ??
		(!options.stdout && Boolean(process.stdout.isTTY) && !env.NO_COLOR && env.TERM !== "dumb");

	let output = new Output({ stdout, stderr }, { json: jsonHint, color });
	let json = jsonHint;
	let verbose = argv.includes("--verbose") || argv.includes("-v");

	try {
		const { leading, rest } = splitLeadingGlobalOptions(argv);
		const leadingParsed = parseOptions(leading, GLOBAL_OPTIONS);
		verbose = Boolean(leadingParsed.options.verbose);
		if (leadingParsed.options.version) {
			output.writeLine(VERSION);
			return { exitCode: 0 };
		}
		if (!rest.length) {
			return await runMetaCommand([], output, Boolean(leadingParsed.options.json), {
				help: true,
				version: false,
			});
		}
		if (rest[0] === "help" || rest[0] === "commands") {
			const result = await runMetaCommand(rest, output, Boolean(leadingParsed.options.json), {
				help: rest[0] === "help",
				version: false,
			});
			return result;
		}

		const resolution = resolveCommandTokens(rest);
		if (resolution.unknown) {
			const suggestions = suggest(resolution.unknown);
			throw new UsageError(
				`Unknown command: ${resolution.unknown}`,
				suggestions.length ? { hint: `Did you mean: ${suggestions.join(", ")}?` } : undefined,
			);
		}
		if (!resolution.command) {
			const nonOption = resolution.remaining.find((token) => !token.startsWith("-"));
			if (nonOption && resolution.group) {
				throw new UsageError(`Unknown ${resolution.group} subcommand: ${nonOption}`, {
					hint: `Run \`line help ${resolution.group}\` for the available subcommands.`,
				});
			}
			const entries = resolution.groupCommands ?? allCommands;
			let groupJson = Boolean(leadingParsed.options.json);
			try {
				groupJson =
					groupJson || Boolean(parseOptions(resolution.remaining, GLOBAL_OPTIONS).options.json);
			} catch {
				// Unknown options are reported after a real command is selected.
			}
			if (groupJson) {
				output.writeLine(
					JSON.stringify(
						{
							group: resolution.group ?? null,
							commands: commandsMetadata(entries),
						},
						null,
						2,
					),
				);
			} else {
				output.writeLine(
					resolution.group ? groupHelp(resolution.group, entries) : rootHelp(entries),
				);
			}
			return { exitCode: 0 };
		}

		const command = resolution.command;
		const specs = uniqueOptions(command.options ?? [], GLOBAL_OPTIONS);
		const parsed = parseOptions([...leading, ...resolution.remaining], specs);
		json = Boolean(parsed.options.json);
		verbose = Boolean(parsed.options.verbose);
		output = new Output({ stdout, stderr }, { json, color });

		if (parsed.options.version) {
			output.writeLine(VERSION);
			return { exitCode: 0 };
		}
		if (parsed.options.help) {
			output.writeLine(
				json ? JSON.stringify(commandsMetadata([command])[0], null, 2) : commandHelp(command),
			);
			return { exitCode: 0 };
		}

		let profile;
		try {
			profile = resolveProfileLocation(
				typeof parsed.options.profile === "string" ? parsed.options.profile : undefined,
				env,
				cwd,
			);
		} catch (error) {
			throw new UsageError(errorMessage(error));
		}

		const timeout = typeof parsed.options.timeout === "number" ? parsed.options.timeout : undefined;
		if (timeout !== undefined && timeout <= 0) throw new UsageError("--timeout must be positive");

		const interactive =
			options.interactive ??
			(Boolean(process.stdin.isTTY) &&
				Boolean(process.stdout.isTTY) &&
				!env.LINEJS_NONINTERACTIVE &&
				!options.mcp);

		const controller = new AbortController();
		const linkAbort = () => controller.abort();
		if (options.signal) {
			if (options.signal.aborted) controller.abort();
			else options.signal.addEventListener("abort", linkAbort, { once: true });
		}

		const handleSignals = options.handleSignals ?? !options.mcp;
		let interrupts = 0;
		const onSigint = () => {
			interrupts += 1;
			if (interrupts === 1) {
				output.writeErrLine(output.dim("Interrupting (press Ctrl+C again to force)."));
				controller.abort();
			} else {
				process.exit(130);
			}
		};
		if (handleSignals) process.on("SIGINT", onSigint);

		const checkSession =
			Boolean(parsed.options["check-session"]) || command.name.startsWith("auth ");
		const settings: CliSettings = {
			profile,
			device: typeof parsed.options.device === "string" ? parsed.options.device : undefined,
			appVersion:
				typeof parsed.options["app-version"] === "string"
					? parsed.options["app-version"]
					: undefined,
			endpoint: typeof parsed.options.endpoint === "string" ? parsed.options.endpoint : undefined,
			timeout,
			verbose,
			json,
			interactive,
			mcp: Boolean(options.mcp),
			checkSession,
			env,
			cwd,
			signal: controller.signal,
		};
		const context = new CommandContext({
			options: parsed.options,
			positionals: parsed.positionals,
			output,
			settings,
		});

		try {
			const result = await command.run(context);
			if (!command.silent) {
				const value = result === undefined ? { ok: true } : result;
				output.result(
					value,
					command.format ? (input) => command.format!(input, context) : undefined,
				);
			}
			return { exitCode: 0 };
		} finally {
			if (handleSignals) process.off("SIGINT", onSigint);
			options.signal?.removeEventListener("abort", linkAbort);
		}
	} catch (error) {
		reportError(error, output, json, verbose);
		return { exitCode: error instanceof CliError ? error.exitCode : 1 };
	}
}
