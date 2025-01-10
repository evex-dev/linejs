# Methods

## Talk Methods

All the functions for TalkService are in `client.talk`.

For example:

```js
await client.talk.sendMessage({
    to: "u...",
    text: "Hello, LINEJS!",
    e2ee: true,
});
```

This is an example of encrypting a text message with e2ee and sending it to a
user.

## Square Methods

All the functions for SquareService are in `client.square`.

For example:

```js
await client.square.findSquareByInvitationTicket({
    request: {
        invitationTicket: "INVITATION_TICKET",
    },
});
```

This is an example of getting square from invitation code.
