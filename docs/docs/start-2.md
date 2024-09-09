# How to use the methods of client

Next, How to use the methods of client?

It's easy. 　

All you have to do is call the client's method as follows.

```ts
import { Client } from "../packages/client/index.ts";

const client = new Client();

client.on("pincall", (pincode) => {
	console.log(`pincode: ${pincode}`);
});

client.on("ready", async (user) => {
	console.log(`Logged in as ${user.displayName} (${user.mid})`);

	console.log(await client.getProfile());
});

await client.login({
	email: "YOUR_EMAIL",
	password: "YOUR_PASSWORD",
});
```

The output will be as follows.

```console
{
	mid: "u**********",
	phone: "***********",
	email: "***@*****.****",
	regionCode: "JP",
    ...
}
```

I will tell you one thing here.\
When you log in, you can use a better choice.

Logging in repeatedly with _email_ may be regarded as fraudulent login\
and your account may be temporarily restricted (though only for a few days), and
above all, It is very cumbersome.

It is therefore a good idea to use an **AuthToken**.

A temporary token is used for email login.\
Therefore, after a few days, it will expire and the client will stop running.\
So, if you want to run the client permanently, you must use v1.

It would be a good idea to use v2 during development.\
Repeating the email login multiple times is highly discouraged.

Now, let's look at how to get token.

Simply write the following.\
It's easy.

```ts
client.on("update:authtoken", (authtoken) => {
	console.log("AuthToken", authtoken);
});
```

The output will be as follows.

```console
AuthToken **********.********
```

This is the v2 token. It can be used as follows

```ts
await client.login({
	authToken: "YOUR_AUTH_TOKEN",
});
```

However, this login method has pitfalls. LINE uses _e2ee_ for encryption, but
the key to decrypt it can only be obtained with an email login.

Therefore, if you login only with an authToken, you will not be able to retrieve
group talk events.\
(Square (open chat) is possible.)

So how can we do this?　　 It's easy, too.

We just need to make the internal storage permanent and log in with email first
only once.

LINEJS has internal storage for storing and caching.\
By default, it is `MemoryStorage`, and it all disappears after one execution.

This can be `FileStorage`. As follows.

```ts
import { FileStorage } from "@evex/linejs/storage";

const client = new Client({
	storage: new FileStorage("./storage.json"), // path to storage file (This is secret file)
});
```

You only need to log in once first with your email and then use your authToken.

This concludes our first trip.\
But there is still a journey left to be made.\
Enjoy.

:::info  
If you want to create your own storage such as connecting to the cloud
api,\
import `BaseStorage` and extend it to create your own storage. (Please ask for
details.) 
:::  

:::info  
If you want to use v1, please ask for details at
[discord.gg/evex](https://discord.gg/evex). 
:::  
