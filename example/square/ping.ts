import {
	loginWithAuthToken,
	loginWithPassword,
	loginWithQR,
} from "@evex/linejs";
import { FileStorage } from "@evex/linejs/storage";

const client = await loginWithPassword({
	password: "",
	email: "",
	onPincodeRequest(pin) {
		console.log(pin);
	},
}, { device: "DESKTOPWIN", storage: new FileStorage("./storage.json") });

client.on("square:message", async (message) => {
	console.log(message.text);
	if (message.text === "!ping") {
		await message.react("NICE");
		await message.reply("pong!");
	}
});

client.listen({ square: true });
