---
name: linejs
description: Helps a coding agent build LINE bots / clients with the `@evex/linejs` library — JSR package, Deno-first, runs on Node/Bun too. Use when the user asks to write LINE bots, automate LINE accounts, work with LINE Thrift APIs, or wrap the AI "Agent I" feature.
---

# linejs

`@evex/linejs` is a Deno-first client library for the LINE Messenger protocol. It speaks LINE's Thrift binary wire format directly, supports E2EE, polling for events, and ships hand-written wrappers for the methods CHRLINE-Patch covers.

This skill is a **roadmap**, not a manual. The library moves fast; rather than freezing details that will rot, this file points the agent at the canonical sources to read on demand.

## Install

```sh
deno add jsr:@evex/linejs
# Types are also available standalone:
deno add jsr:@evex/linejs-types
```

Latest release: check JSR — `https://jsr.io/@evex/linejs` or `curl -s https://jsr.io/@evex/linejs/meta.json | jq -r .latest`. The skill prompt does **not** pin a version; pin in user code.

## Minimum-viable bot

```ts
import { BaseClient } from "@evex/linejs/base";
import { FileStorage } from "@evex/linejs/storage";

const storage = new FileStorage("./storage.json");
const client = new BaseClient({ device: "DESKTOPWIN", storage });

client.on("qrcall",  (url) => console.log("scan:", url));
client.on("pincall", (pin) => console.log("PIN:", pin));
client.on("update:authtoken", (t) => storage.set(".auth", t));

const cached = await storage.get(".auth");
await client.loginProcess.login(
    typeof cached === "string" ? { authToken: cached } : {},
);

for await (const op of client.createPolling().listenTalkEvents()) {
    if (op.type === "RECEIVE_MESSAGE" || op.type === "SEND_MESSAGE") {
        const msg = await client.e2ee.decryptE2EEMessage(op.message);
        if (msg.text === "!ping") {
            await client.talk.sendMessage({
                to: msg.to === client.profile?.mid ? msg.from : msg.to,
                text: "pong!",
                e2ee: !!op.message.chunks,
            });
        }
    }
}
```

That's the smallest useful bot. For richer surfaces start with the `Client` wrapper in `@evex/linejs` (it builds on `BaseClient`) — it has `getMyProfile()`, `updateMy{DisplayName,StatusMessage,Profile}()`, `fetchJoinedChats()`, `getChat()`, `getUser()`, `uploadMyProfileImage()`, `uploadMyProfileBackground()` and more.

## Roadmap — where to look for what

| You want to … | Look at |
|---|---|
| log in (QR / email) | `packages/linejs/base/login/mod.ts` — uses ForSecure RPCs as of v2.7; legacy `createQrCode` is server-rejected |
| send / receive messages | `packages/linejs/client/features/message/` and `BaseClient.talk.sendMessage` |
| any Thrift RPC LINE supports | `packages/linejs/base/service/*/mod.ts` — one wrapper per LINE service (30+ services, 130+ methods) |
| change profile attributes | `client.updateMyProfile({...})` / see `packages/linejs/client/features/profile.ts` |
| rename / favourite / mute friends | `User.rename()` / `User.setFavorite()` etc. — see `packages/linejs/client/features/user/mod.ts` |
| chat BGM | `Chat.getBgm()` / `Chat.setBgm()` |
| calendar events on a contact | `User.fetchCalendarEvents()` — note: server-gated on some client device types (DESKTOPWIN currently lacks it) |
| upload profile picture / cover | `client.uploadMyProfileImage(blob)` / `client.uploadMyProfileBackground(blob)` |
| **Agent I** (LINE's chat-tab AI search) | `@evex/linejs-agent` — wraps Yahoo's search-agent SSE backend that LINE Android opens in a WebView. Requires Yahoo session cookies; LINE does not mint them. |
| E2EE primitives | `packages/linejs/base/e2ee/mod.ts` — AES-GCM-SIV, ECDH, decrypt encrypted QR identifier, key chain etc. |
| Thrift schema | `packages/types/thrift.ts` (data) + `packages/types/line_types.ts` (TS interfaces). Both auto-synced from LINE Android APK by `deno task apk:sync`. |

When in doubt, **read the source** under `packages/linejs/client/features/` — feature classes are short and read like documentation.

## Known constraints

- **LINE 26+ requires the ForSecure QR login** (`createQrCodeForSecure` + `qrCodeLoginV2ForSecure`). Legacy `createQrCode` is silently expired by the server. linejs v2.7+ uses ForSecure by default; older versions cannot log in.
- **`map<i32, V>` encoding** was broken on JS-object keys before v2.7 — JS keys are strings, the encoder rejected them. Fixed in v2.7. If you're targeting older linejs, build the map as a `NestedArray` tuple.
- **E2EE decryption is required** for most chat messages — see `client.e2ee.decryptE2EEMessage(op.message)`. Don't read `op.message.text` directly.
- **Agent I needs Yahoo cookies**. The LINE Android app loads the WebView with whatever Yahoo session the user already has; programmatic use requires you to obtain those cookies yourself (Yahoo Japan login → extract cookies). linejs ships the call shape, not the auth.
- **Device type matters for feature gating**. `DESKTOPWIN` lacks several APIs that `ANDROID` has (e.g. `getContactsV3`, `getContactCalendarEvents`). For pure bot work `DESKTOPWIN` is usually enough; if a method returns `API method not capable`, switch device type or use a legacy fallback.

## Bugs / issues

Report to **https://github.com/evex-dev/linejs/issues**. Useful context to include:

- linejs version (`deno info jsr:@evex/linejs` shows resolved version)
- device type and LINE app version you're targeting
- minimal repro: the smallest snippet that reproduces, plus the error from `Request internal failed: status=… headers=… body=<…>` (v2.7+ includes the HTTP status / headers in the thrown message — very helpful for triage)
- if QR login–related: which step (`createSession`, `createQrCodeForSecure`, `checkQrCodeVerified`, `qrCodeLoginV2ForSecure`) and the `[login] ForSecure: maxCount=… intervalSec=… nonce=…` debug line if it printed.

CHRLINE-Patch-compatible behaviour reports (e.g. "this RPC works in CHRLINE but not linejs") are also useful — name the method and we'll port it.

## What this skill deliberately does NOT contain

- Frozen API signatures — they change. Read the source.
- A list of every wrapped method — there are 130+, see `packages/linejs/base/service/` for the live set.
- Reverse-engineering details for LINE Android — those live in `EdamAme-x/android-reverse` (private). The linejs side is what's published.
