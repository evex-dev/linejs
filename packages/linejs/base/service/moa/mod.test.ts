import { assert, test } from "vite-plus/test";
import { assertRejects } from "../../../test/assert.ts";
import { BaseClient, InternalError } from "../../core/mod.ts";
import { buildMoaUrl, MOA_CHANNEL_ID, MoaService } from "./mod.ts";

test("buildMoaUrl prepends LEGY host and /ext/album prefix", () => {
	assert.deepEqual(
		buildMoaUrl("legy.line-apps.com", "/moa/v2/albums", {}),
		"https://legy.line-apps.com/ext/album/moa/v2/albums",
	);
});

test("buildMoaUrl encodes params and joins with ?", () => {
	assert.deepEqual(
		buildMoaUrl("legy.line-apps.com", "/moa/v2/albums", {
			cursor: "",
			orderBy: "createTimeDesc",
			include: "",
		}),
		"https://legy.line-apps.com/ext/album/moa/v2/albums?cursor=&orderBy=createTimeDesc&include=",
	);
});

test("buildMoaUrl drops undefined values", () => {
	assert.deepEqual(
		buildMoaUrl("legy.line-apps.com", "/api/v6/albums/42/photos", {
			cursor: "",
			pageSize: 100,
			filterType: "",
			targetUser: undefined,
		}),
		"https://legy.line-apps.com/ext/album/api/v6/albums/42/photos?cursor=&pageSize=100&filterType=",
	);
});

test("buildMoaUrl percent-encodes special chars in values", () => {
	assert.deepEqual(
		buildMoaUrl("legy.line-apps.com", "/moa/v2/albums", {
			cursor: "abc/def=",
		}),
		"https://legy.line-apps.com/ext/album/moa/v2/albums?cursor=abc%2Fdef%3D",
	);
});

test("buildMoaUrl honours a custom endpoint", () => {
	assert.deepEqual(
		buildMoaUrl("legy-proxy.example.com", "/moa/v2/albums", {}),
		"https://legy-proxy.example.com/ext/album/moa/v2/albums",
	);
});

function setup(
	respond: (request: Request) => Response | Promise<Response> = () =>
		Response.json({ code: 0, result: { albums: [] } }),
) {
	const requests: Request[] = [];
	const base = new BaseClient({
		device: "IOSIPAD",
		endpoint: "album.example.com",
		fetch: (request) => {
			requests.push(request);
			return respond(request);
		},
	});
	base.authToken = "access-token";
	base.profile = { mid: "u-self" } as NonNullable<BaseClient["profile"]>;
	let approvals = 0;
	base.channel.approveChannelAndIssueChannelToken = (options) => {
		assert.deepEqual(options?.channelId, MOA_CHANNEL_ID);
		approvals++;
		return Promise.resolve({ channelAccessToken: `channel-${approvals}` } as Awaited<
			ReturnType<typeof base.channel.approveChannelAndIssueChannelToken>
		>);
	};
	return { base, requests, approvals: () => approvals };
}

test("Moa registers on BaseClient and sends JSON through LEGY", async () => {
	const { base, requests } = setup();
	assert.isOk(base.moa instanceof MoaService);
	assert.deepEqual(await base.moa.getAlbums({ cursor: "a/b=" }), {
		code: 0,
		result: { albums: [] },
	});
	const request = requests[0];
	assert.deepEqual(
		request.url,
		"https://album.example.com/ext/album/moa/v2/albums?cursor=a%2Fb%3D&orderBy=createTimeDesc&include=",
	);
	assert.deepEqual(request.method, "POST");
	for (const [key, value] of Object.entries({
		"x-lhm": "GET",
		accept: "application/json",
		"content-type": "application/json; charset=UTF-8",
		"x-line-access": "access-token",
		"x-line-channeltoken": "channel-1",
		"x-line-mid": "u-self",
	})) {
		assert.deepEqual(request.headers.get(key), value);
	}
	assert.deepEqual((await request.arrayBuffer()).byteLength, 0);
});

test("Moa coalesces channel approvals and resets on session changes or explicit clear", async () => {
	const { base, approvals } = setup();
	assert.deepEqual(
		await Promise.all([base.moa.getAlbumChannelToken(), base.moa.getAlbumChannelToken()]),
		["channel-1", "channel-1"],
	);
	assert.deepEqual(approvals(), 1);
	base.moa.clearAlbumChannelToken();
	assert.deepEqual(await base.moa.getAlbumChannelToken(), "channel-2");
	base.authToken = "rotated";
	assert.deepEqual(await base.moa.getAlbumChannelToken(), "channel-3");
	base.profile!.mid = "u-other";
	assert.deepEqual(await base.moa.getAlbumChannelToken(), "channel-4");
});

test("Moa does not retain a rejected or missing channel token", async () => {
	const { base, requests } = setup();
	const approve = base.channel.approveChannelAndIssueChannelToken;
	base.channel.approveChannelAndIssueChannelToken = () =>
		Promise.reject(new Error("approval failed"));
	await assertRejects(() => base.moa.getAlbums(), Error, "approval failed");
	base.channel.approveChannelAndIssueChannelToken = () =>
		Promise.resolve({} as Awaited<ReturnType<typeof approve>>);
	await assertRejects(() => base.moa.getAlbums(), InternalError, "channelAccessToken missing");
	assert.deepEqual(requests.length, 0);
	base.channel.approveChannelAndIssueChannelToken = approve;
	await base.moa.getAlbums();
});

test("Moa requires login before channel approval or downloads", async () => {
	const { base, requests, approvals } = setup();
	base.authToken = undefined;
	await assertRejects(() => base.moa.getAlbums(), InternalError, "login");
	await assertRejects(
		() => base.moa.downloadPhoto({ chatId: "c-chat", albumId: "1", oid: "photo" }),
		InternalError,
		"login",
	);
	assert.deepEqual(approvals(), 0);
	assert.deepEqual(requests.length, 0);
});

test("Moa photo listing encodes IDs and preserves chat and self MID headers", async () => {
	const { base, requests } = setup(() =>
		Response.json({ code: 0, result: { photos: [], nextCursor: "next" } }),
	);
	await base.moa.getPhotos({
		chatId: "c-chat",
		albumId: "a/b?",
		targetUser: "u-target",
		pageSize: 25,
	});
	const request = requests[0];
	assert.deepEqual(new URL(request.url).pathname, "/ext/album/api/v6/albums/a%2Fb%3F/photos");
	assert.deepEqual(new URL(request.url).searchParams.get("pageSize"), "25");
	assert.deepEqual(new URL(request.url).searchParams.get("targetUser"), "u-target");
	assert.deepEqual(request.headers.get("x-line-mid"), "u-self");
	assert.deepEqual(request.headers.get("x-line-chat-id"), "c-chat");
});

for (const prefix of ["album/a", "album/v"] as const) {
	test(`Moa downloads ${prefix} bytes with OBS headers`, async () => {
		const bytes = new Uint8Array([0, 255, 42, 128]);
		const { base, requests } = setup(() => new Response(bytes));
		assert.deepEqual(
			await base.moa.downloadPhoto({
				chatId: "c-chat",
				albumId: "123",
				oid: "photo/?#",
				prefix,
			}),
			bytes,
		);
		const request = requests[0];
		assert.deepEqual(request.url, `https://album.example.com/oa/r/${prefix}/photo%2F%3F%23`);
		assert.deepEqual(request.headers.get("x-line-mid"), "c-chat");
		assert.deepEqual(request.headers.get("x-line-album"), "123");
		assert.deepEqual(request.headers.get("x-line-channeltoken"), "channel-1");
		assert.deepEqual(request.headers.get("x-lhm"), "GET");
		assert.deepEqual(request.method, "POST");
	});
}

for (const [name, response, message] of [
	["HTTP failure", () => new Response("unavailable", { status: 503 }), "HTTP 503"],
	["application failure", () => Response.json({ code: 102001, message: "error" }), "code=102001"],
	["invalid JSON", () => new Response("not json"), "invalid JSON"],
	["null JSON", () => Response.json(null), "invalid response object"],
	["array JSON", () => Response.json([]), "invalid response object"],
] as const) {
	test(`Moa reports ${name} as MoaError`, async () => {
		const { base } = setup(response);
		const error = await assertRejects(() => base.moa.getAlbums(), InternalError, message);
		assert.deepEqual(error.type, "MoaError");
	});
}

test("Moa reports download HTTP errors", async () => {
	const { base } = setup(() => new Response(null, { status: 403 }));
	await assertRejects(
		() => base.moa.downloadPhoto({ chatId: "c-chat", albumId: 1, oid: "photo" }),
		InternalError,
		"HTTP 403",
	);
});

test("Moa rejects path traversal IDs and unsupported prefixes before fetch", async () => {
	const { base, requests } = setup();
	assert.throws(() => base.moa.getPhotos({ chatId: "c", albumId: ".." }), InternalError);
	await assertRejects(
		() => base.moa.downloadPhoto({ chatId: "c", albumId: 1, oid: ".." }),
		InternalError,
	);
	await assertRejects(
		() =>
			base.moa.downloadPhoto({
				chatId: "c",
				albumId: 1,
				oid: "photo",
				prefix: "../other" as "album/a",
			}),
		InternalError,
	);
	assert.deepEqual(requests.length, 0);
});

for (const download of [false, true]) {
	test(`Moa times out ${download ? "downloads" : "JSON requests"}`, async () => {
		const { base } = setup(
			(request) =>
				new Promise((_resolve, reject) => {
					if (request.signal.aborted) reject(request.signal.reason);
					else {
						request.signal.addEventListener("abort", () => reject(request.signal.reason), {
							once: true,
						});
					}
				}),
		);
		base.config.timeout = 5;
		await assertRejects(
			() =>
				download
					? base.moa.downloadPhoto({ chatId: "c", albumId: 1, oid: "photo" })
					: base.moa.getAlbums(),
			DOMException,
		);
	});
}
