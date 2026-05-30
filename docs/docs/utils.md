# Utilities

Standalone utilities are no longer exported from a separate package subpath.
Current utilities are exposed through the client or the documented package
subpaths below.

## OBS

OBS helpers are available from the authenticated client's `BaseClient`:

```ts
const metadata = await client.base.obs.getMessageObsMetadata({
  messageId: "MESSAGE_ID",
});

const file = await client.base.obs.downloadMessageData({
  messageId: "MESSAGE_ID",
});
```

Media upload helpers are available on the same object:

```ts
const message = await client.base.obs.uploadMediaByE2EE({
  to: "u...",
  oType: "image",
  data: imageFile,
  filename: "image.png",
});
```

Implementation details live in
[`packages/linejs/base/obs/mod.ts`](https://github.com/evex-dev/linejs/blob/main/packages/linejs/base/obs/mod.ts).

## Storage

Storage helpers are exported from `@evex/linejs/storage`:

```ts
import { FileStorage, MemoryStorage } from "@evex/linejs/storage";

const storage = new FileStorage("./storage.json");
```

Use `FileStorage` when login state, E2EE keys, and request sequence state must
survive process restarts. Use `MemoryStorage` only for short-lived clients.

## Base Helpers

Low-level helpers that are part of the public base package are exported from
`@evex/linejs/base`:

```ts
import { BaseClient, continueRequest, InternalError } from "@evex/linejs/base";
```

The package exports are defined in
[`packages/linejs/deno.json`](https://github.com/evex-dev/linejs/blob/main/packages/linejs/deno.json).
