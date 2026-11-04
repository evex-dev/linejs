import { once } from "node:events";
import { createInterface } from "node:readline";
import type { Readable, Writable } from "node:stream";
import { splitLeadingGlobalOptions } from "../args.ts";
import { type CommandSpec, commandMetadata, isMcpExecutable } from "../command.ts";
import { allCommands, resolveCommandTokens } from "../registry.ts";
import { runCli } from "../cli.ts";
import { VERSION } from "../version.ts";
import { errorMessage } from "../errors.ts";

export const LIST_TOOL_NAME = "list_linejs_cli";
export const EXECUTE_TOOL_NAME = "execute_linejs_cli";

const PROTOCOL_VERSIONS = ["2024-11-05", "2025-03-26", "2025-06-18"] as const;
const LATEST_PROTOCOL_VERSION = PROTOCOL_VERSIONS[PROTOCOL_VERSIONS.length - 1]!;

export interface ToolDefinition {
	name: string;
	description: string;
	inputSchema: Record<string, unknown>;
}

export function createToolDefinitions(
	commands: readonly CommandSpec[] = allCommands,
): ToolDefinition[] {
	const categories = [...new Set(commands.map((command) => command.category))].sort();
	return [
		{
			name: LIST_TOOL_NAME,
			description:
				"List every LINEJS CLI command with its arguments, options, category, and whether it can run through execute_linejs_cli. Use this before calling execute_linejs_cli.",
			inputSchema: {
				type: "object",
				properties: {
					category: {
						type: "string",
						description: `Only include commands in this category. One of: ${categories.join(", ")}.`,
					},
					includeOptions: {
						type: "boolean",
						description: "Include each command's option metadata (default: true).",
					},
				},
				additionalProperties: false,
			},
		},
		{
			name: EXECUTE_TOOL_NAME,
			description:
				'Execute the LINEJS CLI directly (no shell) with an argv array. Example: {"args":["profile","get","--json"]}. The tool forces --json and rejects long-running or nested MCP commands.',
			inputSchema: {
				type: "object",
				properties: {
					args: {
						type: "array",
						items: { type: "string" },
						minItems: 1,
						description: 'Arguments after the `line` executable, e.g. ["chats","list","--json"].',
					},
				},
				required: ["args"],
				additionalProperties: false,
			},
		},
	];
}

export interface CliExecutionResult {
	exitCode: number;
	stdout: string;
	stderr: string;
}

export type CliExecutor = (args: string[]) => Promise<CliExecutionResult>;

export const defaultCliExecutor: CliExecutor = async (args) => {
	const stdout: string[] = [];
	const stderr: string[] = [];
	const result = await runCli(args, {
		stdout: (chunk) => stdout.push(chunk),
		stderr: (chunk) => stderr.push(chunk),
		interactive: false,
		mcp: true,
		handleSignals: false,
		env: { ...process.env, LINEJS_NONINTERACTIVE: "1" },
	});
	return { exitCode: result.exitCode, stdout: stdout.join(""), stderr: stderr.join("") };
};

function jsonRpcResult(id: string | number | null, result: unknown) {
	return { jsonrpc: "2.0", id, result };
}

function jsonRpcError(id: string | number | null, code: number, message: string, data?: unknown) {
	return {
		jsonrpc: "2.0",
		id,
		error: { code, message, ...(data === undefined ? {} : { data }) },
	};
}

function toolText(text: string, isError = false, structuredContent?: Record<string, unknown>) {
	return {
		content: [{ type: "text", text }],
		...(isError ? { isError: true } : {}),
		...(structuredContent ? { structuredContent } : {}),
	};
}

function listCommands(argumentsValue: Record<string, unknown>) {
	const category =
		typeof argumentsValue.category === "string" ? argumentsValue.category : undefined;
	const includeOptions = argumentsValue.includeOptions !== false;
	const normalized = category?.trim().toLowerCase();
	const commands = allCommands
		.filter((command) => {
			if (!normalized) return true;
			return (
				command.category.toLowerCase().includes(normalized) ||
				command.name.toLowerCase().includes(normalized)
			);
		})
		.map((command) => commandMetadata(command, includeOptions));
	return {
		commandCount: commands.length,
		commands,
	};
}

async function executeCommand(
	argumentsValue: Record<string, unknown>,
	executor: CliExecutor,
): Promise<Record<string, unknown>> {
	if (
		!Array.isArray(argumentsValue.args) ||
		!argumentsValue.args.every((entry) => typeof entry === "string")
	) {
		return toolText("execute_linejs_cli requires args: string[].", true);
	}
	const args = argumentsValue.args as string[];
	if (!args.length) return toolText("execute_linejs_cli requires at least one argument.", true);
	if (args.includes("--password-stdin")) {
		return toolText(
			"--password-stdin reads stdin, which belongs to the MCP transport. Use --password, or log in from a terminal.",
			true,
		);
	}
	const argsFileIndex = args.findIndex(
		(arg) => arg === "--args-file" || arg.startsWith("--args-file="),
	);
	if (
		argsFileIndex !== -1 &&
		(args[argsFileIndex] === "--args-file=-" || args[argsFileIndex + 1] === "-")
	) {
		return toolText(
			"--args-file - reads stdin, which belongs to the MCP transport. Use a file path.",
			true,
		);
	}

	let rest: string[];
	try {
		({ rest } = splitLeadingGlobalOptions(args));
	} catch (error) {
		return toolText(errorMessage(error), true);
	}
	const resolution = resolveCommandTokens(rest);
	const command = resolution.command;
	if (!command) {
		const detail = resolution.group
			? `"${resolution.group}" is a command group, not an executable command. Run list_linejs_cli for exact names.`
			: `Unknown command: ${resolution.unknown ?? rest[0] ?? "(none)"}. Run list_linejs_cli first.`;
		return toolText(detail, true);
	}
	if (command.name === "mcp") {
		return toolText("The mcp command cannot be nested inside an MCP server.", true);
	}
	if (!isMcpExecutable(command)) {
		return toolText(
			`${command.name} is ${command.longRunning ? "long-running" : "not exposed to MCP"} and cannot run through execute_linejs_cli.`,
			true,
		);
	}

	const separator = args.indexOf("--");
	const executionArgs =
		separator === -1
			? [...args, "--json"]
			: [...args.slice(0, separator), "--json", ...args.slice(separator)];
	const execution = await executor(executionArgs);
	const output = execution.stdout.trimEnd();
	const errorText = execution.stderr.trimEnd();
	const content = [
		{
			type: "text",
			text: output || errorText || `(no output; exit code ${execution.exitCode})`,
		},
		...(errorText && output ? [{ type: "text", text: `stderr:\n${errorText}` }] : []),
	];
	return {
		content,
		...(execution.exitCode === 0 ? {} : { isError: true }),
		structuredContent: {
			exitCode: execution.exitCode,
			stdout: execution.stdout,
			stderr: execution.stderr,
		},
	};
}

export async function handleMcpMessage(
	message: unknown,
	options: { commands?: readonly CommandSpec[]; executor?: CliExecutor } = {},
): Promise<unknown | null> {
	if (!message || typeof message !== "object" || Array.isArray(message)) {
		return jsonRpcError(null, -32600, "Invalid Request");
	}
	const request = message as Record<string, unknown>;
	const id = (request.id as string | number | null | undefined) ?? null;
	const isNotification = request.id === undefined;
	const method = request.method;
	if (typeof method !== "string") {
		return isNotification ? null : jsonRpcError(id, -32600, "Invalid Request");
	}
	if (request.jsonrpc !== "2.0") {
		return isNotification ? null : jsonRpcError(id, -32600, "Invalid Request");
	}

	if (isNotification) return null;

	switch (method) {
		case "initialize": {
			const params = (request.params ?? {}) as Record<string, unknown>;
			const requested = params.protocolVersion;
			const protocolVersion =
				typeof requested === "string" &&
				(PROTOCOL_VERSIONS as readonly string[]).includes(requested)
					? requested
					: LATEST_PROTOCOL_VERSION;
			return jsonRpcResult(id, {
				protocolVersion,
				capabilities: { tools: { listChanged: false } },
				serverInfo: { name: "@evex-dev/linejs-cli", version: VERSION },
				instructions:
					"Use list_linejs_cli to discover commands, then execute_linejs_cli with an argv array. No shell is involved; --json is forced. Long-running commands such as listen are rejected.",
			});
		}
		case "ping":
			return jsonRpcResult(id, {});
		case "tools/list": {
			return jsonRpcResult(id, {
				tools: createToolDefinitions(options.commands ?? allCommands),
			});
		}
		case "tools/call": {
			const params = (request.params ?? {}) as Record<string, unknown>;
			const name = params.name;
			const argumentsValue =
				params.arguments && typeof params.arguments === "object" && !Array.isArray(params.arguments)
					? (params.arguments as Record<string, unknown>)
					: {};
			if (name === LIST_TOOL_NAME) {
				const result = listCommands(argumentsValue);
				return jsonRpcResult(id, {
					content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
					structuredContent: result,
				});
			}
			if (name === EXECUTE_TOOL_NAME) {
				return jsonRpcResult(
					id,
					await executeCommand(argumentsValue, options.executor ?? defaultCliExecutor),
				);
			}
			return jsonRpcError(id, -32602, `Unknown tool: ${String(name)}`);
		}
		case "resources/list":
			return jsonRpcResult(id, { resources: [] });
		case "prompts/list":
			return jsonRpcResult(id, { prompts: [] });
		case "logging/setLevel":
			return jsonRpcResult(id, {});
		default:
			return jsonRpcError(id, -32601, `Method not found: ${method}`);
	}
}

export interface RunMcpServerOptions {
	input?: Readable;
	output?: Writable;
	error?: Writable;
	commands?: readonly CommandSpec[];
	executor?: CliExecutor;
	signal?: AbortSignal;
}

export async function runMcpServer(options: RunMcpServerOptions = {}): Promise<number> {
	const input = options.input ?? process.stdin;
	const output = options.output ?? process.stdout;
	const error = options.error ?? process.stderr;
	const commands = options.commands ?? allCommands;
	const executor = options.executor ?? defaultCliExecutor;

	const write = async (value: unknown) => {
		if (!output.write(`${JSON.stringify(value)}\n`)) {
			await once(output, "drain");
		}
	};

	error.write("@evex-dev/linejs-cli MCP server listening on stdio\n");

	const lines = createInterface({ input, crlfDelay: Infinity });
	const onAbort = () => lines.close();
	if (options.signal) {
		if (options.signal.aborted) lines.close();
		else options.signal.addEventListener("abort", onAbort, { once: true });
	}
	let queue: Promise<void> = Promise.resolve();
	for await (const line of lines) {
		if (!line.trim()) continue;
		queue = queue.then(async () => {
			let parsed: unknown;
			try {
				parsed = JSON.parse(line);
			} catch (parseError) {
				await write(jsonRpcError(null, -32700, "Parse error", String(parseError)));
				return;
			}
			try {
				if (Array.isArray(parsed)) {
					const responses = [];
					for (const entry of parsed) {
						const response = await handleMcpMessage(entry, { commands, executor });
						if (response !== null) responses.push(response);
					}
					if (responses.length) await write(responses);
					return;
				}
				const response = await handleMcpMessage(parsed, { commands, executor });
				if (response !== null) await write(response);
			} catch (handlerError) {
				await write(
					jsonRpcError(
						null,
						-32603,
						"Internal error",
						handlerError instanceof Error ? handlerError.message : String(handlerError),
					),
				);
			}
		});
	}
	await queue;
	options.signal?.removeEventListener("abort", onAbort);
	return 0;
}
