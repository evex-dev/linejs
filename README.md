# LINEJS (Develop now)

<img src="./.github/assets/icon.png" width="150" height="150" alt="LINEJS" />

**LINEJS** is a JavaScript library for LINE Self-Bot.

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

client.on("pincode", (pincode) => {
	console.log(`pincode: ${pincode}`);
});

client.on("ready", () => {
	console.log(`Logged in as ${client.user.name} (${client.user.id})`);
});

client.on("message", (message) => {
	if (message.author.id !== client.user.id) return;

	if (message.content == "!ping") {
		message.reply("pong!");
	}
});

client.login({
	email: "YOUR_EMAIL",
	password: "YOUR_PASSWORD",
	device: "IOSIPAD",
	// OR
	// authToken: "YOUR_AUTH_TOKEN",
});
```

## Authors

- Owner & Developer [Piloking](https://github.com/piloking)
- Developer [EdamAme-x](https://github.com/EdamAme-x)
- Developer [Hafusan](https://github.com/hafusun)

## ToDo

- [ ] Migrate to [packages](./packages) from [archive](./archive)
- [ ] Create Utils for LINE
  - [ ] Add [LINE Scheme](./packages/utils/line-scheme/index.ts)
  - [ ] Create REGEX for LINE URI
  - [ ] Create OpenChat Search Function and etc...
- [ ] Release to JSR
