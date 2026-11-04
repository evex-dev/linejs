import { test } from "vite-plus/test";
import assert from "node:assert/strict";
import { resolveCommandTokens } from "../src/registry.ts";

test("resolves two- and three-segment command paths", () => {
	const login = resolveCommandTokens(["auth", "login", "--json"]);
	assert.equal(login.command?.name, "auth login");
	assert.deepEqual(login.remaining, ["--json"]);

	const bgm = resolveCommandTokens(["chats", "bgm", "get", "c123"]);
	assert.equal(bgm.command?.name, "chats bgm get");
	assert.deepEqual(bgm.remaining, ["c123"]);

	const text = resolveCommandTokens(["chats", "send", "c123", "hello", "world"]);
	assert.equal(text.command?.name, "chats send");
	assert.deepEqual(text.remaining, ["c123", "hello", "world"]);
});

test("reports command groups instead of guessing", () => {
	const group = resolveCommandTokens(["chats", "bgm"]);
	assert.equal(group.command, undefined);
	assert.equal(group.group, "chats bgm");
	assert.deepEqual(
		group.groupCommands?.map((command) => command.name),
		["chats bgm get", "chats bgm set"],
	);

	const unknown = resolveCommandTokens(["chat"]);
	assert.equal(unknown.unknown, "chat");
});
