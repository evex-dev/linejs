#!/usr/bin/env node
import { runCli } from "./cli.ts";

const argv = process.argv.slice(2);
// `pnpm line -- ...` / some runners forward the separator; it is not a CLI arg.
if (argv[0] === "--") argv.shift();

const result = await runCli(argv, {
	color: Boolean(process.stdout.isTTY) && !process.env.NO_COLOR && process.env.TERM !== "dumb",
	handleSignals: true,
});

process.exitCode = result.exitCode;

// Every command, the MCP server included, has finished once runCli returns.
// Exit explicitly so a pooled HTTP/2 session or timer left by the library
// cannot keep a bounded run such as `listen --duration` alive (#266). Wait for
// stdout/stderr to drain first so piped output is not cut off.
const drain = (stream: NodeJS.WriteStream) =>
	new Promise<void>((resolve) => stream.write("", () => resolve()));
await Promise.all([drain(process.stdout), drain(process.stderr)]);
process.exit(result.exitCode);
