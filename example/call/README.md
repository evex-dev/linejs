# Call Examples

This directory contains reusable LINE call examples. They do not contain
account-specific mids, auth tokens, storage paths, captured routes, or Frida
artifacts.

## `call_on_command.ts`

Listens for `!call` in a 1:1 Talk chat. When another user sends the command, the
script starts an audio call to that user and streams `unity.wav`.

```sh
LINE_AUTH_TOKEN_FILE=/path/to/auth-token.txt \
LINE_DEVICE=ANDROID \
deno run -A example/call/call_on_command.ts
```

You can also pass your own 16-bit PCM WAV file:

```sh
LINE_AUTH_TOKEN_FILE=/path/to/auth-token.txt \
LINE_DEVICE=ANDROID \
deno run -A example/call/call_on_command.ts ./voice.wav
```

Useful environment variables:

| Variable                       |               Default | Meaning                                                             |
| ------------------------------ | --------------------: | ------------------------------------------------------------------- |
| `LINE_AUTH_TOKEN`              |                       | Auth token string.                                                  |
| `LINE_AUTH_TOKEN_FILE`         |                       | File containing an auth token. If unset, QR login is used.          |
| `LINE_STORAGE_FILE`            |                       | Optional FileStorage path. If unset, in-memory storage is used.     |
| `LINE_CALL_COMMAND`            |               `!call` | Command text to trigger the call.                                   |
| `LINE_CALL_WAV`                |         `./unity.wav` | WAV file to stream. The first CLI arg overrides this.               |
| `LINE_CALL_FRAME_MS`           |                  `20` | Opus frame size.                                                    |
| `LINE_CALL_PAYLOAD_PREFIX_HEX` |                  `00` | Native PLANET audio payload prefix.                                 |
| `LINE_CALL_MEDIA_KEY_MODE`     | `audio-reverse-stage` | PLANET SRTP media key mode.                                         |
| `LINE_CALL_GAIN`               |                   `1` | PCM gain before Opus encoding.                                      |
| `LINE_CALL_OPUS_BITRATE`       |                       | Optional Opus encoder bitrate.                                      |
| `LINE_CALL_OPUS_BANDWIDTH`     |                       | Optional Opus bandwidth: `narrowband`, `wideband`, `fullband`, etc. |

The bundled sample WAV is credited in `CREDITS.md`.
