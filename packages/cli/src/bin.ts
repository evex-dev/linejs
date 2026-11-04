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
