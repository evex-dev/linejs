import { assertEquals } from "@std/assert";
import { registrationAuthEndpoint } from "./mod.ts";

Deno.test("registration auth endpoint uses v4 for Android devices", () => {
	assertEquals(registrationAuthEndpoint("ANDROID"), "/api/v4p/rs");
	assertEquals(registrationAuthEndpoint("ANDROIDSECONDARY"), "/api/v4p/rs");
});

Deno.test("registration auth endpoint keeps v3 for existing desktop and iOS logins", () => {
	assertEquals(registrationAuthEndpoint("DESKTOPWIN"), "/api/v3p/rs");
	assertEquals(registrationAuthEndpoint("DESKTOPMAC"), "/api/v3p/rs");
	assertEquals(registrationAuthEndpoint("IOS"), "/api/v3p/rs");
	assertEquals(registrationAuthEndpoint("IOSIPAD"), "/api/v3p/rs");
});
