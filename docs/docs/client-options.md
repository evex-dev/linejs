# Client Options

Next, we will talk about the Client.  
The Client has several options.

```ts
const client = new Client({
    ...
});
```

For example, **storage for the data** we talked about before, **OBS Endpoint**, **Endpoint** for communication, **customFetch** for cors and proxies, **RateLimitter** for rate limiting, etc.  

Let me explain one by one.

## Storage

This is storage for internal needs such as decryption keys and caches. 　
By default, `MemoryStorage` is used, and once you stop the program, you must log in from the beginning.

You can use `FileStorage` there.

```ts
import { FileStorage } from "@evex/linejs/storage";

const client = new Client({
    storage: new FileStorage("./storage.json"), // path to storage file (This is secret file)
});
```

If you want to store in your own cloud or storages with your own data storage api, you can extend `BaseStorage` to create something of your own liking.  
More details on our server.

## OBS Endpoint

OBS stands for `OBject Storage` and is the cdn where LINE stores images and videos.  
There are several endpoints.  
If you want to change the endpoints you can do so as follows  

```ts
import { LINE_OBS } from "@evex/linejs/utils";

const client = new Client({
    LINE_OBS: new LINE_OBS("https://obs.line-scdn.net/"),
});
```

:::tip
Wait a minute, do you care about `@evex/linejs/utils`?
It contains useful things like search functions for OpenChat, internal URL construction functions, etc.
Later.
:::

## Endpoint
The endpoints of communication.  
There is basically no need to change this point.  
If you want to try out a proxied server, use it.

```ts
const client = new Client({
    endpoint: "gw.line.naver.jp"
});
```


## Custom Fetch

This is for cors avoidance or proxy. 
You define a function that replaces fetch. 

```ts
...

const client = new Client({
    customFetch: async (url, options) => {
        return await fetch(url, {
            ...options,
            ...proxyAgent
        });
    }
});
```

## RateLimitter

It is a safeguard to ensure that you are not restricted by the Square (OpenChat) by a series of posts.  
The default is 9 posts per 2 seconds.  
If you want to make it stricter, you can change it.

```ts
import { RateLimitter } from "@evex/linejs/rate-limit";

const client = new Client({
    squareRateLimitter: new RateLimitter(4, 2000),
});
```

This will bring the total to 4 posts per 2 seconds.

This concludes the explanation of options!  
Next, we will discuss `@evex/linejs/utils` as an extra.
