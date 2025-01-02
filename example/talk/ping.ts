import { loginWithPassword } from "@evex/linejs";

const client = await loginWithPassword({
	email: "example@example.com",
	password: "passw0rd",
	pincode: "123456",
	onPincodeRequest(pin) {
		console.log("Enter PIN:", pin);
	},
}, {
	device: "ANDROID",
});

for await (const event of client.listen()) {
	if (event.type === "message") {
		// Handle Message
		const message = event.message; // Get message
		if (message.text === "!ping") {
			message.reply("pong!");
		}
	}
}
