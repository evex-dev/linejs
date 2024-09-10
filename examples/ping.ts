import { Client } from "@evex/linejs";

const client = new Client();

client.on("message", async (message) => {
	const text = message.content;

	if (text === "!ping") {
		await message.reply("pong!");
	}
});

await client.login({
	email: "YOUR_EMAIL",
	password: "YOUR_PASSWORD",
	polling: ["talk"], // polling talk only
});
