# Calls

linejs can place LINE 1:1 audio calls from JavaScript. The public API is split
into two layers:

- `client.call.*` wraps LINE's call control APIs, such as route acquisition and
  group-call URL management.
- `@evex/linejs/call` contains the call media building blocks: PLANET
  signaling, SRTP, RTP, Opus, WAV/PCM helpers, and the transport-neutral
  `CallSession` wrapper.

The Android 1:1 audio path implemented by linejs is:

```txt
Talk auth token
  -> /V4 acquireCallRoute
  -> PLANET UDP transport
  -> Cassini call-control messages
  -> peer answer handshake
  -> SRTP-protected RTP packets
  -> 48 kHz Opus audio payloads
```

## Start Here

If you only want a bot that places a call and plays audio, start with the
command example:

```sh
LINE_AUTH_TOKEN_FILE=/path/to/auth-token.txt \
LINE_DEVICE=ANDROID \
deno run -A example/call/call_on_command.ts ./voice.wav
```

Then send `!call` to that account in a 1:1 chat. The example will:

1. read the sender MID from the incoming message;
2. acquire a fresh LINE call route for that sender;
3. ring the sender with a PLANET audio call;
4. wait until the sender answers;
5. encode the WAV as 48 kHz Opus;
6. send SRTP media packets in real time;
7. close the call after playback.

For a reliable outgoing audio call, these defaults matter:

| Setting | Use this |
| --- | --- |
| Device | `ANDROID` |
| Call type | `AUDIO` |
| Route env info | `fromEnvInfo.devname` |
| Transport | `PlanetTransport` |
| Media key mode | `audio-reverse-stage` |
| Input audio | 16-bit PCM WAV |
| Sample rate | 48 kHz |
| Channels | mono |
| Opus frame size | 20 ms |
| RTP timestamp step | `960` |
| PLANET audio payload prefix | `00` |

The rest of this page explains why those values are needed and where each one
fits into the call flow.

## Mental Model

LINE calls are not started by sending audio directly to a user. A call first
needs a control-plane session, then a media-plane session.

```txt
Control plane:
  ask LINE for a route
  connect to the PLANET relay
  send setup_req so the peer starts ringing
  wait for conn_req when the peer answers
  send conn_rsp to finish negotiation

Media plane:
  derive SRTP keys from the answer material
  encode audio as Opus
  wrap each Opus frame the way native PLANET audio expects
  send RTP packets protected by SRTP
```

`client.call.acquireRoute()` belongs to the control plane. `transport.send()`
belongs to the media plane. If signaling succeeds but the peer hears no audio,
debug the media plane: key mode, payload prefix, Opus frame size, RTP timestamp,
and real-time pacing.

## Implementation Status

| Area | Status |
| --- | --- |
| 1:1 call route acquisition | `client.call.acquireRoute()` |
| Outgoing Android 1:1 audio calls | `PlanetTransport` |
| PLANET SETUP/INVITE signaling | `inviteDetailed()` |
| Peer answer handshake | `waitForAnswerDetailed()` and automatic `conn_rsp` |
| SRTP media send/receive | `AES_CM_128_HMAC_SHA1_80` |
| Opus encode/decode hooks | `opusCodecFactory()` |
| WAV/PCM helpers | `decodeWavSync()`, `resampleLinear()`, `bufferSource()` |
| Incoming call notifications | `call:incoming`, `call:cancel` |
| Incoming call answering | Not wrapped as a high-level public flow yet |
| Group-call URL/control APIs | Wrapped under `client.call.*` |
| Group-call media mixing | Not wrapped by `PlanetTransport` |

The older `AndromedaTransport` and SIP/MIKEY helpers are still exported for
experiments and compatibility, but the working modern Android 1:1 audio flow is
PLANET.

## Public Entry Points

Most applications only need these exports:

```ts
import { loginWithAuthToken } from "@evex/linejs";
import {
	decodeWavSync,
	opusCodecFactory,
	PlanetTransport,
	resampleLinear,
} from "@evex/linejs/call";
```

Useful call APIs:

| API | Purpose |
| --- | --- |
| `client.call.acquireRoute({ to, callType: "AUDIO" })` | Fetches a fresh call route for a peer. |
| `new PlanetTransport({ localMid, ... })` | Creates the PLANET signaling and media transport. |
| `transport.connect({ route })` | Opens UDP and prepares PLANET transport crypto. |
| `transport.inviteDetailed({ to })` | Sends `setup_req` and waits for `setup_rsp`. |
| `transport.waitForAnswerDetailed()` | Waits for peer `conn_req`, derives SRTP keys, and sends `conn_rsp`. |
| `transport.send(packet, { timestampStep })` | Sends one SRTP-protected RTP media packet. |
| `transport.receive()` | Yields received media payloads after SRTP authentication. |
| `transport.close()` | Sends `rel_req` when applicable and closes the socket. |

## Minimal Outgoing Audio Call

This is the explicit low-level flow. It is intentionally verbose so each
protocol step is visible.

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
const localMid = client.base.profile?.mid;
if (!localMid) throw new Error("profile is not ready");

const route = await client.call.acquireRoute({
	to,
	callType: "AUDIO",
	fromEnvInfo: { devname: "Android" },
});
const transport = new PlanetTransport({
	localMid,
	mediaKeyMode: "audio-reverse-stage",
	timeoutMs: 10_000,
});

try {
	await transport.connect({ route });
	await transport.inviteDetailed({ to });

	const answer = await transport.waitForAnswerDetailed({
		autoConnRsp: true,
		timeoutMs: 60_000,
	});
	if (!answer.mediaReady) {
		throw new Error("peer answered, but media keys were not established");
	}

	const wav = decodeWavSync(await Deno.readFile("./audio.wav"));
	let samples = wav.samples;
	if (wav.sampleRate !== 48_000) {
		samples = resampleLinear(samples, wav.sampleRate, 48_000, wav.channels);
	}
	if (wav.channels !== 1) {
		samples = downmixToMono(samples, wav.channels);
	}

	const codec = await opusCodecFactory();
	const encoder = codec.newEncoder({
		sampleRate: 48_000,
		channels: 1,
		frameDurationMs: 20,
		signal: "music",
	});

	try {
		for (let offset = 0; offset < samples.length; offset += 960) {
			const frame = new Int16Array(960);
			frame.set(samples.subarray(offset, offset + 960));
			const opus = encoder.encode({
				samples: frame,
				sampleRate: 48_000,
				channels: 1,
			});
			if (opus) {
				await transport.send(prepend(opus, new Uint8Array([0x00])), {
					timestampStep: 960,
				});
			}
			await sleep(20);
		}
	} finally {
		encoder.close?.();
	}
} finally {
	await transport.close();
}

function prepend(packet: Uint8Array, prefix: Uint8Array): Uint8Array {
	const out = new Uint8Array(prefix.length + packet.length);
	out.set(prefix, 0);
	out.set(packet, prefix.length);
	return out;
}

function downmixToMono(samples: Int16Array, channels: number): Int16Array {
	if (channels <= 1) return samples;
	const frames = Math.floor(samples.length / channels);
	const out = new Int16Array(frames);
	for (let frame = 0; frame < frames; frame++) {
		let sum = 0;
		for (let channel = 0; channel < channels; channel++) {
			sum += samples[frame * channels + channel] ?? 0;
		}
		out[frame] = Math.max(-32768, Math.min(32767, Math.round(sum / channels)));
	}
	return out;
}

function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}
```

For a complete reusable script, see `example/call/call_on_command.ts`.

## Command Trigger Example

`example/call/call_on_command.ts` listens for `!call` in a 1:1 Talk chat. When
another user sends the command, the example calls that user and streams the
bundled `unity.wav`.

```sh
LINE_AUTH_TOKEN_FILE=/path/to/auth-token.txt \
LINE_DEVICE=ANDROID \
deno run -A example/call/call_on_command.ts
```

You can replace the bundled audio with any 16-bit PCM WAV:

```sh
LINE_AUTH_TOKEN_FILE=/path/to/auth-token.txt \
LINE_DEVICE=ANDROID \
deno run -A example/call/call_on_command.ts ./voice.wav
```

The example intentionally keeps account-specific material outside the
repository:

| Variable | Default | Meaning |
| --- | --- | --- |
| `LINE_AUTH_TOKEN` | | Auth token string. |
| `LINE_AUTH_TOKEN_FILE` | | File containing an auth token. If unset, QR login is used. |
| `LINE_STORAGE_FILE` | | Optional `FileStorage` path. If unset, in-memory storage is used. |
| `LINE_DEVICE` | context-aware | Login device type. Defaults to `ANDROID` with an auth token, otherwise `ANDROIDSECONDARY`. |
| `LINE_VERSION` | package default | LINE app version used in `x-line-application`. |
| `LINE_CALL_DEVNAME` | package default | Device name sent in `fromEnvInfo.devname` during route acquisition. |
| `LINE_CALL_FROM_ENV_INFO` | | JSON string map for the full `fromEnvInfo` route-acquisition field. |
| `LINE_CALL_COMMAND` | `!call` | Chat command that starts the call. |
| `LINE_CALL_WAV` | `./unity.wav` | WAV file to stream. The first CLI arg overrides this. |
| `LINE_CALL_FRAME_MS` | `20` | Opus frame size. |
| `LINE_CALL_PAYLOAD_PREFIX_HEX` | `00` | Native PLANET audio payload prefix. |
| `LINE_CALL_MEDIA_KEY_MODE` | `audio-reverse-stage` | SRTP key selection mode for the observed Android audio path. |
| `LINE_CALL_GAIN` | `1` | PCM gain before Opus encoding. |
| `LINE_CALL_HOLD_MS` | `1000` | Extra hold time after audio finishes. |
| `LINE_CALL_TIMEOUT_MS` | `10000` | Timeout for initial PLANET replies. |
| `LINE_CALL_ANSWER_TIMEOUT_MS` | `60000` | Timeout while waiting for the peer to answer. |
| `LINE_CALL_OPUS_BITRATE` | | Optional Opus bitrate in bit/s. |
| `LINE_CALL_OPUS_BANDWIDTH` | | Optional Opus bandwidth. |

## How the Outgoing Flow Works

An outgoing 1:1 audio call has seven phases.

### 1. Acquire a Call Route

`client.call.acquireRoute({ to, callType: "AUDIO" })` asks LINE for the route
needed to start a call. Native Android includes a small `fromEnvInfo` map with
a `devname` entry at this step. linejs sends a generic device name by default,
and you can override it when a primary-token session is sensitive to the exact
device profile:

```ts
const route = await client.call.acquireRoute({
	to,
	callType: "AUDIO",
	fromEnvInfo: { devname: "Pixel 8" },
});
```

The returned `CallRoute` includes:

- the peer MID and routing metadata;
- IPv4 and sometimes IPv6 PLANET endpoints;
- the UDP port used by the call relay;
- `commParam`, which contains PLANET bootstrap parameters such as `mpkey`;
- call tokens and service-routing fields used inside `setup_req`.

A route is short-lived. Acquire a fresh route for each call attempt unless you
are deliberately replaying a route in a controlled diagnostic environment.

### 2. Connect the PLANET Transport

`PlanetTransport.connect({ route })` parses the route, chooses IPv4 or IPv6,
opens a UDP socket, and prepares local crypto state. No ringing happens at this
stage. It only makes the transport ready to send the first PLANET packet.

During `connect()` linejs generates:

- an ephemeral P-256 keypair for PLANET transport encryption;
- a bootstrap seed and direction label;
- random transaction IDs, channel IDs, call UUIDs, and frame sequence values;
- a local nonce that will be carried in PLANET message headers.

The route's `commParam.mpkey` is decoded as the peer relay public key. linejs
performs ECDH with that key and derives PLANET transport keys with the native
two-stage HKDF chain.

### 3. Send `setup_req`

`transport.inviteDetailed({ to })` sends Cassini `setup_req` inside an encrypted
PLANET frame. This is the packet that starts ringing the peer.

The first outbound SETUP packet is special:

- it uses bootstrap framing;
- it carries the local ephemeral public key in the clear bootstrap prefix;
- it uses a fixed Cassini setup message ID;
- it includes a native-shaped Android user agent;
- it includes a native-shaped media offer used later for SRTP keying;
- it carries a credential derived from the route and call UUID.

`inviteDetailed()` waits for `setup_rsp`. The returned object contains the raw
plaintext, decoded PLANET/Cassini message, and decoded setup response fields
such as the result code and keepalive interval.

### 4. Learn Remote Nonce and Keep the Relay Open

The first server reply carries the relay's local nonce. linejs stores it as the
remote nonce and includes it in later PLANET headers. Without this transition,
later control messages may decrypt but be rejected by the server state machine.

After `setup_rsp`, linejs sends native-style pinhole probes and starts
keepalives using the interval returned by the server. These packets keep the UDP
path warm while the peer is ringing.

### 5. Wait for `conn_req`

When the peer answers, the relay sends Cassini `conn_req`. Use:

```ts
const answer = await transport.waitForAnswerDetailed({
	autoConnRsp: true,
	timeoutMs: 60_000,
});
```

The answer result includes:

| Field | Meaning |
| --- | --- |
| `connReq` | Decoded connection request. |
| `peerAnswerOffer` | Decoded peer media answer when present. |
| `peerOffer` | Alternate decoded peer offer shape when present. |
| `connRspSent` | Whether linejs sent `conn_rsp`. |
| `mediaReady` | Whether SRTP send/receive contexts and RTP target were configured. |

With `autoConnRsp: true`, linejs sends `conn_rsp` and also replies to duplicate
`conn_req` packets while the peer settles. This matters because real clients can
repeat `conn_req` during answer negotiation.

### 6. Send SRTP/Opus Media

Once `answer.mediaReady` is `true`, `transport.send()` sends SRTP-protected RTP
packets. The packet passed to `send()` is the LINE audio payload, not a full RTP
packet. `PlanetTransport` builds RTP, encrypts/authenticates it with SRTP, and
sends it to the negotiated media endpoint.

The working Android audio default is:

- PCM input: 48 kHz, mono, signed 16-bit;
- Opus frame duration: 20 ms;
- samples per Opus frame: 960;
- RTP timestamp step: 960;
- Opus signal: `music` for music clips, `voice` for speech;
- payload prefix: one byte, `00`, before the Opus packet;
- media key mode: `audio-reverse-stage`.

The prefix is important. Native PLANET audio payloads carry a one-byte wrapper
before the Opus frame. If the peer receives SRTP but hears silence, clipped
noise, or repeated artifacts, verify that the payload prefix and frame timing
match the values above.

### 7. Close the Call

`transport.close()` stops keepalives, sends `rel_req` if SETUP was sent, closes
the UDP socket, and ends pending media receive iterators.

Some clients show a terminal call code after the initiator closes the script.
That is expected when the script intentionally tears down the call after sending
its audio.

## PLANET and Cassini

PLANET is the UDP transport used by the modern Android call path. Cassini is the
call-control message layer carried inside PLANET frames.

At a high level:

```txt
UDP datagram
  PLANET frame header
    encrypted planet_msg
      planet_msg_hdr
      sc_msg, cc_msg, or raw control body
        Cassini call-control body
```

linejs handles:

- native-compatible frame headers for bootstrap and regular packets;
- AES-CTR encryption and HMAC authentication for PLANET control packets;
- learning the relay nonce from the first inbound packet;
- Cassini `setup_req`, `setup_rsp`, `conn_req`, `conn_rsp`, `info_req`,
  `info_rsp`, keepalive, and `rel_req`;
- raw pinhole probe packets;
- debug hooks through `PlanetTransportOpts.debug`.

The main call-control messages are:

| Message | Direction | Purpose |
| --- | --- | --- |
| `setup_req` | caller -> relay | Start the call and ring the peer. |
| `setup_rsp` | relay -> caller | Confirm setup, return keepalive timing and ringing state. |
| pinhole probes | caller -> relay | Keep NAT/UDP path usable for call media. |
| keepalive | caller -> relay | Maintain the PLANET session. |
| `conn_req` | relay -> caller | Peer answered; carries media answer material and media endpoint fields. |
| `conn_rsp` | caller -> relay | Acknowledge answer and complete media negotiation. |
| `info_req` | relay -> caller | Miscellaneous control request. linejs answers with `info_rsp`. |
| `rel_req` | caller -> relay | Release/end the call. |

## Keying Model

There are two distinct crypto layers.

### Transport Keys

PLANET control packets are encrypted and authenticated before media starts.
Transport key derivation uses:

- the route's `commParam.mpkey`;
- the local ephemeral P-256 keypair generated by linejs;
- a bootstrap seed and direction label;
- a native-compatible two-stage HKDF chain.

These keys protect PLANET/Cassini signaling. They are not the same keys used for
RTP audio media.

### Media Keys

SRTP media keys are derived after the peer answers. The local SETUP offer
contains media ECDH material, IDs, nonces, and stream material. The peer answer
contains matching media material. linejs derives multiple candidate key
orientations because native clients use direction-sensitive material ordering.

`PlanetTransportOpts.mediaKeyMode` selects which candidate is used:

| Mode | Use |
| --- | --- |
| `current` | Base non-stream-specific key orientation. |
| `reverse-stage` | Reversed base orientation. |
| `sender-material` | Sender-material base orientation. |
| `sender-material-reverse-stage` | Reversed sender-material orientation. |
| `audio-current` | AUDIO stream key derived from `current`. |
| `audio-reverse-stage` | AUDIO stream key derived from `reverse-stage`; working Android audio-send default. |
| `audio-sender-material` | AUDIO stream key derived from sender material. |
| `audio-sender-material-reverse-stage` | AUDIO stream key derived from reversed sender material. |
| `secret-receiver` / `secret-sender` | Direct secret-material modes. |
| `audio-secret-receiver` / `audio-secret-sender` | AUDIO stream key derived from direct secret material. |
| `auto` | Starts with `current` and can switch receive mode when authenticated inbound RTP proves another candidate. |

For outgoing audio examples, prefer `audio-reverse-stage` unless you are testing
a different native path.

## RTP, SRTP, and Audio Payloads

`PlanetTransport.send(payload)` accepts a LINE audio payload. It then:

1. builds an RTP packet using the negotiated payload type and SSRC;
2. increments RTP sequence and timestamp;
3. attaches the native extension profile `0x0240`;
4. encrypts and authenticates with `AES_CM_128_HMAC_SHA1_80`;
5. sends the resulting SRTP datagram to the negotiated media endpoint.

Use `timestampStep` to match your Opus frame duration:

| Frame duration | 48 kHz samples | `timestampStep` |
| --- | ---: | ---: |
| 10 ms | 480 | 480 |
| 20 ms | 960 | 960 |
| 40 ms | 1920 | 1920 |
| 60 ms | 2880 | 2880 |

20 ms is the safest default. If packets are sent too quickly, too slowly, or
with the wrong timestamp step, the peer may hear dropouts, repeated fragments,
or nothing at all.

## Audio Pipeline

LINE call media expects Opus frames in an RTP stream. linejs provides small
building blocks instead of hiding the whole pipeline:

| Helper | Purpose |
| --- | --- |
| `decodeWavSync(bytes)` | Decodes uncompressed 16-bit PCM WAV. |
| `resampleLinear(samples, fromRate, toRate, channels)` | Linear PCM resampler. |
| `bufferSource()` | Splits PCM into timed frames. |
| `bufferSink()` | Collects decoded PCM frames. |
| `streamSource()` / `streamSink()` | Adapt Web streams to call audio sources/sinks. |
| `opusCodecFactory()` | Loads `opusscript` and creates Opus encoders/decoders. |

Recommended sender pipeline:

```txt
input audio
  -> decode to signed 16-bit PCM
  -> downmix to mono
  -> resample to 48 kHz
  -> optional gain
  -> split into 20 ms frames
  -> Opus encode
  -> prepend 00
  -> transport.send(..., { timestampStep: 960 })
```

`decodeWavSync()` only supports uncompressed 16-bit PCM WAV. Convert other
formats before passing them to linejs:

```sh
ffmpeg -i input.mp3 -ac 1 -ar 48000 -sample_fmt s16 output.wav
```

For speech, `signal: "voice"` is reasonable. For music or mixed clips, use
`signal: "music"`.

```ts
const encoder = (await opusCodecFactory()).newEncoder({
	sampleRate: 48_000,
	channels: 1,
	frameDurationMs: 20,
	signal: "music",
	bitrate: 32_000,
});
```

## Receiving Media

`transport.receive()` yields authenticated peer media payloads after
`mediaReady` is true:

```ts
for await (const payload of transport.receive()) {
	// payload is the decrypted LINE audio payload.
	// Strip native wrappers before feeding raw Opus to a decoder if needed.
}
```

When `mediaKeyMode: "auto"` is used, receive-side SRTP can switch to a candidate
key mode after a packet authenticates. Send-side mode is still selected from the
configured mode, so outgoing examples should set the known working mode
explicitly.

## Incoming Call Events

`client.listen({ talk: true })` emits call notifications decoded from Talk
operations:

```ts
client.on("call:incoming", ({ callMid, from, kind }) => {
	console.log("incoming call", { callMid, from, kind });
});

client.on("call:cancel", ({ callMid, from, reason }) => {
	console.log("call canceled", { callMid, from, reason });
});

client.listen({ talk: true, square: false });
```

These are notifications, not a complete inbound media implementation. Answering
an incoming call requires a separate native-compatible answer flow and is not
wrapped as a stable high-level API yet.

## `CallSession`

`CallSession` is a transport-neutral wrapper that can drive route acquisition,
transport connect, optional invite, optional wait-for-answer, and audio
send/receive through a `CallTransport`.

```ts
const session = client.call.startSession({
	to,
	kind: "AUDIO",
	transport: new PlanetTransport({
		localMid,
		mediaKeyMode: "audio-reverse-stage",
	}),
});

await session.start();
await session.sendBuffer({
	samples,
	sampleRate: 48_000,
	channels: 1,
});
await session.end();
```

`CallSession` sends exactly what the configured codec returns. For PLANET audio
that must include the native `00` payload prefix, either use explicit
`PlanetTransport` calls as shown above or wrap the codec/transport so the prefix
is added before `send()`.

## Debugging

Enable `debug` on the transport to inspect signaling and media state without
logging secrets:

```ts
const transport = new PlanetTransport({
	localMid,
	mediaKeyMode: "audio-reverse-stage",
	debug(event) {
		console.log("[planet]", event);
	},
});
```

Useful events include:

| Event | Meaning |
| --- | --- |
| `send` / `recv` | PLANET control packet sent or received. |
| `decrypt_ok` / `decrypt_fail` | Control packet authentication/decryption status. |
| `plain_shape` | Decoded protobuf field shape. |
| `media_configured` | SRTP keys, RTP endpoint, payload type, and SSRC selected. |
| `media_send` | One SRTP media packet was sent. |
| `media_recv` | One SRTP media packet was authenticated and decrypted. |
| `media_decrypt_fail` | Inbound RTP did not authenticate under current candidates. |

Avoid logging auth tokens, MIDs, full routes, full decrypted packets, or key
material in public examples and issue reports.

## Troubleshooting

| Symptom | Likely cause | What to check |
| --- | --- | --- |
| Call never rings | No `setup_req`, stale route, wrong peer, or route acquisition failed. | Acquire a fresh route, call `inviteDetailed()`, verify `route.fakeCall` is false. |
| `acquireCallRoute(/V4)` returns `INVALID_STATE` | LINE rejected the account, peer, or device state before signaling started. | Verify the command came from a callable 1:1 friend chat, do not call yourself, match `LINE_DEVICE` to the token's device family, and set `LINE_CALL_DEVNAME` or `fromEnvInfo.devname` to the primary device model. |
| `PLANET reply timeout` before ringing | UDP path or transport key bootstrap failed. | Check IPv4/IPv6 choice, network, route endpoint, and `commParam.mpkey`. |
| Peer answers but `mediaReady` is false | `conn_req` did not contain decodable media material. | Inspect `answer.peerAnswerOffer`, `answer.peerOffer`, and debug `plain_shape`. |
| Peer hears silence | SRTP may be valid but payload shape is wrong. | Use `mediaKeyMode: "audio-reverse-stage"`, prefix Opus with `00`, and send 20 ms frames. |
| Peer hears noisy/choppy audio | Wrong frame timing, bad sample conversion, or missing prefix. | Use 48 kHz mono PCM, 20 ms Opus, `timestampStep: 960`, and real-time sleeps. |
| Audio plays too fast or too slow | RTP timestamp step does not match frame duration. | Use `sampleRate * frameMs / 1000`. |
| Call ends after audio finishes | Script closed the transport. | Increase hold time or keep the transport open. |
| Terminal call code after close | The script initiated release. | Expected for short scripted calls. |
| `decodeWavSync` rejects the file | File is compressed or not 16-bit PCM WAV. | Convert with ffmpeg to `-ac 1 -ar 48000 -sample_fmt s16`. |
| Permission error in Deno | Missing runtime permission. | Use `deno run -A` for examples or grant `--allow-net --allow-read --allow-env --allow-run` as needed. |

## E2EE and Privacy Notes

Talk message E2EE and call media security are separate systems. A Talk message
that triggers `!call` may be E2EE-decrypted by linejs before your handler sees
it, but the call itself uses PLANET transport crypto and SRTP media crypto.

Do not derive call media keys from Talk message E2EE material. Do not publish:

- auth tokens;
- storage files;
- personal MIDs;
- captured `CallRoute` objects;
- decrypted PLANET plaintexts from real accounts;
- SRTP or PLANET key material.

Examples in this repository use environment variables and generic paths so they
can be copied without exposing account-specific state.

## Group Calls

Group-call APIs are currently control-plane helpers:

```ts
const created = await client.call.createGroupCallUrl({ /* request */ });
const urls = await client.call.listGroupCallUrls();
const info = await client.call.getGroupCallUrl("ticket");

await client.call.updateGroupCallUrl({ /* request */ });
await client.call.deleteGroupCallUrl({ /* request */ });
await client.call.joinChatByUrl("ticket");
await client.call.invite({ /* request */ });
await client.call.kick({ /* request */ });
```

These APIs manage group-call URLs and membership actions. They do not expose a
group-call media mixer abstraction.

## Test Coverage

The call implementation is covered by focused protocol tests:

- PLANET frame parsing and crypto;
- Cassini schema packing/decoding;
- SRTP encrypt/decrypt;
- RTP/RTCP helpers;
- SDP, SIP, MIKEY, ICE, and STUN helpers;
- `CallSession` state transitions and stream plumbing;
- Opus encode/decode integration when the optional codec dependency is
  available.

The public example is intentionally small, but it uses the same primitives as
the tested implementation.

## Need Help?

If you run into call-related issues, please ask on the LINEJS Discord:
[https://discord.gg/evex](https://discord.gg/evex).
