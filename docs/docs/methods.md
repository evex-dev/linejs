# Methods

## Talk Methods

All the functions for TalkService are in `Client.base.talk`.

For example:

```js
await client.base.talk.sendMessage({
    to: "u...",
    text: "Hello, LINEJS!",
    e2ee: true,
});
```

This is an example of encrypting a text message with e2ee and sending it to a
user.

## Square Methods

All the functions for SquareService are in `Client.square`.

For example:

```js
await client.base.square.findSquareByInvitationTicket({
    request: {
        invitationTicket: "INVITATION_TICKET",
    },
});
```

This is an example of getting square from invitation code.

# BaseClient

If you just want simple api access or custom event handlers, you can use `BaseClient`.

For example:

```js
import { BaseClient } from "@evex/linejs/base";


const client = new BaseClient({ device: "DESKTOPWIN", version:"..." });
client.on("pincall", (pin) => {
});

client.on("qrcall", (qrUrl) => {
});

client.on("update:authtoken", (authToken) => {
});

await client.loginProcess.login({
	authToken: "...",
});

await client.loginProcess.login({
	email: "...",
	password: "...",
	pincode: "123456",
});

await client.loginProcess.login({
	qr: true,
});

client.square // = SquareService
client.talk // = TalkService


// event polling
const polling = client.createPolling();

for await (const operation of polling.listenTalkEvents()) {
}

for await (const event of polling.listenSquareEvents()) {
}
```