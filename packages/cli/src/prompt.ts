import { createInterface } from "node:readline/promises";
import type { CommandContext } from "./context.ts";
import { CliError } from "./errors.ts";

export async function promptLine(question: string, context: CommandContext): Promise<string> {
	if (!context.interactive) {
		throw new CliError(
			"INTERACTIVE_REQUIRED",
			`${question.trim()} requires an interactive terminal`,
		);
	}
	const readline = createInterface({ input: process.stdin, output: process.stdout });
	try {
		return await readline.question(question);
	} finally {
		readline.close();
	}
}

export async function confirm(question: string, context: CommandContext): Promise<boolean> {
	const answer = await promptLine(`${question} [y/N] `, context);
	return /^y(?:es)?$/i.test(answer.trim());
}

/** Read a password without echoing it when stdin is a TTY. */
export async function promptSecret(question: string, context: CommandContext): Promise<string> {
	if (!context.interactive) {
		throw new CliError(
			"INTERACTIVE_REQUIRED",
			"Password prompt requires a terminal. Pass --password-stdin or --password.",
		);
	}
	if (!process.stdin.isTTY) {
		const readline = createInterface({ input: process.stdin, output: process.stdout });
		try {
			return await readline.question(question);
		} finally {
			readline.close();
		}
	}

	const stdin = process.stdin;
	const stdout = process.stdout;
	stdout.write(question);
	stdin.setRawMode(true);
	stdin.resume();
	stdin.setEncoding("utf8");

	return await new Promise<string>((resolve, reject) => {
		let value = "";
		const cleanup = () => {
			stdin.off("data", onData);
			stdin.setRawMode(false);
			stdin.pause();
			stdout.write("\n");
		};
		const onData = (chunk: string) => {
			for (const char of chunk) {
				if (char === "\r" || char === "\n") {
					cleanup();
					resolve(value);
					return;
				}
				if (char === "\u0003") {
					cleanup();
					reject(new CliError("CANCELED", "Canceled"));
					return;
				}
				if (char === "\u0004") {
					cleanup();
					resolve(value);
					return;
				}
				if (char === "\u007f" || char === "\b") {
					if (value.length) {
						value = value.slice(0, -1);
						stdout.write("\b \b");
					}
					continue;
				}
				if (char >= " ") {
					value += char;
					stdout.write("*");
				}
			}
		};
		stdin.on("data", onData);
	});
}
