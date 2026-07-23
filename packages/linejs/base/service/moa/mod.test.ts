import { assertEquals } from "@std/assert";
import { buildMoaUrl } from "./mod.ts";

Deno.test("buildMoaUrl prepends LEGY host and /ext/album prefix", () => {
	assertEquals(
		buildMoaUrl("legy.line-apps.com", "/moa/v2/albums", {}),
		"https://legy.line-apps.com/ext/album/moa/v2/albums",
	);
});

Deno.test("buildMoaUrl encodes params and joins with ?", () => {
	assertEquals(
		buildMoaUrl("legy.line-apps.com", "/moa/v2/albums", {
			cursor: "",
			orderBy: "createTimeDesc",
			include: "",
		}),
		"https://legy.line-apps.com/ext/album/moa/v2/albums?cursor=&orderBy=createTimeDesc&include=",
	);
});

Deno.test("buildMoaUrl drops undefined values", () => {
	assertEquals(
		buildMoaUrl("legy.line-apps.com", "/api/v6/albums/42/photos", {
			cursor: "",
			pageSize: 100,
			filterType: "",
			targetUser: undefined,
		}),
		"https://legy.line-apps.com/ext/album/api/v6/albums/42/photos?cursor=&pageSize=100&filterType=",
	);
});

Deno.test("buildMoaUrl percent-encodes special chars in values", () => {
	assertEquals(
		buildMoaUrl("legy.line-apps.com", "/moa/v2/albums", {
			cursor: "abc/def=",
		}),
		"https://legy.line-apps.com/ext/album/moa/v2/albums?cursor=abc%2Fdef%3D",
	);
});

Deno.test("buildMoaUrl honours a custom endpoint", () => {
	assertEquals(
		buildMoaUrl("legy-proxy.example.com", "/moa/v2/albums", {}),
		"https://legy-proxy.example.com/ext/album/moa/v2/albums",
	);
});
