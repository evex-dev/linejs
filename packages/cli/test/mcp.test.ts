import { test } from "vite-plus/test";
import assert from "node:assert/strict";
import {
	EXECUTE_TOOL_NAME,
	LIST_TOOL_NAME,
	handleMcpMessage,
	type CliExecutionResult,
} from "../src/mcp/server.ts";

async function call(message: Record<string, unknown>) {
	return (await handleMcpMessage({ jsonrpc: "2.0", ...message })) as Record<string, unknown>;
}

test("initialize negotiates a protocol version", async () => {
	const response = await call({
		id: 1,
		method: "initialize",
		params: {
			protocolVersion: "2025-06-18",
			capabilities: {},
			clientInfo: { name: "test", version: "1" },
		},
	});
	const result = response.result as Record<string, unknown>;
	assert.equal(result.protocolVersion, "2025-06-18");
	assert.ok(result.capabilities);
	assert.equal((result.serverInfo as Record<string, unknown>).name, "@evex-dev/linejs-cli");
});

test("tools/list exposes exactly the two requested tools", async () => {
	const response = await call({ id: 2, method: "tools/list" });
	const tools = (response.result as { tools: Array<{ name: string }> }).tools;
	assert.deepEqual(
		tools.map((tool) => tool.name).sort(),
		[EXECUTE_TOOL_NAME, LIST_TOOL_NAME].sort(),
	);
});

test("list_linejs_cli returns command metadata", async () => {
	const response = await call({
		id: 3,
		method: "tools/call",
		params: { name: LIST_TOOL_NAME, arguments: {} },
	});
	const result = response.result as {
		content: Array<{ text: string }>;
		structuredContent: { commandCount: number; commands: Array<{ name: string }> };
	};
	assert.ok(result.structuredContent.commandCount > 30);
	assert.ok(result.structuredContent.commands.some((command) => command.name === "chats send"));
	const parsed = JSON.parse(result.content[0]!.text);
	assert.equal(parsed.commandCount, result.structuredContent.commandCount);
});

test("execute_linejs_cli forces --json and never uses a shell", async () => {
	let received: string[] = [];
	const executor = async (args: string[]): Promise<CliExecutionResult> => {
		received = args;
		return { exitCode: 0, stdout: '{"ok":true}\n', stderr: "" };
	};
	const response = await handleMcpMessage(
		{
			jsonrpc: "2.0",
			id: 4,
			method: "tools/call",
			params: { name: EXECUTE_TOOL_NAME, arguments: { args: ["auth", "status"] } },
		},
		{ executor },
	);
	const result = (response as Record<string, unknown>).result as {
		content: Array<{ text: string }>;
		structuredContent: { exitCode: number; stdout: string };
	};
	assert.deepEqual(received, ["auth", "status", "--json"]);

	received = [];
	await handleMcpMessage(
		{
			jsonrpc: "2.0",
			id: 9,
			method: "tools/call",
			params: {
				name: EXECUTE_TOOL_NAME,
				arguments: { args: ["chats", "send", "u1", "--", "--literal"] },
			},
		},
		{ executor },
	);
	assert.deepEqual(received, ["chats", "send", "u1", "--json", "--", "--literal"]);
	assert.equal(result.structuredContent.exitCode, 0);
	assert.equal(result.content[0]!.text, '{"ok":true}');
});

test("execute_linejs_cli rejects command groups, mcp, and long-running commands", async () => {
	const executor = async (): Promise<CliExecutionResult> => ({
		exitCode: 0,
		stdout: "",
		stderr: "",
	});
	const group = await handleMcpMessage(
		{
			jsonrpc: "2.0",
			id: 5,
			method: "tools/call",
			params: { name: EXECUTE_TOOL_NAME, arguments: { args: ["chat"] } },
		},
		{ executor },
	);
	const groupResult = (group as Record<string, unknown>).result as { isError: boolean };
	assert.equal(groupResult.isError, true);

	const nested = await handleMcpMessage(
		{
			jsonrpc: "2.0",
			id: 6,
			method: "tools/call",
			params: { name: EXECUTE_TOOL_NAME, arguments: { args: ["mcp"] } },
		},
		{ executor },
	);
	assert.equal(((nested as Record<string, unknown>).result as { isError: boolean }).isError, true);

	const listen = await handleMcpMessage(
		{
			jsonrpc: "2.0",
			id: 7,
			method: "tools/call",
			params: { name: EXECUTE_TOOL_NAME, arguments: { args: ["listen"] } },
		},
		{ executor },
	);
	assert.equal(((listen as Record<string, unknown>).result as { isError: boolean }).isError, true);
});

test("notifications receive no response", async () => {
	const response = await handleMcpMessage({
		jsonrpc: "2.0",
		method: "notifications/initialized",
	});
	assert.equal(response, null);
});

test("unknown methods return JSON-RPC method-not-found", async () => {
	const response = await call({ id: 8, method: "nope" });
	assert.equal((response.error as { code: number }).code, -32601);
});

test("stdio server frames newline-delimited JSON responses", async () => {
	const { Readable, Writable } = await import("node:stream");
	const { runMcpServer } = await import("../src/mcp/server.ts");
	const input = Readable.from([
		`${JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: { protocolVersion: "2024-11-05" } })}\n`,
		`${JSON.stringify({ jsonrpc: "2.0", method: "notifications/initialized" })}\n`,
		`${JSON.stringify({ jsonrpc: "2.0", id: 2, method: "tools/list" })}\n`,
	]);
	let output = "";
	let error = "";
	const writable = new Writable({
		write(chunk, _encoding, callback) {
			output += chunk.toString();
			callback();
		},
	});
	const errors = new Writable({
		write(chunk, _encoding, callback) {
			error += chunk.toString();
			callback();
		},
	});
	const exitCode = await runMcpServer({ input, output: writable, error: errors });
	assert.equal(exitCode, 0);
	const responses = output
		.trim()
		.split("\n")
		.map((line) => JSON.parse(line));
	assert.equal(responses.length, 2);
	assert.equal((responses[0] as { id: number }).id, 1);
	assert.equal((responses[1] as { id: number }).id, 2);
	assert.match(error, /MCP server listening/);
});
