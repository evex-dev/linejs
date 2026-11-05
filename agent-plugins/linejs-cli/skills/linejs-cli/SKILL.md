---
name: linejs-cli
description: "Use the `line` CLI from `@evex-dev/linejs-cli` to operate LINE Messenger from a terminal — log in with a QR code or token, manage profiles, read and send E2EE messages and media, work with contacts, groups, OpenChat, Timeline/Note, calls, birthday boards, raw Thrift/REST APIs, stream events, and run the stdio MCP server. Use when the user asks an agent to act on LINE through the shell: check or send LINE messages, find chats or contacts, script LINE automation, or expose LINE over MCP. For building LINE bots in application code, use the `@evex-dev/linejs` library instead."
license: MIT
compatibility: Requires Node.js 22.18+, 24.11+, or 26+ and a `line` binary from `@evex-dev/linejs-cli` (global install or npx). Needs network access to LINE servers and writes session data to ~/.linejs (directory 0700, profile files 0600).
---

# linejs-cli

`line` is the command-line client for [LINEJS](https://linejs.evex.land). It talks to LINE directly, reuses the same E2EE/session machinery as the library, and exposes contacts, chats, OpenChat, media, Timeline/Note, calls, and raw LINE Thrift/REST methods. Result-producing commands have a `--json` mode, and the same surface is available to agents through a two-tool MCP server.

This skill is a **map**, not a frozen manual. The command set is large and still evolving; discover exact arguments with `line help <command>` or `line commands --json` instead of guessing.

## Ground rules

1. **Check the session before re-authenticating.** Run `line auth status --json` first. Repeated logins can trigger LINE account restrictions.
2. **Use `--json` for anything you parse.** Human output is a table and is not a stable interface.
3. **Confirm before observable or destructive actions.** Sending, replying, uploading, unsending, leaving/kicking, blocking, profile edits, deletes, and logout affect a real account. Restate the target MID, chat name, and payload to the user first.
4. **Resolve MIDs; never guess them.** Look up the contact or chat and use the returned `mid` (`u…` user, `c…` group, `r…` room, `s…` OpenChat square, `m…` OpenChat chat).
5. **Treat credentials as secrets.** `~/.linejs/*.json`, `line auth token`, `line storage list --values`, and `--no-save` output contain auth tokens or E2EE keys. Do not print, log, or commit them.
6. **Ask before automating a personal account.** Using LINEJS may violate LINE's terms of service and can lead to account restrictions.
7. **Get explicit consent about the BAN risk before setup.** Before starting setup (login, etc.), always tell the user that there is an account BAN risk and proceed only after their consent.
8. **Send sparingly — LINE may BAN accounts under heavy request volume.** Never hammer on failure or fire rapid retries. Space out requests, keep batches small, and keep total counts low. Do not send more than necessary.
9. **Report errors to `evex-dev/linejs` Issues.** Include the command, error message/code, and version (`line --version`), excluding tokens, MIDs, and personal info. Check for duplicates first with `gh issue list -R evex-dev/linejs`, then file with `gh issue create -R evex-dev/linejs` or another channel.

## Install and invoke

```sh
npm install -g @evex-dev/linejs-cli
line --version

# without a global install
npx -y -p @evex-dev/linejs-cli line --help
```

Inside the linejs repository, run the TypeScript source with `pnpm line <args>` (for example `pnpm line commands`). The built entry point is `packages/cli/dist/line.mjs`.

## Output contract

- `--json` writes the command result to **stdout** as plain JSON (no envelope).
- Errors go to **stderr** as `{"error":{"code":"…","message":"…","details":…}}`; the process exits `2` for usage errors and `1` for other failures. Success is `0`.
- QR codes, PINs, progress, and `--verbose` logs go to **stderr**, so `--json` stdout stays parseable.
- `line listen --json` is an **NDJSON** stream: one event per line, then a final summary object.
- Big integers become strings, `Date` becomes ISO-8601, and binary results are described (`Blob` → `{type,size,name?}`, buffers → `{type,byteLength}`) instead of being inlined. Use `--out <path>` when you need the bytes.
- `--json`, `--profile`, and the other globals work before or after the command. `--no-color` disables ANSI styling.

## Authentication and profiles

```sh
line auth status --json              # cached account + expiry; add --verify to call the API
line auth profiles --json            # every profile under ~/.linejs

line auth login                      # QR login (default)
line auth login --qr-format none     # print only the URL, no QR art
line auth login --profile work --qr-format compact
line auth login --email me@example.com --password-stdin --force
line auth login --token "$LINE_TOKEN" --profile ./backup.json
line auth login --no-save --json     # one-off; prints the token in JSON

line auth token                      # secret
line auth logout --yes               # --all deletes every profile
```

- QR login is the default and is the safest first login: it registers the E2EE key material. Token-only sessions may lack group E2EE keys.
- Login refuses to overwrite an existing profile unless `--force` is passed. Prefer a new `--profile` over overwriting.
- Password login does not store the password. Prefer `--password-stdin` over `--password`, which leaks into shell history.
- Commands that talk to LINE reuse the profile cached at login and do **not** call `getProfile()` unless `--check-session` is set. `auth login` performs its own check, and `auth status --verify` refreshes the cache.

Profile resolution:

| `--profile` value      | Location                   |
| ---------------------- | -------------------------- |
| omitted                | `~/.linejs/default.json`   |
| `work`                 | `~/.linejs/work.json`      |
| `work.json`            | `~/.linejs/work.json`      |
| `./profiles/work.json` | `<cwd>/profiles/work.json` |
| `/tmp/line.json`       | `/tmp/line.json`           |

`LINEJS_HOME` overrides `~/.linejs`; `LINEJS_PROFILE` sets the default profile name or path; `LINEJS_NONINTERACTIVE=1` forces non-interactive mode. `--device`, `--app-version`, `--endpoint`, and `--timeout` override the emulated client without editing the profile.

## Discover commands

```sh
line commands                        # table of every command
line commands --category chats       # filter by category or name
line --json commands                 # metadata: name, summary, args, options, examples
line help chats send                 # human help for one command
line --json help chats send          # the same metadata as JSON
line commands --json | jq '.commands[].name'
```

Command groups: `auth`, `profile`, `contacts`, `chats`, `messages`, `square` (OpenChat), `timeline` / `note`, `moa` (Album), `media`, `call`, `liff`, `voom`, `birthday`, `storage`, `api`, `listen`, `mcp`.

## Core recipes

### Identify the account

```sh
line --check-session --json profile get
```

`profile get` without `--check-session` returns the cached profile and avoids a network round trip.

### Find a contact, chat, or OpenChat room

```sh
line --json contacts list
line --json chats list
line --json square list
line --json square chats
```

Filter locally with `jq`, or use `contacts list --status <text>` and `chats list --name <text>`. `contacts search --id <line-id>` and `contacts search --phone <e164>` exist for lookup by LINE ID or phone number.

### Read messages

```sh
line --json chats messages cxxxxxxxx -n 30
line --json messages show cxxxxxxxx 123456789
line --json square events mxxxxxxxx -n 50
```

Messages are decrypted by LINEJS when the profile holds the keys. Check `contentType` before assuming `text` is meaningful: stickers, images, and flex messages carry their payload in metadata. Use `messages data` or `media download` to fetch attachments.

### Send text, replies, and media

```sh
line --json chats send cxxxxxxxx "Hello from linejs"
line --json chats send uxxxxxxxx "Hi" --reply-to 123456789
line --json chats send cxxxxxxxx --text "Hi" --no-e2ee
line --json messages reply cxxxxxxxx 123456789 "Thanks!"

line --json chats send-media cxxxxxxxx ./photo.jpg --type image
line --json chats send-media cxxxxxxxx ./photo.jpg --preview ./thumb.jpg
line --json square chat-send mxxxxxxxx "hello"
line --json square chat-media mxxxxxxxx ./photo.jpg
```

E2EE is on by default for talk messages, and for `chats send-media` to `u…`/`c…` targets, matching what normal LINE clients expect. Disable it only when the target or use case requires plaintext. `messages react <messageId> <reaction>` takes only the message id; reactions are `NICE`, `LOVE`, `FUN`, `AMAZING`, `SAD`, `OMG`, `UNDO`, or `0`–`7`. `messages read <chatMid> <messageId>` marks a chat read up to that message.

### OpenChat

```sh
line --json square get sxxxxxxxx
line --json square join sxxxxxxxx
line --json square chat-members mxxxxxxxx
line --json square chat-send mxxxxxxxx "hello"
line --json square chat-leave mxxxxxxxx
```

Square MIDs start with `s`; square _chat_ MIDs start with `m`. Use `square search` to find a square before joining.

### Timeline / Note

```sh
line --json timeline upload ./photo.jpg          # returns { objId, objHash }
line --json timeline post cxxxxxxxx "Hello!" \
  --media-object-id <objId> --media-object-type PHOTO
line --json timeline list cxxxxxxxx
line --json note post cxxxxxxxx --text "Hello"
```

`timeline` and `note` are aliases for the same posts (`note` omits `timeline upload`); `homeId` is a group chat MID (`c…`) or square MID (`s…`). Upload media first, then pass the returned object id.

### Media and downloads

```sh
line --json messages data cxxxxxxxx 123456789
line --json media download cxxxxxxxx 123456789 --out ./image.jpg
line --json media upload ./file.pdf --to cxxxxxxxx --type file --no-e2ee

line --json moa photos --chat-id cxxxxxxxx --album-id <albumId>
line --json moa download --chat-id cxxxxxxxx --album-id <albumId> \
  --oid <oid> --prefix album/a --out ./original.jpg
```

Binary results are not inlined into `--json`; always pass `--out` when you need the file.

### Raw API escape hatch

```sh
line api services
line api methods talk
line --json api call talk getProfile --args '{}'
line --json api call square getSquare --args '{"squareMid":"sxxxxxxxx"}'
line --json api call obs downloadObjectForService \
  --args '[{"obsPath":"talk/m/...","oid":"..."}]' --out ./file.bin
```

A JSON **object** is passed as one argument; a JSON **array** is spread as multiple positional arguments. Use `--args-file <path>` (or `-` for stdin) when quoting gets awkward. This is the escape hatch for newer APIs without a dedicated command; `line api methods <service>` lists the live method names.

### Listen to events

```sh
line listen
line --json listen --duration 60
line --json listen --square --count 10
line listen --talk --square --events
```

`listen` is long-running. With `--json` each event is one JSON line and a summary follows; stop with Ctrl+C. Event listening is **not** available through the MCP tools.

### Storage and debugging

```sh
line storage list
line storage list --values --json     # may contain secrets
line storage get reqseq
line storage export --out ./storage.json
line --verbose --json chats list      # request logs on stderr
```

Storage commands operate on the profile's LINEJS storage (E2EE keys, refresh token, reqseq). Export only to a protected location.

## MCP server

```sh
line mcp
```

`line mcp` runs a stdio MCP server with exactly two tools:

- `list_linejs_cli` — lists commands, arguments, options, category, and MCP eligibility.
- `execute_linejs_cli` — executes an argv array (without the leading `line`) **in-process, without a shell**, with `--json` forced. Long-running commands (`listen`, `mcp`) are rejected.

The server also advertises `events/list`, `events/subscribe`, and `events/unsubscribe` RPC methods for webhook-style event delivery. These are protocol methods, not tools.

Client configuration:

```json
{
	"mcpServers": {
		"linejs": {
			"command": "line",
			"args": ["mcp"]
		}
	}
}
```

Or without a global install:

```json
{
	"mcpServers": {
		"linejs": {
			"command": "npx",
			"args": ["-y", "-p", "@evex-dev/linejs-cli", "line", "mcp"]
		}
	}
}
```

Log in from a terminal before exposing the server: QR/PIN prompts inside a tool call are only returned when the call finishes. The MCP process has the same filesystem access as the user, and `execute_linejs_cli` can call any non-long-running command, including `api call`. Only connect trusted clients.

## Troubleshooting

| Symptom / code           | What it means and what to do                                                                                                                         |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `AUTH_REQUIRED`          | The profile has no token. Run `line auth login --profile <path>` (the error details include the path).                                               |
| `AUTH_FAILED`            | Token expired, revoked, or rejected by LINE. Re-login with `--force`, or switch profiles. Do not retry in a loop.                                    |
| `PROFILE_NOT_FOUND`      | The path does not exist. Check `line auth profiles`, or omit `--profile` for the default.                                                            |
| `PROFILE_EXISTS`         | Login will not overwrite. Pass `--force` deliberately, or use another `--profile`.                                                                   |
| `CONFIRMATION_REQUIRED`  | A destructive command needs confirmation. Confirm with the user, then pass `--yes`.                                                                  |
| `INTERACTIVE_REQUIRED`   | No TTY for a prompt. Use `--password-stdin`/`--token` for login prompts, `--yes` for confirmations, or run the command in a terminal.                |
| `NOT_FOUND`              | A file, chat, message, service, or method was not found. Re-check the path or MID with a list command.                                               |
| `USAGE` (exit `2`)       | Wrong command, argument, or option. Use `line help <command>`; `line` also prints a “Did you mean” hint.                                             |
| `INTERNAL` / timeout     | Unexpected failure or a request that timed out. Raise `--timeout <ms>`, retry once, and use `--verbose` for request logs.                            |
| `API method not capable` | The emulated device lacks that API. Try `--device ANDROID` or `ANDROIDSECONDARY` (some features are gated per device), or use a legacy/raw fallback. |
| Unknown service/method   | Run `line api services` and `line api methods <service>`; method names change as LINEJS adds coverage.                                               |

## Where to look next

- `line help <command>` / `line commands --json` — authoritative for the installed version.
- CLI README: <https://github.com/evex-dev/linejs/tree/main/packages/cli#readme>
- CLI docs: <https://linejs.evex.land/docs/cli>
- Source of truth for commands and options: `packages/cli/src/commands/*.ts` in the linejs repository.
- Library-level behavior (login, E2EE, Thrift services): the `linejs` skill (if installed) and `packages/linejs` in the same repository.
