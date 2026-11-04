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
