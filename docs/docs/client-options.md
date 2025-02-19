# Client Options

Next, we will talk about the ClientInit.\
The Client has several options.

```ts
const client = await loginWithPassword({
    email: "",
    password: "",
    onPincodeRequest(pin) {
        console.log(pin);
    },
}, {
    device: "IOSIPAD",
    version: "14.0.1",
    endpoint: "example.com",
    fetch: (req) => fetch(req),
    storage: new FileStorage("./storage.json"),
});
```

For example, **storage for the data** we discussed before,
**Endpoint** for communication, **custom fetch** for cors and proxies,etc.

I'll explain it to you one by one.

## Storage

This is storage for internal needs such as decryption keys and caches. 　 By
default, `MemoryStorage` is used, and once you stop the program, you must log in
from the beginning.

You can use `FileStorage` there.

```ts
import { FileStorage } from "@evex/linejs/storage";

const client = await loginWithPassword({
    email: "",
    password: "",
    onPincodeRequest(pin) {
        console.log(pin);
    },
}, {
    device: "IOSIPAD",
    storage: new FileStorage("./storage.json"),
});
```

If you want to store in your cloud or storages with your data storage API, you
can extend `BaseStorage` to create something of your liking.\
I'd like to give you more details on our server.

## Endpoint

The endpoints of communication.\
There is no need to change this point.\
If you want to try out a proxied server, use it.

```ts
const client = await loginWithPassword({
    email: "",
    password: "",
    onPincodeRequest(pin) {
        console.log(pin);
    },
}, {
    device: "IOSIPAD",
    endpoint: "example.com",
});
```

## Custom Fetch

This is for cors avoidance or proxy. You define a function that replaces fetch.

```ts
...
const client = await loginWithPassword({
    email: "",
    password: "",
    onPincodeRequest(pin) {
        console.log(pin);
    },
}, {
    device: "IOSIPAD",
    fetch: (req) => myfetch(req),
});
```

This concludes the explanation of options!\
The next sections will introduce the various methods.
