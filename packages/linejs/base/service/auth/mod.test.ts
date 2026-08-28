import { assertEquals } from "@std/assert";
import { AuthService } from "./mod.ts";

function makeStubClient(rotated: boolean) {
	const store = new Map<string, string>([
		["refreshToken", "rt-old"],
	]);
	return {
		store,
		client: {
			authToken: "authtoken",
			emit() {},
			storage: {
				get(k: string) {
					return Promise.resolve(store.get(k) ?? null);
				},
				set(k: string, v: string) {
					store.set(k, v);
					return Promise.resolve();
				},
			},
			request: {
				request() {
					return Promise.resolve({
						accessToken: "at-new",
						tokenIssueTimeEpochSec: 1000,
						durationUntilRefreshInSec: 3600,
						...(rotated ? { refreshToken: "rt-new" } : {}),
					});
				},
			},
		},
	};
}

// RefreshAccessTokenResponse carries a `refreshToken` field because the
// server may rotate it. Dropping it meant the next refresh reused the stale
// token and failed.
Deno.test("tryRefreshToken persists a rotated refreshToken", async () => {
	const stub = makeStubClient(true);
	const auth = new AuthService(stub.client as never);

	await auth.tryRefreshToken();

	assertEquals(stub.store.get("refreshToken"), "rt-new");
	assertEquals(String(stub.store.get("expire")), "4600");
});

Deno.test("tryRefreshToken keeps the stored refreshToken when not rotated", async () => {
	const stub = makeStubClient(false);
	const auth = new AuthService(stub.client as never);

	await auth.tryRefreshToken();

	assertEquals(stub.store.get("refreshToken"), "rt-old");
});
