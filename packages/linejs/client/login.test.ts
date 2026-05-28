import { assertEquals, assertRejects } from "@std/assert";
import { loginWithAuthToken } from "./login.ts";

Deno.test("loginWithAuthToken passes version and endpoint to BaseClient", async () => {
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
	assertEquals(seen?.url, "https://example.invalid/S4");
	assertEquals(
		seen?.headers.get("x-line-application"),
		"ANDROID\t26.6.2\tAndroid OS\t16",
	);
});
