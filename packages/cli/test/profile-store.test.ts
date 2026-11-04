import { test } from "vite-plus/test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { ProfileStore, listProfiles } from "../src/profile-store.ts";
import { ProfileStorage } from "../src/profile-storage.ts";

async function tempPath(): Promise<{ dir: string; path: string }> {
	const dir = await mkdtemp(join(tmpdir(), "linejs-cli-test-"));
	return { dir, path: join(dir, "default.json") };
}

test("creates, saves, reloads, and deletes a profile", async () => {
	const { dir, path } = await tempPath();
	try {
		const store = await ProfileStore.open(path, { create: true, name: "default" });
		await store.setAuthToken("token-value");
		await store.setStorage("reqseq", '{"talk":3}');
		await store.setAccount({ mid: "u123", displayName: "Tester" });
		await store.setCachedProfile(
			{ mid: "u123", displayName: "Tester", statusMessage: "Hello" },
			{ mid: "u123", displayName: "Tester" },
		);
		await store.flush();

		const reloaded = await ProfileStore.open(path);
		assert.equal(reloaded.authToken, "token-value");
		assert.equal(reloaded.getStorage("reqseq"), '{"talk":3}');
		assert.equal(reloaded.summary().mid, "u123");
		assert.equal(reloaded.summary().profileCached, true);
		assert.equal(reloaded.data.profile?.statusMessage, "Hello");
		const text = await readFile(path, "utf8");
		assert.match(text, /"authToken": "token-value"/);
		if (process.platform !== "win32") {
			assert.equal((await stat(path)).mode & 0o777, 0o600);
		}

		await reloaded.delete();
		await assert.rejects(ProfileStore.open(path), /Profile not found/);
	} finally {
		await rm(dir, { recursive: true, force: true });
	}
});

test("ProfileStorage delegates to the profile file", async () => {
	const { dir, path } = await tempPath();
	try {
		const store = await ProfileStore.open(path, { create: true });
		const storage = new ProfileStorage(store);
		await storage.set("key", "value");
		assert.equal(await storage.get("key"), "value");
		await storage.delete("key");
		assert.equal(await storage.get("key"), undefined);
		assert.equal(store.getStorage("key"), undefined);
	} finally {
		await rm(dir, { recursive: true, force: true });
	}
});

test("lists profiles and reports malformed files", async () => {
	const dir = await mkdtemp(join(tmpdir(), "linejs-cli-list-"));
	try {
		const good = await ProfileStore.open(join(dir, "good.json"), { create: true, name: "good" });
		await good.setAuthToken("token");
		await good.flush();
		const { profiles } = await listProfiles({ LINEJS_HOME: dir } as NodeJS.ProcessEnv);
		assert.equal(profiles.length, 1);
		assert.equal(profiles[0]?.name, "good");
		assert.equal(profiles[0]?.authToken, true);
	} finally {
		await rm(dir, { recursive: true, force: true });
	}
});
