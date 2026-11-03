import { readFile } from "node:fs/promises";
import { BaseClient } from "@evex-dev/linejs/base";

const client = new BaseClient({
	device: "DESKTOPWIN",
});

const b = new Blob([await readFile("./image.png")]);

await client.obs.uploadMediaByE2EE({
	data: b,
	to: "u",
	oType: "image",
	filename: "image.png",
});