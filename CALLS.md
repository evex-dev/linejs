# Calls

LINE call architecture: Thrift control plane (`acquireCallRoute`,
group-call URL CRUD, status) + Andromeda media plane.

## Status

- Control plane: shipped (`client.call.*`, `call:incoming`/`call:cancel`
  events).
- Audio pipeline: shipped (`AudioSource`/`AudioSink`/`PcmFrame`, WAV
  decoder, resampler, `CodecFactory`).
- `CallSession` with pluggable `CallTransport`: shipped (transport is
  the stub).
- Andromeda transport: not shipped.

## Andromeda wire format (libandromeda.so RE)

Standard SIP + SRTP + Opus.

- Transport: SIP-over-UDP to `CallRoute.cscf.host:port`. Some paths
  fall back to TCP / sigcomp.
- SIP methods used: REGISTER, INVITE, ACK, BYE, CANCEL, PRACK,
  SUBSCRIBE, NOTIFY, MESSAGE, OPTIONS.
- Auth: HTTP Digest (`WWW-Authenticate: Digest`,
  `Proxy-Authorization`). The `fromToken` from `CallRoute` is the
  credential.
- Media: RTP/SRTP. Key management: MIKEY-PSK (`a=key-mgmt:mikey`).
  RTP extensions: CVO (`a=extmap:* urn:3gpp:video-orientation`), RSID.
- Codec: Opus only on the call wire. libandromeda.so embeds libopus
  (`opus_encoder_create`, `opus_decode`, …).

Mixer protocol (multi-party group calls) layers on top of RTP:
`vns_stream_audio_mixer_*` symbols. `jup_audio_mixer_*` for 1:1.

## What v3 needs

A `CallTransport` impl that:
1. SIP REGISTER against `cscf.host:port` using `fromToken` as digest
   credential.
2. SIP INVITE with SDP offering Opus + MIKEY-PSK keying.
3. Handle 200 OK + ACK to complete the dialog.
4. Open RTP/SRTP socket pair to `mix.host:port` per the negotiated SDP.
5. Encode mic PCM → Opus → SRTP. Decode incoming SRTP → Opus → PCM.

All of this is standard. Reuse candidates: `npm:sip` for SIP parsing,
WASM Opus, hand-rolled MIKEY-PSK + SRTP (small).

## Thrift control-plane (already wrapped)

`acquireCallRoute`, `acquireGroupCallRoute`, `acquireOACallRoute`,
`acquirePaidCallRoute`, `lookupPaidCall`, `getCallStatus`,
`getGroupCall`, `getGroupCallUrl{Info,s}`, `createGroupCallUrl`,
`updateGroupCallUrl`, `deleteGroupCallUrl`, `inviteIntoGroupCall`,
`kickoutFromGroupCall`, `joinChatByCallUrl`.

Enums: `Pb1_D4` `{AUDIO=1, VIDEO=2, FACEPLAY=3}`,
`Pb1_EnumC13010h1` `{NEW=1, PLANET=2}`.

`CallRoute` = `{fromToken, callFlowType, voipAddress, voipUdpPort,
voipAddress6, voipTcpPort, cscf:CallHost, mix:CallHost, hostMid,
capabilities, proto}`.

## Smali pointers

- `smali_classes6/com/linecorp/andromeda/core/` — Java/JNI surface.
  142 native methods exported from libandromeda.so. The SIP/SRTP/Opus
  stack lives inside the .so.
- `smali_classes3/com/linecorp/voip2/service/` — UI service factories
  layered on top.

## Next concrete step

Write a SIP REGISTER probe in linejs that:
1. Calls `client.call.acquireRoute({to: peerMid})` to get a real route.
2. Opens a UDP socket to `route.cscf.host:port`.
3. Sends a SIP REGISTER with `fromToken` as digest password.
4. Captures the 401 challenge + response.

That alone unblocks the rest: once REGISTER succeeds, INVITE/SDP is
the same pattern.
