# @evex-dev/linejs-cli

Command-line interface and MCP server for
[LINEJS](https://linejs.evex.land). It exposes the same client, storage,
OpenChat, Album, VOOM, LIFF, Birthday Board, and raw Thrift/REST surfaces as
the library, with a `line` binary and machine-readable `--json` output.

```sh
npm install -g @evex-dev/linejs-cli
# or run without installing:
npx -p @evex-dev/linejs-cli line --help
```

Requires Node.js 22.18+, 24.11+, or 26+.

## Quick start

```sh
# Show the QR code in the terminal and save the session to ~/.linejs/default.json
line auth login

line auth status
line profile get
line contacts list
line chats list
line chats messages c... -n 20
line chats send c... "Hello from linejs"
line listen --square
```

QR codes and PINs are printed to **stderr** so pipelines and `--json` remain
valid. With `--json`, successful results go to stdout and errors are emitted to
stderr as `{"error": {...}}`. The profile file stores the auth token plus LINEJS
internal storage (E2EE keys, refresh token, reqseq) and the last fetched
profile. It is written atomically with mode `0600`.

After login, normal commands reuse the cached profile and do **not** call
`getProfile()`. Pass `--check-session` to verify the token and refresh the cache
first. `auth *` commands still check automatically.

## Profiles

```sh
line auth login --profile work            # ~/.linejs/work.json
line auth login --profile ./backup.json   # ./backup.json
line --profile work contacts list
line auth profiles
line auth logout --yes
```

Resolution rules:

| `--profile` value      | Location                   |
| ---------------------- | -------------------------- |
| omitted                | `~/.linejs/default.json`   |
| `work`                 | `~/.linejs/work.json`      |
| `work.json`            | `~/.linejs/work.json`      |
| `./profiles/work.json` | `<cwd>/profiles/work.json` |
| `/tmp/line.json`       | `/tmp/line.json`           |

`LINEJS_HOME` overrides `~/.linejs`, and `LINEJS_PROFILE` sets the default
profile name/path. Use `--device`, `--app-version`, and `--endpoint` to override
the emulated client without rewriting the profile.

## Authentication

```sh
line auth login                                  # QR (default)
line auth login --qr-format ansi                 # compact|unicode|ansi|ascii|none
line auth login --email me@example.com --password-stdin
line auth login --token "$LINE_TOKEN" --force
line auth login --no-save --json                 # one-off; prints the token
line auth status --verify
line auth token                                  # treat as a secret
```

Passwords are never stored. A new profile refuses to overwrite an existing one
unless `--force` is passed. QR login is the safest first login because it
registers the E2EE key material; token-only logins may lack group E2EE keys.

## Global options

| Option                    | Description                                                                                                                                      |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `--json`                  | Print the result as JSON; streaming commands use NDJSON.                                                                                         |
| `--check-session`         | Verify the token with `getProfile()` and refresh the cached profile. Auth commands always do this; others use the cache unless this flag is set. |
| `--profile <name\|path>`  | Select the profile file.                                                                                                                         |
| `--device <device>`       | `DESKTOPWIN`, `DESKTOPMAC`, `ANDROID`, `ANDROIDSECONDARY`, `IOS`, `IOSIPAD`, `WATCHOS`, `WEAROS`.                                                |
| `--app-version <version>` | Emulated LINE app version.                                                                                                                       |
| `--endpoint <host>`       | LEGY endpoint override.                                                                                                                          |
| `--timeout <ms>`          | Request timeout (default 30000).                                                                                                                 |
| `--verbose`, `-v`         | Write LINEJS request logs to stderr.                                                                                                             |
| `--no-color`              | Disable ANSI colors.                                                                                                                             |
| `--help`, `-h`            | Command help.                                                                                                                                    |
| `--version`               | CLI version.                                                                                                                                     |

Run `line commands` or `line commands --json` for the full command list.
`line help <command>` prints usage, options, and examples.

## Commands

- **auth**: `login`, `status`, `token`, `logout`, `profiles`
- **profile**: `get`, `update`, `image`, `background` (`get` uses the cached profile; add `--check-session` for a fresh `getProfile()`)
- **contacts**: `list`, `get`, `add`, `search`, `rename`, `favorite`, `mute`,
  `hide`, `calendar`, `block`, `unblock`, `blocked`
- **chats**: `list`, `get`, `messages`, `send`, `send-media`, `compact`,
  `create`, `invite`, `kick`, `leave`, `rename`, `bgm get`, `bgm set`
- **messages**: `react`, `cancel-reaction`, `unsend`, `read`, `reply`, `show`,
  `pin`, `data`
- **square**: `list`, `get`, `chats`, `chat-get`, `chat-members`,
  `chat-send`, `chat-media`, `chat-rename`, `chat-invite`, `chat-leave`,
  `join`, `leave`, `create`, `rename`, `search`, `events`, `react`,
  `message-reply`, `message-read`, `message-unsend`, `message-destroy`, `message-data`
- **timeline** / **note**: `post`, `list`, `get`, `update`, `delete`, `share`,
  `like`, `comment`; `timeline upload`
- **moa**: `albums`, `photos`, `download`
- **media**: `upload`, `download`, `object`
- **call**: `route`, `group-route`, `group`, `url list|create|get|update|delete`,
  `join`, `invite`, `kick` (control plane only; media transport is not exposed)
- **liff**: `token`, `view`, `share`, `share-text`
- **voom**: `token`, `feed`, `status`, `call`
- **birthday**: `board-id`, `board`, `cards`, `celebrations`, `likes`,
  `templates`, `create`, `update`, `delete`, `delete-board`, `permission`,
  `like`, `unlike`, `celebrate`, `cancel-celebration`, `report`
- **storage**: `list`, `get`, `set`, `delete`, `clear`, `export`
- **api**: `services`, `methods`, `call` — raw access to every public LINEJS
  service method
- **listen**: stream talk/OpenChat events
- **mcp**: run the MCP server over stdio

Examples:

```sh
line chats send-media u... ./photo.jpg
line messages react 123456789 NICE
line square chat-send m... "hello"
line square events m... -n 50
line timeline post c... "Hello Note"
line media upload ./file.pdf --to c... --type file
line storage get reqseq
line --json contacts list | jq '.contacts[].displayName'
```

### Raw API bridge

Every public method on `client`, `client.base`, and its services (`talk`,
`square`, `relation`, `call`, `liff`, `moa`, `timeline`, `obs`, `e2ee`, …) is
available. A JSON object is passed as one argument; a JSON array is spread as
multiple arguments.

```sh
line api services
line api methods talk
line api call talk getProfile --args '{}'
line api call square getSquare --args '{"squareMid":"s..."}'
line api call call acquireGroupCallRoute --args '{"chatMid":"c...","mediaType":"AUDIO"}'
line api call obs downloadObjectForService \
  --args '[{"obsPath":"talk/m/...","oid":"..."}]' --out ./file.bin
```

Use `line api methods <service>` to discover method names. This is the escape
hatch for newer APIs that do not have a dedicated command yet.

### Listening

```sh
line listen                    # talk messages
line listen --square           # OpenChat events
line listen --json --duration 60
line listen --events --count 5
```

With `--json`, each event is one JSON line (NDJSON), followed by a summary
object. Press Ctrl+C to stop.

## MCP server

```sh
line mcp
```

The stdio server exposes exactly two tools:

- `list_linejs_cli` — lists every command with arguments, options, category,
  and whether it is MCP-executable.
- `execute_linejs_cli` — receives an argv array (without the leading `line`)
  and executes the CLI **in-process, without a shell**. `--json` is forced and
  long-running commands (`listen`, `mcp`) are rejected.

Example client configuration:

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

or with npx:

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

The MCP process runs with the same filesystem permissions as your user. Keep
the profile secret; `execute_linejs_cli` can call any non-long-running CLI
command, including `api call`. Log in from a terminal before exposing the
server: QR/PIN prompts produced during a tool call are only returned when that
call finishes, so interactive login is awkward over MCP.

## Security

- `~/.linejs/*.json` contains an auth token and E2EE key material. Never commit
  or share it. The CLI creates the directory with mode `0700` and files with
  `0600`, but you should still protect backups.
- Prefer QR login for the first session and token reuse afterwards. Repeated
  email/password logins can trigger LINE account restrictions.
- `line auth token` and `line storage list --values` print secrets.
- Using LINEJS may violate LINE's terms of service and can lead to account
  restrictions. Use at your own risk.
- Do not run the MCP server for untrusted clients.

## Development

```sh
pnpm install
pnpm line --help                       # run the CLI from the repository root via tsx
pnpm --filter @evex-dev/linejs-cli run build
pnpm --filter @evex-dev/linejs-cli run typecheck
pnpm --filter @evex-dev/linejs-cli test
```

The built binary is `packages/cli/dist/line.mjs` and is published as `line`.
