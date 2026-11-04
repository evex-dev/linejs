import { assert, test } from "vite-plus/test";
import { registrationAuthEndpoint } from "./mod.ts";

test("registration auth endpoint uses v4 for Android devices", () => {
	assert.deepEqual(registrationAuthEndpoint("ANDROID"), "/api/v4p/rs");
	assert.deepEqual(registrationAuthEndpoint("ANDROIDSECONDARY"), "/api/v4p/rs");
});

test("registration auth endpoint keeps v3 for existing desktop and iOS logins", () => {
	assert.deepEqual(registrationAuthEndpoint("DESKTOPWIN"), "/api/v3p/rs");
	assert.deepEqual(registrationAuthEndpoint("DESKTOPMAC"), "/api/v3p/rs");
	assert.deepEqual(registrationAuthEndpoint("IOS"), "/api/v3p/rs");
	assert.deepEqual(registrationAuthEndpoint("IOSIPAD"), "/api/v3p/rs");
});

test("ready({ skipCheck: true }) keeps the cached profile without getProfile", async () => {
	const { Login } = await import("./mod.ts");
	const cached = { mid: "ucached", displayName: "Cached" };
	let fetched = false;
	let emitted: unknown;
	const client = {
		authToken: "token",
		profile: cached,
		talk: {
			getProfile: async () => {
				fetched = true;
				return { mid: "userver" } as never;
			},
		},
		emit: (_event: string, value: unknown) => {
			emitted = value;
		},
	} as unknown as import("../core/mod.ts").BaseClient;
	const login = new Login(client);
	await login.ready({ skipCheck: true });
	assert.equal(fetched, false);
	assert.equal(client.profile, cached);
	assert.equal(emitted, cached);
});

test("ready() checks getProfile by default", async () => {
	const { Login } = await import("./mod.ts");
	let fetched = false;
	const client = {
		authToken: "token",
		talk: {
			getProfile: async () => {
				fetched = true;
				return { mid: "userver" } as never;
			},
		},
		emit: () => {},
	} as unknown as import("../core/mod.ts").BaseClient;
	const login = new Login(client);
	await login.ready();
	assert.equal(fetched, true);
	assert.equal((client.profile as unknown as { mid: string }).mid, "userver");
});
