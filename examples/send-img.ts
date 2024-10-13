import { Client } from "@evex/linejs";

const client = new Client();

await client.login({
    email: "YOUR_EMAIL",
    password: "YOUR_PASSWORD",
    polling: [], // no polling
});

await client.uploadObjTalk(
    "mid",
    "image",    // content type
    await fetch("https://avatars.githubusercontent.com/u/121654029").then(r => r.blob()),   // blob
    "i.png"     // file name
)
/*
Please make sure you set the mimeType to blob or the filename to the correct extension!
*/