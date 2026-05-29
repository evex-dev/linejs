import { assert, assertEquals, assertMatch } from "@std/assert";
import {
	createPrimaryAccessToken,
	isJwt,
	isPrimaryAccessToken,
	parseAuthTokenInput,
	resolveLineAccessToken,
	shouldUseLegyEncryptedAccess,
} from "./auth_token.ts";

Deno.test("auth token parser accepts V3 credential JSON", () => {
	const accessToken = jwt({ ver: "3.1", scp: "LINE_AUTH" });
	const refreshToken = jwt({ ver: "3.1", scp: "LINE_AUTH_REFRESH" });
	const parsed = parseAuthTokenInput(JSON.stringify({
		accessToken,
		refreshToken,
		expire: 123,
	}));
	assertEquals(parsed, { accessToken, refreshToken, expire: 123 });
});

Deno.test("auth token resolver strips aid prefix from JWT exports", () => {
	const accessToken = jwt({ ver: "3.1", scp: "LINE_AUTH" });
	assertEquals(resolveLineAccessToken(`uc84fake:${accessToken}`), accessToken);
	assert(shouldUseLegyEncryptedAccess(accessToken));
	assert(isJwt(accessToken));
});

Deno.test("auth token resolver expands primary auth key", () => {
	const authKey = `u${"0".repeat(32)}:${btoa("secret")}`;
	const resolved = createPrimaryAccessToken(authKey, 1_700_000_000_000);
	assert(isPrimaryAccessToken(resolved));
	assertMatch(resolved, /^u0{32}:.*\..*$/);
	assert(isPrimaryAccessToken(resolveLineAccessToken(authKey)));
	assert(shouldUseLegyEncryptedAccess(authKey));
});

function jwt(payload: Record<string, unknown>): string {
	return [
		base64Url(JSON.stringify({ alg: "none", typ: "JWT" })),
		base64Url(JSON.stringify(payload)),
		"sig",
	].join(".");
}

function base64Url(value: string): string {
	return btoa(value).replace(/\+/g, "-").replace(/\//g, "_").replace(
		/=+$/g,
		"",
	);
}
