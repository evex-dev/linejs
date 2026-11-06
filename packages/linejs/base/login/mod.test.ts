import { assert, test } from "vite-plus/test";
import { Buffer } from "node:buffer";
import { Login, registrationAuthEndpoint, registrationAuthProtocol } from "./mod.ts";
import type { Device } from "../core/utils/devices.ts";

function makeRegistrationClient(device: Device) {
	const calls: { methodName: string; protocol: number; path: string }[] = [];
	const client = {
		device,
		request: {
			request: (
				_value: unknown,
				methodName: string,
				protocol: number,
				_parse: unknown,
				path: string,
			) => {
				calls.push({ methodName, protocol, path });
				return Promise.resolve({});
			},
		},
	} as unknown as import("../core/mod.ts").BaseClient;
	return { calls, login: new Login(client) };
}

function callLoginV2(login: Login, device: Device) {
	return (login as unknown as { loginV2: (...args: unknown[]) => Promise<unknown> }).loginV2(
		"keynm",
		"encrypted",
		device,
		undefined,
		undefined,
		undefined,
		"loginV2",
	);
}

test("registration auth protocol is compact on /api/v4p/rs and binary on /api/v3p/rs", () => {
	assert.deepEqual(registrationAuthProtocol("ANDROID"), 4);
	assert.deepEqual(registrationAuthProtocol("ANDROIDSECONDARY"), 4);
	assert.deepEqual(registrationAuthProtocol("DESKTOPWIN"), 3);
	assert.deepEqual(registrationAuthProtocol("DESKTOPMAC"), 3);
	assert.deepEqual(registrationAuthProtocol("IOS"), 3);
	assert.deepEqual(registrationAuthProtocol("IOSIPAD"), 3);
});

for (const [device, path, protocol] of [
	["ANDROID", "/api/v4p/rs", 4],
	["ANDROIDSECONDARY", "/api/v4p/rs", 4],
	["DESKTOPWIN", "/api/v3p/rs", 3],
	["IOS", "/api/v3p/rs", 3],
] as const) {
	test(`registration auth calls on ${device} use ${path} with protocol ${protocol}`, async () => {
		const { calls, login } = makeRegistrationClient(device);
		await callLoginV2(login, device);
		await login.confirmE2EELogin("verifier", Buffer.from("secret"));
		assert.deepEqual(calls, [
			{ methodName: "loginV2", protocol, path },
			{ methodName: "confirmE2EELogin", protocol, path },
		]);
	});
}

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
