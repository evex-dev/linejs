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

const chat = await client.getSquareChat("m..."); // your squareChat mid

chat.on("message", async (message) => {
	console.log(message.text);
	if (message.text === "!ping") {
		await message.react("NICE");
		await message.reply("pong!");
	}
});

chat.listen();
