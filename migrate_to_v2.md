## What changed

### Client

**old**

```js
const client = new Client({ storage: ~ });

client.registerCert(
	"ffffff...",
);

cl.on("pincall", (p) => console.log(p));

cl.on("qrcall", (q) => console.log(q));

cl.on("update:authtoken", (a) => console.log("AuthToken:", a));

client.on("ready", async (user) => {
	console.log(`Logged in as ${user.displayName} (${user.mid})`);

	await client.sendMessage({ to: "u...", text: "Hello, World!" });

	await client.sendSquareMessage({ squareChatMid: "m...", text: "Hello, World!" });
});

await client.login({
	device: "DESKTOPWIN",
  	email: "linejs@evex.dev",
  	password: "password",
  	polling: ["talk","square"],
  	authToken: ...,
  	v3: true,
  	pincode: "123456",
});
```

**new**

```js
const cl = new Client({
    device: "DESKTOPWIN",
    storage: ~,
});

cl.on("pincall", (p) => console.log(p));

cl.on("qrcall", (q) => console.log(q));

cl.on("update:authtoken", (a) => console.log("AuthToken:", a));

cl.on("ready", (user) => {
    console.log(`Logged in as ${user.displayName} (${user.mid})`);

    await client.talk.sendMessage({ to: "u...", text: "Hello, World!" });

	await client.square.sendMessage({ squareChatMid: "m...", text: "Hello, World!" });
});

await cl.login({
    email: "linejs@evex.dev",
    password: "password",
    pincode: "123456"
});
await cl.login({ qr: true });
await cl.login({ authToken: ... });
```
