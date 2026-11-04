import { test } from "vite-plus/test";
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { runCli } from "../src/cli.ts";
import { ProfileStore } from "../src/profile-store.ts";

function capture() {
	const stdout: string[] = [];
	const stderr: string[] = [];
	return {
		stdout,
		stderr,
		options: {
			stdout: (chunk: string) => stdout.push(chunk),
			stderr: (chunk: string) => stderr.push(chunk),
			interactive: false,
			color: false,
			handleSignals: false,
			env: { ...process.env, LINEJS_HOME: "/tmp/linejs-cli-test-home" },
			cwd: "/tmp/linejs-cli-test-cwd",
		},
	};
}

test("line commands --json lists commands as JSON", async () => {
	const output = capture();
	const result = await runCli(["commands", "--json"], output.options);
	assert.equal(result.exitCode, 0);
	const parsed = JSON.parse(output.stdout.join(""));
	assert.ok(parsed.commandCount > 30);
	const names = parsed.commands.map((command: { name: string }) => command.name);
	assert.ok(names.includes("auth login"));
	assert.ok(names.includes("chats send"));
	assert.ok(names.includes("square chat-send"));
	assert.ok(names.includes("api call"));
	assert.ok(names.includes("mcp"));
});

test("unknown commands fail with exit code 2 and a suggestion", async () => {
	const output = capture();
	const result = await runCli(["chat", "lsit"], output.options);
	assert.equal(result.exitCode, 2);
	assert.match(output.stderr.join(""), /Unknown command/);
});

test("help shows command usage", async () => {
	const output = capture();
	const result = await runCli(["help", "chats", "send"], output.options);
	assert.equal(result.exitCode, 0);
	assert.match(output.stdout.join(""), /line chats send/);
	assert.match(output.stdout.join(""), /--reply-to/);
	assert.match(output.stdout.join(""), /--check-session/);
});

test("version and JSON errors work without a profile", async () => {
	const version = capture();
	assert.equal((await runCli(["--version"], version.options)).exitCode, 0);
	assert.match(version.stdout.join(""), /^\d+\.\d+\.\d+\n$/);

	const failure = capture();
	const result = await runCli(
		["auth", "status", "--profile", "./missing.json", "--json"],
		failure.options,
	);
	assert.equal(result.exitCode, 1);
	const parsed = JSON.parse(failure.stderr.join(""));
	assert.equal(parsed.error.code, "PROFILE_NOT_FOUND");
});

test("commands can be enumerated by category", async () => {
	const output = capture();
	const result = await runCli(
		["commands", "--category", "Authentication", "--json"],
		output.options,
	);
	assert.equal(result.exitCode, 0);
	const parsed = JSON.parse(output.stdout.join(""));
	assert.ok(
		parsed.commands.every((command: { category: string }) => command.category === "Authentication"),
	);
});

test("non-auth commands reuse the cached profile without getProfile", async () => {
	const dir = await mkdtemp(join(tmpdir(), "linejs-cli-cache-"));
	try {
		const path = join(dir, "default.json");
		const store = await ProfileStore.open(path, { create: true });
		await store.setAuthToken("fake-token-without-network");
		await store.setCachedProfile({
			mid: "ucached",
			displayName: "Cached User",
			statusMessage: "offline",
		});
		await store.flush();

		const stdout: string[] = [];
		const stderr: string[] = [];
		const result = await runCli(["profile", "get", "--profile", path, "--json"], {
			stdout: (chunk) => stdout.push(chunk),
			stderr: (chunk) => stderr.push(chunk),
			interactive: false,
			color: false,
			handleSignals: false,
			env: { ...process.env, LINEJS_HOME: dir },
			cwd: dir,
		});
		assert.equal(result.exitCode, 0, stderr.join(""));
		const profile = JSON.parse(stdout.join(""));
		assert.equal(profile.mid, "ucached");
		assert.equal(profile.displayName, "Cached User");
	} finally {
		await rm(dir, { recursive: true, force: true });
	}
});
