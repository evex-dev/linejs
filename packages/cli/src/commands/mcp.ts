import type { CommandSpec } from "../command.ts";

const mcpCommand: CommandSpec = {
	name: "mcp",
	summary: "Run the LINEJS CLI as an MCP server over stdio.",
	description:
		"Exposes exactly two tools: list_linejs_cli (all commands and their metadata) and execute_linejs_cli (argv execution without a shell). Long-running commands such as listen and mcp are not executable through the tools.",
	category: "MCP",
	options: [
		{
			name: "transport",
			type: "string",
			valueName: "transport",
			choices: ["stdio"],
			description: "MCP transport (only stdio is supported).",
		},
	],
	examples: ["line mcp"],
	auth: false,
	longRunning: true,
	mcp: false,
	silent: true,
	async run(context) {
		const { runMcpServer } = await import("../mcp/server.ts");
		const exitCode = await runMcpServer({
			input: process.stdin,
			output: process.stdout,
			error: process.stderr,
			signal: context.signal,
		});
		return { exitCode };
	},
};

export const mcpCommands: CommandSpec[] = [mcpCommand];
