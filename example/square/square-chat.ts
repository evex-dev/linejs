import { Client } from "@evex/linejs";
import { FileStorage } from "@evex/linejs/storage";

const client = new Client({
	device: "IOSIPAD",
	storage: new FileStorage("storage.json"),
});

client.on("log", (d) => {
	try {
		// console.log(d.type, d.data); // for debug
	} catch {}
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

const chat = await client.getSquareChat("m..."); // your squareChatMid

chat.on("message", async (message) => {
	await message.react("NICE");
});

chat.polling();
