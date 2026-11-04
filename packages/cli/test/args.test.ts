import { test } from "vite-plus/test";
import assert from "node:assert/strict";
import { parseOptions, splitLeadingGlobalOptions, type OptionSpec } from "../src/args.ts";
import { UsageError } from "../src/errors.ts";

const specs: OptionSpec[] = [
	{ name: "json", type: "boolean", description: "" },
	{ name: "profile", type: "string", valueName: "name", description: "" },
	{ name: "count", short: "n", type: "number", description: "" },
	{ name: "kind", type: "array", description: "" },
	{ name: "yes", type: "boolean", description: "" },
];

test("parses long, short, negated, repeated, and attached options", () => {
	const parsed = parseOptions(
		[
			"--json",
			"--profile=work",
			"-n",
			"3",
			"--kind",
			"a,b",
			"--kind",
			"c",
			"--no-yes",
			"chat",
			"--",
			"--not-an-option",
		],
		specs,
	);
	assert.equal(parsed.options.json, true);
	assert.equal(parsed.options.profile, "work");
	assert.equal(parsed.options.count, 3);
	assert.deepEqual(parsed.options.kind, ["a", "b", "c"]);
	assert.equal(parsed.options.yes, false);
	assert.deepEqual(parsed.positionals, ["chat", "--not-an-option"]);
});

test("rejects unknown options and missing values", () => {
	assert.throws(() => parseOptions(["--nope"], specs), UsageError);
	assert.throws(() => parseOptions(["--profile"], specs), /Missing value/);
	assert.throws(() => parseOptions(["-x"], specs), /Unknown option/);
});

test("accepts negative numbers as option values", () => {
	const parsed = parseOptions(["--count", "-5"], specs);
	assert.equal(parsed.options.count, -5);
});

test("splits leading global options from the command", () => {
	const { leading, rest } = splitLeadingGlobalOptions([
		"--profile",
		"work",
		"--json",
		"chats",
		"list",
	]);
	assert.deepEqual(leading, ["--profile", "work", "--json"]);
	assert.deepEqual(rest, ["chats", "list"]);
	assert.throws(() => splitLeadingGlobalOptions(["--nope", "chats"]), UsageError);
});
