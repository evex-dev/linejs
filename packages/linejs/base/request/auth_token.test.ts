import { assert, test } from "vite-plus/test";
import {
	createPrimaryAccessToken,
	isJwt,
	isPrimaryAccessToken,
	parseAuthTokenInput,
	resolveLineAccessToken,
	shouldUseLegyEncryptedAccess,
} from "./auth_token.ts";

test("auth token parser accepts V3 credential JSON", () => {
	const accessToken = jwt({ ver: "3.1", scp: "LINE_AUTH" });
	const refreshToken = jwt({ ver: "3.1", scp: "LINE_AUTH_REFRESH" });
	const parsed = parseAuthTokenInput(
		JSON.stringify({
			accessToken,
			refreshToken,
			expire: 123,
		}),
	);
	assert.deepEqual(parsed, { accessToken, refreshToken, expire: 123 });
});

test("auth token resolver strips aid prefix from JWT exports", () => {
	const accessToken = jwt({ ver: "3.1", scp: "LINE_AUTH" });
	assert.deepEqual(resolveLineAccessToken(`uc84fake:${accessToken}`), accessToken);
	assert.isOk(shouldUseLegyEncryptedAccess(accessToken));
	assert.isOk(isJwt(accessToken));
});

test("auth token resolver expands primary auth key", () => {
	const authKey = `u${"0".repeat(32)}:${btoa("secret")}`;
	const resolved = createPrimaryAccessToken(authKey, 1_700_000_000_000);
	assert.isOk(isPrimaryAccessToken(resolved));
	assert.match(resolved, /^u0{32}:.*\..*$/);
	assert.isOk(isPrimaryAccessToken(resolveLineAccessToken(authKey)));
	assert.isOk(shouldUseLegyEncryptedAccess(authKey));
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
