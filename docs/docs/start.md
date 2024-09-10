# Getting Started

<b>LINEJS</b> is always by your side

<b>Thank you for choosing this library!</b>

## Installation

```bash
npx jsr add @evex/linejs
bunx --bun jsr add @evex/linejs
deno add @evex/linejs
```

After execution, you should have the library available.

## Usage

Next, let's create a script that just retrieves your profile!

```ts
import { Client } from "@evex/linejs";

const client = new Client();

client.on("pincall", (pincode) => {
	console.log(`pincode: ${pincode}`);
});

client.on("ready", (user) => {
	console.log(`Logged in as ${user.displayName} (${user.mid});`);
});

await client.login({
	email: "YOUR_EMAIL",
	password: "YOUR_PASSWORD",
}); // (If you're using Node.js, please wrap async IIFE)
```

First, log in using your _email_. We will explain each code later.\
(LINEJS supports login by **AuthToken**, **QR** and **Pincode**.)

:::warning  
Please enable email login in your settings. 
:::  

The method of execution depends on the runtime.

```bash
node ./index.js
npx tsx ./index.ts
bun run ./index.js
deno run -A ./index.ts
```

Thereafter, please use what suits you best.

Then, you will see the following output.

```console
pincode: 114514
```

You will then receive a login request on the LINE app for the account you wish
to log in to, and enter the pin code displayed.

By the way, `114514` is Japanese slang. If you don't like it or think it's
messy, you can change it by doing the following.

```ts
await client.login({
	...,
    pincode: "810810"
});
```

The output will then be as follows.

```console
Logged in as EdamAmex (u********************************)
```

Now, you have obtained a `displayName` and `mid`!\
On successful login, `ready` is called and the user object is passed.

There you will find your complete profile. Of course, there is another way to
get it from the method.

Let's try that next!

---

This library is still in its infancy!\
If you find <i>any bugs</i> or <i>missing parts</i>, please let us know on our
server! (Roles will be given to those who suggest bugs and features!)
