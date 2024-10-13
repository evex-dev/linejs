import { Client } from "@evex/linejs";

const client = new Client();

await client.login({
	email: "YOUR_EMAIL",
	password: "YOUR_PASSWORD",
	polling: [], // no polling
});

await client.sendMessage({
	to: "MID", // mid (group c~ ,user u~)
	text: "Hello, world!",
});
