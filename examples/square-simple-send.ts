import { Client } from "@evex/linejs";

const client = new Client();

await client.login({
	email: "YOUR_EMAIL",
	password: "YOUR_PASSWORD",
	polling: [], // no polling
});

await client.sendSquareMessage({
	to: "MID", // mid (squareChat m~)
	text: "Hello, world!",
});
