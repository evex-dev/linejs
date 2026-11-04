import { test } from "vite-plus/test";
import assert from "node:assert/strict";
import { join } from "node:path";
import { resolveProfileLocation } from "../src/paths.ts";

const cwd = "/tmp/linejs-test-cwd";

test("resolves named profiles under LINEJS_HOME", () => {
	const env = { LINEJS_HOME: "/tmp/linejs-home", HOME: "/home/tester" };
	assert.deepEqual(resolveProfileLocation(undefined, env, cwd), {
		path: join("/tmp/linejs-home", "default.json"),
		name: "default",
		home: "/tmp/linejs-home",
		explicitPath: false,
	});
	assert.equal(resolveProfileLocation("profile2", env, cwd).path, "/tmp/linejs-home/profile2.json");
	assert.equal(
		resolveProfileLocation("profile2.json", env, cwd).path,
		"/tmp/linejs-home/profile2.json",
	);
});

test("resolves explicit profile paths", () => {
	const env = { LINEJS_HOME: "/tmp/linejs-home" };
	assert.equal(
		resolveProfileLocation("./profiles/work.json", env, cwd).path,
		"/tmp/linejs-test-cwd/profiles/work.json",
	);
	assert.equal(resolveProfileLocation("/tmp/absolute.json", env, cwd).path, "/tmp/absolute.json");
	assert.equal(resolveProfileLocation("./profiles/work.json", env, cwd).explicitPath, true);
});

test("honours LINEJS_PROFILE and rejects invalid names", () => {
	const env = { LINEJS_HOME: "/tmp/linejs-home", LINEJS_PROFILE: "env-profile" };
	assert.equal(resolveProfileLocation(undefined, env, cwd).name, "env-profile");
	assert.throws(
		() => resolveProfileLocation("..", { LINEJS_HOME: "/tmp/home" }, cwd),
		/Invalid profile/,
	);
});
