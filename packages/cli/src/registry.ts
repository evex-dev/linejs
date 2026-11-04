import type { CommandSpec } from "./command.ts";
import { apiCommands } from "./commands/api.ts";
import { authCommands } from "./commands/auth.ts";
import { birthdayCommands } from "./commands/birthday.ts";
import { callCommands } from "./commands/call.ts";
import { chatsCommands } from "./commands/chats.ts";
import { contactsCommands } from "./commands/contacts.ts";
import { liffCommands } from "./commands/liff.ts";
import { listenCommands } from "./commands/listen.ts";
import { mediaCommands } from "./commands/media.ts";
import { messagesCommands } from "./commands/messages.ts";
import { moaCommands } from "./commands/moa.ts";
import { mcpCommands } from "./commands/mcp.ts";
import { profileCommands } from "./commands/profile.ts";
import { squareCommands } from "./commands/square.ts";
import { storageCommands } from "./commands/storage.ts";
import { timelineCommands, noteCommands } from "./commands/timeline.ts";
import { voomCommands } from "./commands/voom.ts";

export const allCommands: readonly CommandSpec[] = [
	...authCommands,
	...profileCommands,
	...contactsCommands,
	...chatsCommands,
	...messagesCommands,
	...squareCommands,
	...timelineCommands,
	...noteCommands,
	...moaCommands,
	...mediaCommands,
	...callCommands,
	...liffCommands,
	...voomCommands,
	...birthdayCommands,
	...storageCommands,
	...apiCommands,
	...listenCommands,
	...mcpCommands,
].sort((a, b) => a.name.localeCompare(b.name));

export interface CommandResolution {
	command?: CommandSpec;
	/** Resolved command path tokens. */
	path: string[];
	/** Tokens left after the command path. */
	remaining: string[];
	/** Set when the path names a command group instead of an exact command. */
	group?: string;
	groupCommands?: CommandSpec[];
	unknown?: string;
}

/**
 * Resolve the command path from the first tokens. Command paths are contiguous;
 * parsing stops at the first option or unmatched token.
 */
export function resolveCommandTokens(tokens: readonly string[]): CommandResolution {
	const first = tokens[0];
	if (!first || first.startsWith("-")) return { path: [], remaining: [] };
	const path = [first];
	const known = allCommands.filter(
		(command) => command.name === first || command.name.startsWith(`${first} `),
	);
	if (!known.length) {
		return { path, remaining: tokens.slice(1), unknown: first };
	}

	let index = 1;
	while (index < tokens.length) {
		const token = tokens[index]!;
		if (token.startsWith("-")) break;
		const candidate = [...path, token].join(" ");
		const matches = allCommands.filter(
			(command) => command.name === candidate || command.name.startsWith(`${candidate} `),
		);
		if (!matches.length) break;
		path.push(token);
		index += 1;
	}

	const name = path.join(" ");
	const exact = allCommands.find((command) => command.name === name);
	if (exact) {
		return { command: exact, path, remaining: tokens.slice(index) };
	}
	const groupCommands = allCommands.filter((command) => command.name.startsWith(`${name} `));
	return {
		path,
		remaining: tokens.slice(index),
		group: name,
		groupCommands,
	};
}

export function findCommandByName(name: string): CommandSpec | undefined {
	return allCommands.find((command) => command.name === name);
}
