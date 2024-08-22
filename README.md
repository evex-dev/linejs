# LINEJS (Develop now)

<img src="./.github/assets/icon.png" width="150" height="150" alt="LINEJS" />

**LINEJS** is a JavaScript library for LINE SelfBot.

## Installation

Support all runtimes (Node.js, Deno, and Bun) and typescript.

```llvm
npx jsr add @evex/linejs
bunx --bun jsr add @evex/linejs
deno add @evex/linejs
```

```ts
import { Client } from "@evex/linejs";

const client = new Client();

client.on("pincall", (pincode) => {
	console.log(`pincode: ${pincode}`);
});

client.on("ready", (user) => {
	console.log(`Logged in as ${user.displayName} (${user.mid})`);
});

client.on("message", (message) => {
	if (message.author.mid !== client.user?.mid) return;

	if (message.content == "!ping") {
		message.reply("pong!");
	}
});

await client.login({
	email: "YOUR_EMAIL",
	password: "YOUR_PASSWORD",
	device: "IOSIPAD",
	// OR
	// authToken: "YOUR_AUTH_TOKEN",
});
```

## Provided Packages

- client - (@evex/linejs) or (@evex/linejs/client)
  - Client - LINE SelfBot Client
- utils - (@evex/linejs/utils)
  - LINE_SCHEME - LINE Scheme utility
  - LINE_OBS - LINE OBS utility
  - LINE_REGEX - LINE URI Regex utility
  - LINE_FUNCTIONS - LINE Function utility (search openchat, ticket to emid,
    etc...)

## Authors

- Owner & Developer [Piloking](https://github.com/piloking)
- Developer [EdamAme-x](https://github.com/EdamAme-x)
- Developer [Hafusun](https://github.com/hafusun)

## ToDo

- [ ] Migrate to [packages](./packages) from [archive](./archive)
- [ ] Create Utils for LINE
  - [x] Add [LINE Scheme](./packages/utils/line-scheme/index.ts)
  - [x] Create REGEX for LINE URI
  - [ ] Create OpenChat Search Function and etc...
- [x] Release to JSR
