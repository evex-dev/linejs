# Methods

## Talk Methods

All low-level TalkService methods are available on `client.base.talk`.

For example:

```ts
await client.base.talk.sendMessage({
    to: "u...",
    text: "Hello, LINEJS!",
    e2ee: true,
});
```

This is an example of encrypting a text message with e2ee and sending it to a
user.

## Square Methods

All low-level SquareService methods are available on `client.base.square`.

For example:

```ts
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

```ts
import { BaseClient } from "@evex/linejs/base";


const client = new BaseClient({ device: "DESKTOPWIN", version: "9.7.0.3556" });
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

# Calling LINE REST endpoints directly

Some LINE subsystems (Album/Moa, Timeline REST helpers, ...) speak plain HTTP
JSON on top of the LEGY proxy rather than Thrift, but LINEJS's default
`getHeader("GET")` helper is tuned for Thrift and sets
`accept: application/x-thrift` and `content-type: application/x-thrift`. If you
call a JSON REST endpoint with those defaults you will get
`{"code":102001,"message":"一時的なエラーが発生しました。"}` back with HTTP 200.

When you hand-craft a REST request, **override both headers to
`application/json`**:

```ts
const headers = {
  ...client.base.request.getHeader("GET"),
  accept: "application/json",
  "content-type": "application/json; charset=UTF-8",
  "X-Line-ChannelToken": token,
  "X-Line-Mid": client.base.profile!.mid,
};
const res = await client.base.fetch(url, {
  method: "POST",
  headers,
  body: new Uint8Array(),
});
```
