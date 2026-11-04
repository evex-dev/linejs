import { test } from "vite-plus/test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { VERSION } from "../src/version.ts";
import { allCommands } from "../src/registry.ts";

test("CLI version stays in sync with package.json", async () => {
	const pkg = JSON.parse(await readFile(new URL("../package.json", import.meta.url), "utf8")) as {
		version: string;
		bin: Record<string, string>;
	};
	assert.equal(VERSION, pkg.version);
	assert.equal(pkg.bin.line, "./dist/line.mjs");
});

test("command names are unique and metadata is complete", () => {
	const names = new Set<string>();
	for (const command of allCommands) {
		assert.ok(!names.has(command.name), `duplicate command: ${command.name}`);
		names.add(command.name);
		assert.match(command.name, /^[a-z][a-z0-9-]*(?: [a-z][a-z0-9-]*)*$/);
		assert.ok(command.summary.length > 0);
		assert.ok(command.category.length > 0);
		const optionNames = new Set<string>();
		for (const option of command.options ?? []) {
			assert.ok(
				!optionNames.has(option.name),
				`duplicate option on ${command.name}: ${option.name}`,
			);
			optionNames.add(option.name);
		}
	}
	assert.ok(names.has("mcp"));
	assert.ok(names.has("listen"));
	assert.ok(names.has("chats bgm get"));
});
