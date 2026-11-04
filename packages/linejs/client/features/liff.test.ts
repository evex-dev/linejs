import { assert, test } from "vite-plus/test";
import { flex, image, sticker, text } from "./liff.ts";

test("liff.text — plain", () => {
	assert.deepEqual(text("hi"), { type: "text", text: "hi" });
});

test("liff.text — with sentBy", () => {
	const m = text("hi", {
		label: "Bot",
		iconUrl: "https://example.test/icon.png",
		linkUrl: "https://example.test",
	});
	assert.deepEqual(m, {
		type: "text",
		text: "hi",
		sentBy: {
			label: "Bot",
			iconUrl: "https://example.test/icon.png",
			linkUrl: "https://example.test",
		},
	});
});

test("liff.sticker", () => {
	assert.deepEqual(sticker("11537", "52002734"), {
		type: "sticker",
		packageId: "11537",
		stickerId: "52002734",
	});
});

test("liff.image — preview defaults to original", () => {
	const m = image("https://example.test/a.jpg");
	assert.deepEqual(m, {
		type: "image",
		originalContentUrl: "https://example.test/a.jpg",
		previewImageUrl: "https://example.test/a.jpg",
	});
});

test("liff.image — explicit preview", () => {
	const m = image("https://example.test/orig.jpg", "https://example.test/thumb.jpg");
	assert.deepEqual(m.previewImageUrl, "https://example.test/thumb.jpg");
});

test("liff.flex — passes contents through", () => {
	const contents = { type: "bubble", body: { type: "box", layout: "vertical" } };
	const m = flex("alt", contents);
	assert.deepEqual(m.type, "flex");
	assert.deepEqual(m.altText, "alt");
	assert.deepEqual(m.contents, contents);
});
