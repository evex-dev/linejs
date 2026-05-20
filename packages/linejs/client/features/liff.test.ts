import { assertEquals } from "@std/assert";
import { flex, image, sticker, text } from "./liff.ts";

Deno.test("liff.text — plain", () => {
	assertEquals(text("hi"), { type: "text", text: "hi" });
});

Deno.test("liff.text — with sentBy", () => {
	const m = text("hi", {
		label: "Bot",
		iconUrl: "https://example.test/icon.png",
		linkUrl: "https://example.test",
	});
	assertEquals(m, {
		type: "text",
		text: "hi",
		sentBy: {
			label: "Bot",
			iconUrl: "https://example.test/icon.png",
			linkUrl: "https://example.test",
		},
	});
});

Deno.test("liff.sticker", () => {
	assertEquals(sticker("11537", "52002734"), {
		type: "sticker",
		packageId: "11537",
		stickerId: "52002734",
	});
});

Deno.test("liff.image — preview defaults to original", () => {
	const m = image("https://example.test/a.jpg");
	assertEquals(m, {
		type: "image",
		originalContentUrl: "https://example.test/a.jpg",
		previewImageUrl: "https://example.test/a.jpg",
	});
});

Deno.test("liff.image — explicit preview", () => {
	const m = image("https://example.test/orig.jpg", "https://example.test/thumb.jpg");
	assertEquals(m.previewImageUrl, "https://example.test/thumb.jpg");
});

Deno.test("liff.flex — passes contents through", () => {
	const contents = { type: "bubble", body: { type: "box", layout: "vertical" } };
	const m = flex("alt", contents);
	assertEquals(m.type, "flex");
	assertEquals(m.altText, "alt");
	assertEquals(m.contents, contents);
});
