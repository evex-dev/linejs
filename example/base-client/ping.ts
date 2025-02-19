import { BaseClient } from "@evex/linejs/base";
import { FileStorage } from "@evex/linejs/storage";
import type * as LINETypes from "@evex/linejs-types";

const storage = new FileStorage("./storage.json");

const client = new BaseClient({
    device: "DESKTOPWIN",
    storage,
});

client.on("pincall", (pin) => {
    console.log("pincode:", pin);
});

client.on("qrcall", (qrUrl) => {
    console.log("qrcode:", qrUrl);
});

client.on("update:authtoken", async (authToken) => {
    await storage.set(".auth", authToken);
});

const authToken = await storage.get(".auth");
if (typeof authToken === "string") {
    await client.loginProcess.login({
        authToken,
    });
} else {
    await client.loginProcess.login({
        email: prompt("email: ") ?? "",
        password: prompt("password: ") ?? "",
    });
}

const polling = client.createPolling();

for await (const op of polling.listenTalkEvents()) {
    if (op.type === "RECEIVE_MESSAGE" || op.type === "SEND_MESSAGE") {
        const message = await client.e2ee.decryptE2EEMessage(op.message);
        if (message.text === "!ping") {
            await client.talk.sendMessage({
                to: message.to === client.profile?.mid
                    ? message.from
                    : message.to,
                text: "pong!",
                e2ee: !!op.message.chunks,
            });
        }
    }
}
