import { assert, assertEquals } from "@std/assert";
import { createVoomClient, VoomChannelId } from "./voom.ts";

function makeFake() {
	const issued: string[] = [];
	const fetched: { url: string; headers: Record<string, string> }[] = [];
	const fakeClient = {
		base: {
			profile: { mid: "u-test-mid" },
			request: {
				systemType: "ANDROID\t26.6.2",
				userAgent: "Line/26.6.2",
			},
			channel: {
				issueChannelToken(opts: { channelId: string }) {
					issued.push(opts.channelId);
					return Promise.resolve({ token: `tok-${opts.channelId}` });
				},
			},
			fetch(url: string, init: { headers: Record<string, string> }) {
				fetched.push({ url, headers: { ...init.headers } });
				return Promise.resolve(
					new Response(JSON.stringify({ code: 200, result: { fake: true } }), {
						headers: { "content-type": "application/json" },
					}),
				);
			},
		},
		authToken: "primary-token",
	};
	return {
		client: fakeClient as never,
		issued,
		fetched,
	};
}

Deno.test("VoomClient.getToken — mints via issueChannelToken with object arg", async () => {
	const { client, issued } = makeFake();
	const vc = createVoomClient(client);
	const t = await vc.getToken("TIMELINE");
	assertEquals(t, "tok-1341209950");
	assertEquals(issued, [VoomChannelId.TIMELINE]);
});

Deno.test("VoomClient.getToken — caches per-channel", async () => {
	const { client, issued } = makeFake();
	const vc = createVoomClient(client);
	await vc.getToken("TIMELINE");
	await vc.getToken("TIMELINE");
	await vc.getToken("NOTE");
	assertEquals(issued.length, 2);
	assertEquals(issued, [VoomChannelId.TIMELINE, VoomChannelId.NOTE]);
});

Deno.test("VoomClient.call — Bearer + X-Line-Mid headers", async () => {
	const { client, fetched } = makeFake();
	const vc = createVoomClient(client);
	const r = await vc.call("TIMELINE", { path: "/api/v57/post/list.json" });
	assertEquals(r.code, 200);
	assert(r.result);
	assertEquals(fetched.length, 1);
	assertEquals(fetched[0].url, "https://gw.line.naver.jp/mh/api/v57/post/list.json");
	assertEquals(fetched[0].headers["authorization"], "Bearer tok-1341209950");
	assertEquals(fetched[0].headers["X-Line-Mid"], "u-test-mid");
});

Deno.test("VoomClient.feed — default postLimit/followingMaxPage", async () => {
	const { client, fetched } = makeFake();
	const vc = createVoomClient(client);
	await vc.feed();
	const u = new URL(fetched[0].url);
	assertEquals(u.pathname, "/mh/api/v57/post/list.json");
	assertEquals(u.searchParams.get("postLimit"), "10");
	assertEquals(u.searchParams.get("followingMaxPage"), "2");
});

Deno.test("VoomClient.feed — custom limits", async () => {
	const { client, fetched } = makeFake();
	const vc = createVoomClient(client);
	await vc.feed({ postLimit: 25, followingMaxPage: 5 });
	const u = new URL(fetched[0].url);
	assertEquals(u.searchParams.get("postLimit"), "25");
	assertEquals(u.searchParams.get("followingMaxPage"), "5");
});

Deno.test("VoomClient.noteList — uses NOTE channel + bdb/card/list endpoint (#150)", async () => {
	const { client, fetched, issued } = makeFake();
	const vc = createVoomClient(client);
	await vc.noteList({ boardId: "BD-1", limit: 50 });
	assertEquals(issued, [VoomChannelId.NOTE]);
	const u = new URL(fetched[0].url);
	assertEquals(u.pathname, "/mh/api/v1/bdb/card/list");
	assertEquals(u.searchParams.get("boardId"), "BD-1");
	assertEquals(u.searchParams.get("limit"), "50");
	assertEquals(fetched[0].headers["authorization"], `Bearer tok-${VoomChannelId.NOTE}`);
});

Deno.test("VoomClient.noteCreate — POSTs to bdb/card/create with boardId in body (#150)", async () => {
	const { client, fetched } = makeFake();
	const vc = createVoomClient(client);
	await vc.noteCreate({
		boardId: "BD-1",
		body: { text: "hello", attachments: [] },
	});
	const u = new URL(fetched[0].url);
	assertEquals(u.pathname, "/mh/api/v1/bdb/card/create");
});

Deno.test("VoomClient.noteLike / noteUnlike — POSTs with cardId (#150)", async () => {
	const { client, fetched } = makeFake();
	const vc = createVoomClient(client);
	await vc.noteLike({ cardId: "CARD-1" });
	await vc.noteUnlike({ cardId: "CARD-1" });
	assertEquals(new URL(fetched[0].url).pathname, "/mh/api/v1/bdb/card/like/create");
	assertEquals(new URL(fetched[1].url).pathname, "/mh/api/v1/bdb/card/like/cancel");
});
