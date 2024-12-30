## What changed

### Client

**old**

```js
const client = new Client({ storage: ~ });

client.storage.set("time", Date.now())

client.registerCert(
	"ffffff...",
);

client.on("pincall", (p) => console.log(p));

client.on("qrcall", (q) => console.log(q));

client.on("update:authtoken", (a) => console.log("AuthToken:", a));

client.on("ready", async (user) => {
	console.log(`Logged in as ${user.displayName} (${user.mid})`);

	await client.sendMessage({ to: "u...", text: "Hello, World!" });

	await client.sendSquareMessage({ squareChatMid: "m...", text: "Hello, World!" });
});


// login with email
await client.login({
	device: "DESKTOPWIN",
  	email: "linejs@evex.dev",
  	password: "password",
  	polling: ["talk","square"],
  	v3: true,
  	pincode: "123456",
});

// login with qrcode
await client.login({
	device: "DESKTOPWIN",
  	polling: ["talk","square"],
  	v3: true,
  	qr: true,
});

// login with authToken
await client.login({
	device: "DESKTOPWIN",
  	polling: ["talk","square"],
  	authToken: ...,
});
```

**new**

```js
const client = new Client({
    device: "DESKTOPWIN",
    storage: ~,
});

await client.storage.set("time", Date.now())

client.on("pincall", (p) => console.log(p));

client.on("qrcall", (q) => console.log(q));

client.on("update:authtoken", (a) => console.log("AuthToken:", a));

client.on("ready", (user) => {
    console.log(`Logged in as ${user.displayName} (${user.mid})`);

    await client.talk.sendMessage({ to: "u...", text: "Hello, World!" });

	await client.square.sendMessage({ squareChatMid: "m...", text: "Hello, World!" });
});

// login with email
await client.login({
    email: "linejs@evex.dev",
    password: "password",
    pincode: "123456"
});

// login with qrcode
await client.login({ qr: true });

// login with authToken
await client.login({ authToken: ... });
```
