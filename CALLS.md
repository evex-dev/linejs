# Calls (v3 work) — surface survey

LINE has **two layers** for voice/video calls:

1. **Thrift control plane** (existing in `packages/types/thrift.ts`) — talks to
   `LegyTalkService` to allocate the call route, manage group-call URLs, query
   status, etc. linejs already has the schema; no wrappers shipped.
2. **Andromeda media plane** — LINE's own native VoIP stack
   (`com.linecorp.andromeda` package, JNI into `lib*.so`). Signaling +
   ICE/SRTP + Opus/H.264 negotiation lives there. This is the hard part.

## Thrift control-plane RPCs (already in schema)

| RPC | Purpose |
|---|---|
| `acquireCallRoute(to, callType, fromEnvInfo)` | Mint a `CallRoute` ({fromToken, cscf:CallHost, mix:CallHost, hostMid, capabilities, proto}) for a 1:1 call. callType ∈ AUDIO/VIDEO/FACEPLAY |
| `acquireGroupCallRoute` | Same for group calls |
| `acquireOACallRoute` | OA (official-account) calls |
| `acquirePaidCallRoute` / `lookupPaidCall` | PSTN paid-call routes |
| `getCallStatus` | Poll current call state |
| `getGroupCall` / `getGroupCallUrlInfo` / `getGroupCallUrls` | Group-call meeting metadata |
| `createGroupCallUrl` / `updateGroupCallUrl` / `deleteGroupCallUrl` | Group-call URL CRUD |
| `inviteIntoGroupCall` / `kickoutFromGroupCall` | Group-call membership |
| `joinChatByCallUrl` | Join a chat via a call URL |

Enum: `Pb1_D4` = `{AUDIO=1, VIDEO=2, FACEPLAY=3}` (callType).
Enum: `Pb1_EnumC13010h1` = `{NEW=1, PLANET=2}` (callFlowType).
Enum: `Pb1_EnumC13251y5` = `{STANDARD=1, CONSTELLA=2}` (proto).

CallRoute returns:
- `fromToken: string` — caller session token
- `cscf: CallHost {host, port, zone}` — signaling endpoint
- `mix: CallHost` — media-mixer endpoint
- `hostMid: string` — who serves this route
- `capabilities: list<string>` — feature flags

Push side: `notificationIncomingCall` is the operation type pushed to the
callee. Existing in the Operation enum already.

## Media plane — Andromeda (smali_classes6/com/linecorp/andromeda)

Native-backed VoIP runtime. Public Java surface:

- `core.UniverseCore` — top-level controller. Native methods include
  `nCancelCall(String, String, int)`, `nCurrentTime()`, plus session lifecycle.
- `core.session.CallSession` extends `Session<dx.b>` — one 1:1 call instance.
  - `CallSessionParam`: `kind` (`CallKind`), `subSystem` (`CallSubSystem`),
    `entertainment` (`Entertainment`), `serviceTicketData: String`,
    `exchangeData: String`, `featureShareIds: int[]`,
    `featureShareExclusives: bool[]`, `locale`, `aggrSetupNet`,
    `disasterRecoveryEnabled`.
  - `TargetInfo {uri: String}` — peer SIP-ish URI.
  - `PeerInfo {zone: String}` — peer signaling zone.
- `core.AndromedaConnectionService` — connection lifecycle.
- `core.Environment` — native env init/destroy + worker thread.
- `core.AndromedaCoreLogger` — native logger.
- `jni.{AudioJNIImpl, BufferJNIImpl, DeviceJNIImpl}` — JNI shims.
- `audio.AudioManager` — `nAddToneResource`, ringback playback.

## Voip2 service layer (smali_classes3/com/linecorp/voip2/service/)

UI/service factories layered on top of Andromeda. One module per call kind:

| dir | what |
|---|---|
| `freecall/` | 1:1 LINE-to-LINE call |
| `groupcall/` | Group/multiparty (also drives `GroupCallPreviewActivity`) |
| `oacall/` | Official-account calls |
| `livetalk/` | LIVE talk feature |
| `pstncall/` | LINE Out / PSTN |

`VoIPServiceActivity` is the umbrella activity.

## What v3 needs to ship (rough)

In order of difficulty:

1. **Thrift wrappers** — easy: just wrap `acquireCallRoute`,
   `getCallStatus`, `createGroupCallUrl`, etc. in `client/features/call.ts`.
   linejs already has the args/result types. This is a few hours of code.
2. **Incoming-call event hook** — `notificationIncomingCall` already arrives
   via the polling stream; surface it as a typed `client.on("call:incoming")`
   event with the call params parsed.
3. **Group-call URL flows** — create/share/join. Pure REST + Thrift.
4. **Actually sending/receiving media** — needs an Andromeda-compatible
   client. Andromeda is **proprietary**; the native protocol (SRTP variants,
   key exchange, mixer signaling) is undocumented. Either:
   - Wrap the native lib (extract `libline_voip.so` + write Node FFI
     bindings, ~weeks of work, and Android-only)
   - Implement a clean-room Andromeda client on top of standard WebRTC
     (substantial RE effort; capability flags suggest LINE may have parts
     that map to standard SDP, but the signaling layer is custom)
   - Bridge through a real LINE Android instance via Frida (works today,
     doesn't help non-Android users)

## Practical plan

Ship in two stages:

- **v2.11.0 (shipped)**: control-plane only — typed wrappers for the 14
  call-related Thrift RPCs, incoming-call event surface, group-call URL
  CRUD. Useful for bots that want to *manage* calls (kick, invite, get
  status, create meeting URLs) without sending audio/video.
- **v3.0 (later)**: reserved for the day media plane works end-to-end.
  Until then we stay on v2.x. Path forward: Frida trace of a real
  freecall to capture the `cscf`/`mix` wire protocol, then decide
  between native-lib-wrap vs clean-room.

## Files to grep next

- `smali_classes3/com/linecorp/voip2/access/` and `dependency/` — likely
  call-setup glue between Thrift acquireCallRoute and Andromeda.
- `smali_classes6/com/linecorp/andromeda/core/AndromedaConnectionService.smali`
  — the connection lifecycle entry point.
- libwebrtc/libtoneplayer references — check what `lib/arm64-v8a/` of the
  apk holds; the apktool decompile drops natives, so a fresh extraction
  of `base.apk` via `unzip` is needed.
