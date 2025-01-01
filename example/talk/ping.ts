import { Client } from "../../packages/linejs/base/mod.ts";
import { FileStorage } from "../../packages/linejs/base/storage/mod.ts";

const client = new Client({
	device: "IOSIPAD",
	storage: new FileStorage("storage.json"),
});

client.on("log", (d) => {
	try {
		// console.log(d.type, d.data); // for debug
	} catch {}
});
client.on("message", async (message) => {
	console.log(message.text);
	if (message.text === "!ping") {
		await message.react("NICE");
		await message.reply("pong!");
	}
});
client.on("pincall", (p) => console.log("enter pincode:", p));
client.on("qrcall", (q) => console.log("qrcode:", q));
client.on("update:authtoken", (a) => console.log("AuthToken:", a));
client.on("ready", (user) => {
	console.log(`Logged in as ${user.displayName} (${user.mid})`);
});

await client.login({
	email: "email",
	password: "pass",
});

client.listen(["talk"]); // polling talk
