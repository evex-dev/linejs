import { BaseClient } from "@evex/linejs/base";

const client = new BaseClient({
	device: "DESKTOPWIN",
});

const b = new Blob([await Deno.readFile("./image.png")]);

await client.obs.uploadMediaByE2EE({
	data: b,
	to: "u",
	oType: "image",
	filename: "image.png",
});