# Calls

LINE call architecture: Thrift control plane (`acquireCallRoute`,
group-call URL CRUD, status) + Andromeda native media plane (UDP/SRTP
to `cscf`/`mix` from the route).

## Status

- Control plane: shipped. `client.call.*` wraps the 14 Thrift RPCs;
  `client.on("call:incoming" | "call:cancel", ...)` surfaces the push
  events.
- Audio pipeline: shipped. `AudioSource`/`AudioSink`/`PcmFrame` +
  buffer/stream/file sources, WAV decoder, linear resampler,
  `CodecFactory` (caller supplies Opus impl).
- `CallSession`: shipped. Acquires route, drives a pluggable
  `CallTransport`, pumps PCM through the codec.
- Media transport: stub. `stubTransport.connect()` throws. Real
  Andromeda transport not yet implemented — that's the next step.

## Thrift control-plane RPCs (in schema)

`acquireCallRoute`, `acquireGroupCallRoute`, `acquireOACallRoute`,
`acquirePaidCallRoute`, `lookupPaidCall`, `getCallStatus`,
`getGroupCall`, `getGroupCallUrl{Info,s}`, `createGroupCallUrl`,
`updateGroupCallUrl`, `deleteGroupCallUrl`, `inviteIntoGroupCall`,
`kickoutFromGroupCall`, `joinChatByCallUrl`.

Enums:
- `Pb1_D4` callType: `AUDIO=1, VIDEO=2, FACEPLAY=3`
- `Pb1_EnumC13010h1` callFlowType: `NEW=1, PLANET=2`

CallRoute = `{fromToken, callFlowType, voipAddress, voipUdpPort, …,
cscf:CallHost, mix:CallHost, hostMid, capabilities, proto}`.

## Andromeda (media plane, not yet wired)

Smali tree: `smali_classes6/com/linecorp/andromeda/`.

- `core.UniverseCore` — top-level controller (native `nCancelCall`, …)
- `core.session.CallSession` — `CallSessionParam {kind, subSystem,
  entertainment, serviceTicketData, exchangeData, featureShareIds,
  locale, aggrSetupNet, disasterRecoveryEnabled}`,
  `TargetInfo {uri}`, `PeerInfo {zone}`.
- `core.AndromedaConnectionService` — connection lifecycle.
- `core.Environment` — native init/destroy.
- `jni.{AudioJNIImpl, BufferJNIImpl, DeviceJNIImpl}` — JNI shims.
- `audio.AudioManager` — tone resources.

`smali_classes3/com/linecorp/voip2/service/` has the UI service
factories (freecall/groupcall/oacall/livetalk/pstncall) layered on top.

Native lib name TBD — needs `unzip` on `base.apk` (apktool drops
native libs).
