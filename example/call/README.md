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

| Variable                       |               Default | Meaning                                                                                    |
| ------------------------------ | --------------------: | ------------------------------------------------------------------------------------------ |
| `LINE_AUTH_TOKEN`              |                       | Auth token, primary token, auth key, or V3 credential JSON.                                |
| `LINE_AUTH_TOKEN_FILE`         |                       | File containing the same token data. If unset, QR login is used.                           |
| `LINE_STORAGE_FILE`            |                       | Optional FileStorage path. If unset, in-memory storage is used.                            |
| `LINE_DEVICE`                  |         context-aware | Login device type. Defaults to `ANDROID` with an auth token, otherwise `ANDROIDSECONDARY`. |
| `LINE_VERSION`                 |       package default | LINE app version used in `x-line-application`.                                             |
| `LINE_CALL_DEVNAME`            |       package default | Device name sent in `fromEnvInfo.devname` for call route acquisition.                      |
| `LINE_CALL_FROM_ENV_INFO`      |                       | JSON string map for the full `fromEnvInfo` route-acquisition field.                        |
| `LINE_CALL_COMMAND`            |               `!call` | Command text to trigger the call.                                                          |
| `LINE_CALL_WAV`                |         `./unity.wav` | WAV file to stream. The first CLI arg overrides this.                                      |
| `LINE_CALL_FRAME_MS`           |                  `20` | Opus frame size.                                                                           |
| `LINE_CALL_PAYLOAD_PREFIX_HEX` |                  `00` | Native PLANET audio payload prefix.                                                        |
| `LINE_CALL_MEDIA_KEY_MODE`     | `audio-reverse-stage` | PLANET SRTP media key mode.                                                                |
| `LINE_CALL_GAIN`               |                   `1` | PCM gain before Opus encoding.                                                             |
| `LINE_CALL_REPEAT_COUNT`       |                   `1` | Number of times to replay the WAV before closing the call.                                 |
| `LINE_CALL_HOLD_MS`            |                `1000` | Extra time to keep the call open after playback.                                           |
| `LINE_CALL_OPUS_BITRATE`       |                       | Optional Opus encoder bitrate.                                                             |
| `LINE_CALL_OPUS_BANDWIDTH`     |                       | Optional Opus bandwidth: `narrowband`, `wideband`, `fullband`, etc.                        |
| `LINE_CALL_OPUS_SIGNAL`        |               `music` | Opus signal hint: `music`, `voice`, or `auto`.                                             |
| `LINE_CALL_OPUS_VBR`           |               `false` | Enable Opus VBR.                                                                           |

The bundled sample WAV is credited in `CREDITS.md`.

V3 credential JSON can be the raw result containing `accessToken` and
`refreshToken`. LINE.js stores the refresh token and automatically sends modern
Android/primary tokens through LINE's encrypted LEGY gateway.

The example closes the call after playback plus `LINE_CALL_HOLD_MS`. For a
longer demo, increase `LINE_CALL_REPEAT_COUNT` or `LINE_CALL_HOLD_MS`.

If `acquireCallRoute(/V4)` returns `INVALID_STATE` while using a primary token,
first verify that `LINE_DEVICE` matches the token's real device family and that
the command came from a callable 1:1 friend chat. If it still fails, set
`LINE_CALL_DEVNAME` to the primary device model, for example `Pixel 8`.
