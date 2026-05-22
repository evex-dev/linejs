# Calls

linejs exposes the LINE call control plane through `client.call.*` and the
media plane through pluggable transports. The current Android 1:1 call path is
PLANET signaling plus SRTP/Opus media.

## What linejs Implements

| Area | Status |
|---|---|
| 1:1 call route acquisition | `client.call.acquireRoute()` |
| Incoming/cancel call events | `call:incoming`, `call:cancel` |
| PLANET outgoing call signaling | `PlanetTransport` |
| PLANET answer handshake | `waitForAnswerDetailed()` with `conn_rsp` |
| PLANET SRTP media send/receive | AES_CM_128_HMAC_SHA1_80 |
| Opus encoding/decoding | `opusCodecFactory()` |
| 16-bit PCM WAV input | `decodeWavSync()` |
| Group-call URL control APIs | create/list/update/delete/join/invite/kick |

The older `AndromedaTransport` is still available for the SIP/MIKEY style
route, but the actively used Android call flow is PLANET.

## Outgoing PLANET Flow

An outgoing 1:1 audio call has these phases:

1. Login and acquire a `CallRoute`.
2. Create `PlanetTransport` with your own mid.
3. `connect({ route })` opens UDP and derives the PLANET transport keys.
4. `inviteDetailed({ to })` sends Cassini `setup_req`, waits for `setup_rsp`,
   sends pinhole probes, and starts keepalive.
5. `waitForAnswerDetailed()` waits for peer `conn_req`, derives media keys,
   sends `conn_rsp`, and makes SRTP ready.
6. Encode 48 kHz PCM as Opus, prefix the native PLANET audio payload byte,
   and send packets on the SRTP media path.
7. `close()` sends `rel_req` and closes the socket.

```ts
import { loginWithAuthToken } from "@evex/linejs";
import {
	decodeWavSync,
	opusCodecFactory,
	PlanetTransport,
	resampleLinear,
} from "@evex/linejs/call";

const client = await loginWithAuthToken(Deno.env.get("LINE_AUTH_TOKEN")!, {
	device: "ANDROID",
});

const to = Deno.env.get("LINE_CALL_TO")!;
const localMid = client.base.profile!.mid;
const route = await client.call.acquireRoute({ to, callType: "AUDIO" });

const transport = new PlanetTransport({
	localMid,
	mediaKeyMode: "audio-reverse-stage",
	timeoutMs: 10_000,
});

await transport.connect({ route });
await transport.inviteDetailed({ to });
const answer = await transport.waitForAnswerDetailed({
	autoConnRsp: true,
	timeoutMs: 60_000,
});
if (!answer.mediaReady) throw new Error("media not established");

const wav = decodeWavSync(await Deno.readFile("./audio.wav"));
let samples = wav.samples;
if (wav.sampleRate !== 48_000) {
	samples = resampleLinear(samples, wav.sampleRate, 48_000, wav.channels);
}

const codec = await opusCodecFactory();
const enc = codec.newEncoder({
	sampleRate: 48_000,
	channels: 1,
	frameDurationMs: 20,
	signal: "music",
});

for (let offset = 0; offset < samples.length; offset += 960) {
	const frame = new Int16Array(960);
	frame.set(samples.subarray(offset, offset + 960));
	const opus = enc.encode({ samples: frame, sampleRate: 48_000, channels: 1 });
	if (opus) {
		const payload = new Uint8Array(1 + opus.length);
		payload[0] = 0x00;
		payload.set(opus, 1);
		await transport.send(payload, { timestampStep: 960 });
	}
	await new Promise((resolve) => setTimeout(resolve, 20));
}

await transport.close();
```

For a complete reusable command-driven example, see
`example/call/call_on_command.ts`.

## Command Trigger Example

`example/call/call_on_command.ts` listens for `!call` in a 1:1 chat. When a
peer sends it, the script calls that peer and streams the bundled WAV file.

```sh
LINE_AUTH_TOKEN_FILE=/path/to/auth-token.txt \
LINE_DEVICE=ANDROID \
deno run -A example/call/call_on_command.ts
```

The example intentionally keeps account details outside the repository:

- `LINE_AUTH_TOKEN` or `LINE_AUTH_TOKEN_FILE` supplies auth.
- `LINE_STORAGE_FILE` is optional. If it is unset, in-memory storage is used.
- `LINE_CALL_WAV` or the first CLI arg can replace the bundled WAV.
- `LINE_CALL_PAYLOAD_PREFIX_HEX` defaults to `00`, matching native PLANET
  audio payloads.

## Incoming Events

`client.listen({ talk: true })` emits call events decoded from Talk operations.

```ts
client.on("call:incoming", ({ callMid, from, kind }) => {
	console.log({ callMid, from, kind });
});

client.on("call:cancel", ({ callMid, from, reason }) => {
	console.log({ callMid, from, reason });
});

client.listen({ talk: true });
```

These events are notifications. Accepting an inbound peer call as a full media
session is a separate flow from placing an outgoing call.

## Audio Pipeline

The media plane expects 48 kHz Opus packets. Helpers in `@evex/linejs/call`:

- `decodeWavSync(bytes)` decodes uncompressed 16-bit PCM WAV.
- `resampleLinear(samples, fromRate, toRate, channels)` performs a simple
  interleaved PCM resample.
- `bufferSource()` and `bufferSink()` adapt PCM buffers to `CallSession`.
- `opusCodecFactory()` loads `opusscript` and supports `frameDurationMs`,
  `bitrate`, `bandwidth`, and `signal`.

For LINE PLANET audio, 20 ms Opus frames at 48 kHz are the safest default:

```ts
const enc = (await opusCodecFactory()).newEncoder({
	sampleRate: 48_000,
	channels: 1,
	frameDurationMs: 20,
	signal: "music",
});
```

## PLANET Writeup

The route returned by `/V4 acquireCallRoute` contains the data needed to
bootstrap a PLANET call. `commParam.mpkey` is a compressed P-256 public key.
linejs generates its own ephemeral P-256 keypair, performs ECDH, then uses the
native two-stage HKDF chain to derive transport keys.

Signaling is Cassini over PLANET frames:

- First `setup_req` uses the bootstrap key material and a fixed SETUP message
  id.
- The first server reply teaches the remote nonce used for later messages.
- `setup_rsp` establishes ringing state.
- After the peer answers, `conn_req` carries the media answer material.
- linejs replies with `conn_rsp` and keeps answering duplicate `conn_req`
  packets while the peer settles.
- `info_req` packets are answered with `info_rsp`.
- Keepalive messages continue for the server-provided interval.
- `close()` sends `rel_req`.

Media keying is separate from the signaling transport. The native setup offer
contains media ECDH material and per-stream material. For audio, linejs derives
the AUDIO stream SRTP keying material and defaults the sample example to
`audio-reverse-stage`, which matches the observed Android audio send path.

RTP details:

- Payload type and SSRC come from the peer's answered audio media record.
- RTP timestamp step is `sampleRate * frameMs / 1000`; 20 ms at 48 kHz is 960.
- RTP uses the native extension profile `0x0240`.
- SRTP uses `AES_CM_128_HMAC_SHA1_80`.
- Native audio payloads carry a one-byte prefix before the Opus packet. The
  working default is `00`.

## `CallSession`

`CallSession` remains useful when you want a transport-neutral session wrapper:

```ts
const session = client.call.startSession({
	to,
	kind: "AUDIO",
	transport: new PlanetTransport({ localMid }),
});

await session.start();
await session.sendBuffer({ samples, sampleRate: 48_000, channels: 1 });
await session.end();
```

For production PLANET audio, use the explicit `PlanetTransport` flow or wrap
the transport so the `00` audio payload prefix is applied before `send()`.

## Group Calls

Group-call APIs are currently control-plane helpers:

```ts
const url = await client.call.createGroupCallUrl({ /* request */ });
const urls = await client.call.listGroupCallUrls();
const info = await client.call.getGroupCallUrl("ticket");
await client.call.updateGroupCallUrl({ /* request */ });
await client.call.deleteGroupCallUrl({ /* request */ });
await client.call.joinChatByUrl("ticket");
await client.call.invite({ /* request */ });
await client.call.kick({ /* request */ });
```

Group media mixing is not wrapped by the 1:1 `PlanetTransport` abstraction.
