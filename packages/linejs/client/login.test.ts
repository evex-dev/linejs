import { assert, test } from "vite-plus/test";
import { assertRejects } from "../test/assert.ts";
import { loginWithAuthToken } from "./login.ts";
import { MemoryStorage } from "../base/storage/mod.ts";

test("loginWithAuthToken passes version and endpoint to BaseClient", async () => {
	let seen: Request | undefined;
	await assertRejects(
		() =>
			loginWithAuthToken("token", {
				device: "ANDROID",
				version: "26.6.2",
				endpoint: "example.invalid",
				fetch: (request) => {
					seen = request;
					throw new Error("stop before network");
				},
			}),
		Error,
		"stop before network",
	);
	assert.deepEqual(seen?.url, "https://example.invalid/S4");
	assert.deepEqual(seen?.headers.get("x-line-application"), "ANDROID\t26.6.2\tAndroid OS\t16");
});

test("loginWithAuthToken accepts V3 credentials and uses encrypted LEGY", async () => {
	let seen: Request | undefined;
	const storage = new MemoryStorage();
	const accessToken = jwt({ ver: "3.1", scp: "LINE_AUTH" });
	const refreshToken = jwt({ ver: "3.1", scp: "LINE_AUTH_REFRESH" });

	await assertRejects(
		() =>
			loginWithAuthToken(JSON.stringify({ accessToken, refreshToken }), {
				device: "ANDROID",
				version: "26.6.2",
				storage,
				fetch: (request) => {
					seen = request;
					throw new Error("stop before network");
				},
			}),
		Error,
		"stop before network",
	);

	assert.deepEqual(seen?.url, "https://gf.line.naver.jp/enc");
	assert.deepEqual(seen?.headers.get("x-line-access"), null);
	assert.deepEqual(seen?.headers.get("x-le"), "7");
	assert.deepEqual(seen?.headers.get("x-lap"), "5");
	assert.deepEqual(seen?.headers.get("x-lcs")?.startsWith("0008"), true);
	assert.deepEqual(await storage.get("refreshToken"), refreshToken);
});

function jwt(payload: Record<string, unknown>): string {
	return [
		base64Url(JSON.stringify({ alg: "none", typ: "JWT" })),
		base64Url(JSON.stringify(payload)),
		"sig",
	].join(".");
}

function base64Url(value: string): string {
	return btoa(value).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}
