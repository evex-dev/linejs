# Calls

`client.call.*` wraps the LINE call control plane (Thrift /V4) and
provides a `CallSession` that drives an `AndromedaTransport` for the
media plane.

## Control plane

```ts
// Allocate a 1:1 call route (returns cscf/mix/fromToken/stnpk).
const route = await client.call.acquireRoute({
	to: "u<peer-mid>",
	callType: "AUDIO", // or "VIDEO" | "FACEPLAY"
});

// Group-call URLs
const url = await client.call.createGroupCallUrl({ /* ... */ });
const urls = await client.call.listGroupCallUrls();
await client.call.deleteGroupCallUrl({ /* ... */ });

// Incoming-call event
client.on("call:incoming", ({ callMid, from, kind }) => {
	console.log("incoming call from", from, "type", kind);
});
```

## Media plane

```ts
import {
	AndromedaTransport,
	bufferSource,
	bufferSink,
	decodeWavSync,
} from "@evex/linejs";

// Plug in an Opus codec (caller supplies a WASM impl)
client.call.setCodecFactory(myOpusCodecs);

const session = client.call.startSession({
	to: "u<peer-mid>",
	kind: "AUDIO",
	transport: new AndromedaTransport({ localMid: client.profile.mid }),
});

await session.start(); // acquires route + REGISTER + INVITE + ACK

// Play a WAV file into the call
const wav = await Deno.readFile("./greeting.wav");
const pcm = decodeWavSync(wav);
await session.sendBuffer(pcm);

// Receive peer audio
const sink = bufferSink();
await session.receiveInto(sink);
// sink.frames contains PCM frames

await session.end();
```

## Audio pipeline

- `PcmFrame { samples: Int16Array, sampleRate, channels }` — base unit.
- `bufferSource({samples, sampleRate, frameDurationMs?})` — split a
  PCM buffer into 20-ms frames.
- `bufferSink()` / `streamSink(stream)` — receive frames.
- `decodeWavSync(bytes)` — bundled 16-bit PCM WAV decoder. For mp3,
  pass any WASM mp3 decoder via `session.sendFile({bytes, decode})`.
- `resampleLinear(samples, fromRate, toRate, channels)` — quick
  resample.

## Codec

`CodecFactory` is caller-supplied so linejs doesn't pin a specific
Opus WASM. Pattern:

```ts
import type { CodecFactory } from "@evex/linejs";

const myOpusCodecs: CodecFactory = {
	newEncoder({ sampleRate, channels }) {
		// Return an AudioEncoder backed by your Opus binding
		// (encode(pcm) → Uint8Array | null)
	},
	newDecoder({ sampleRate, channels }) {
		// Return an AudioDecoder
	},
};

client.call.setCodecFactory(myOpusCodecs);
```

## Wire format

LINE Android calls run standard protocols:

| Layer | Spec |
|---|---|
| Signaling | SIP/2.0 over UDP, pjsip-shaped |
| Auth | HTTP Digest, `CallRoute.fromToken` as password |
| SDP | RFC 4566, `m=audio P RTP/SAVP 96`, Opus 48 kHz/2 ch |
| Key mgmt | MIKEY-PKE (RFC 3830 §6.1), peer key = `CallRoute.stnpk` |
| Media | SRTP `AES_CM_128_HMAC_SHA1_80` (RFC 3711) |
| Codec | Opus only on the wire |

`AndromedaTransport` implements all of this. Use SDES (`a=crypto:`) by
default; when `CallRoute.stnpk` is set the offer switches to MIKEY-PKE.
