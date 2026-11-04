# CLI & MCP

`@evex-dev/linejs-cli` provides the `line` binary, JSON output for scripting,
and a two-tool MCP server with webhook-based MCP Events.

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

## MCP Events

`line mcp` advertises `events` in `initialize` and implements the
[webhook delivery extension](https://github.com/modelcontextprotocol/experimental-ext-triggers-events)
that ChatGPT supports:

| Method               | Behaviour                                                                                      |
| -------------------- | ---------------------------------------------------------------------------------------------- |
| `events/list`        | describes `line.message.received`, `line.message.edited`, and `line.openchat.message.received` |
| `events/subscribe`   | verifies the callback, creates or refreshes a subscription, returns `refreshBefore`            |
| `events/unsubscribe` | eagerly removes a subscription; idempotent                                                     |

Subscriptions take `chatId` / `from` glob filters and `includeText` (default
`true`). Payloads contain ids, content type, a truncated text preview, and the
timestamp, so the model gets enough to triage an event and can fetch the full
message with a tool.

```jsonc
// events/subscribe
{
	"name": "line.message.received",
	"arguments": { "chatId": "c*", "includeText": false },
	"delivery": {
		"mode": "webhook",
		"url": "https://example.com/mcp/events",
		"secret": "whsec_<base64 of 24-64 random bytes>",
	},
	"ttlMs": 900000,
}
```

Before any event is delivered, the server POSTs a signed
`{"type":"verification","challenge":"…"}` envelope and waits for the endpoint to
echo the challenge with a `2xx` response. Event deliveries are signed with
Standard Webhooks headers (`webhook-id`, `webhook-timestamp`,
`webhook-signature`) plus `X-MCP-Subscription-Id`, retried with exponential
backoff, and give up on `410`/`413`.

Callbacks must be `https` and globally routable. The hostname is resolved and
checked on every delivery attempt, the connection is pinned to the validated
address, and redirects are never followed.

Subscription state is in memory: the default TTL is 15 minutes (1 minute to 1
hour), a `ttlMs: null` request is answered with a finite grant, and `cursor` is
always `null` because LINE messages cannot be replayed.

ChatGPT connects over Streamable HTTP, so run `line mcp` behind a stdio↔HTTP
bridge to use it there. `line mcp --profile work` scopes events to that profile.

## Safety

Prefer QR login for the first session and reuse the saved token afterwards.
Repeated email/password logins can trigger LINE account restrictions. Using
LINEJS may violate LINE's terms of service.
