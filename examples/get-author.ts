import { Client } from "@evex/linejs";

const client = new Client();

client.on("message", async (message) => {
	const text = message.content;

	if (text === "!me") {
		await message.reply([
            `Name: ${message.author.displayName}`,
            `IconImage: ${message.author.iconImage}`,
            `Mid: ${message.author.mid}`,
        ].join("\n"));
	}
});

await client.login({
	email: "YOUR_EMAIL",
	password: "YOUR_PASSWORD",
});
