# CLI & MCP

`@evex-dev/linejs-cli` provides the `line` binary, JSON output for scripting,
and a two-tool MCP server.

```sh
npm install -g @evex-dev/linejs-cli
line auth login
line contacts list
line --json chats list
line mcp
```

## Profiles

Sessions live in `~/.linejs/<profile>.json` and are created with mode `0600`.
The default profile is `default.json`.

```sh
line auth login --profile work
line --profile work chats list
line auth login --profile ./backup.json
```

Override the profile directory with `LINEJS_HOME`, or the default profile with
`LINEJS_PROFILE`. The file contains the auth token and E2EE keys; never commit
it.

## Commands and JSON

`line commands --json` lists every command. All read/write commands accept
`--json`; QR codes, PINs, and diagnostics go to stderr so stdout stays valid.
`line listen --json` emits one JSON object per line (NDJSON).

Non-auth commands use the profile cached at login and do not call `getProfile()`
before running. Add `--check-session` when you want to verify the saved token
and refresh the cache; `auth *` commands always perform this check.

The `api` group exposes every public LINEJS service method directly:

```sh
line api services
line api methods talk
line api call talk getProfile --args '{}'
```

A JSON object is passed as one argument and a JSON array is spread into multiple
arguments. This covers low-level APIs that do not have a dedicated command.

## MCP

`line mcp` starts a stdio MCP server with two tools:

- `list_linejs_cli` — enumerate commands, arguments, and options.
- `execute_linejs_cli` — execute an argv array in-process, without a shell.
  `--json` is always enabled, and long-running commands (`listen`, `mcp`) are
  rejected.

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

The MCP server has the same filesystem access as the user running it. Only
connect trusted clients, and keep profile files private.

## Safety

Prefer QR login for the first session and reuse the saved token afterwards.
Repeated email/password logins can trigger LINE account restrictions. Using
LINEJS may violate LINE's terms of service.
