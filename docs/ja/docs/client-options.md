# Client Options

Next, we will talk about the Client.\
The Client has several options.

```ts
const client = new Client({
    device: "...",
    ...
});
```

For example, **storage for the data** we discussed before, **OBS Endpoint**,
**Endpoint** for communication, **customFetch** for cors and proxies,
**RateLimitter** for rate limiting, etc.

I'll explain it to you one by one.

## Storage

This is storage for internal needs such as decryption keys and caches. 　 By
default, `MemoryStorage` is used, and once you stop the program, you must log in
from the beginning.

You can use `FileStorage` there.

```ts
import { FileStorage } from "@evex/linejs/storage";

const client = new Client({
    device: "IOSIPAD",
    storage: new FileStorage("./storage.json"), // path to storage file (This is secret file)
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
const client = new Client({
    endpoint: "legy-jp.line-apps.com",
});
```

## Custom Fetch

This is for cors avoidance or proxy. You define a function that replaces fetch.

```ts
...

const client = new Client({
    fetch: async (url, options) => {
        return await fetch(url, {
            ...options,
            ...proxyAgent
        });
    }
});
```

This concludes the explanation of options!\
The next sections will introduce the various methods.
