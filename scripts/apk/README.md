# APK → linejs Thrift sync pipeline

Pull a fresh LINE Android APK and refresh `packages/types/thrift.ts` +
`packages/types/line_types.ts` from the live bytecode. The pipeline is
non-destructive: anything it can't auto-resolve safely is reported (not
applied), and re-running on a future APK should always succeed.

## Quickstart

```powershell
# 1. fetch the latest LINE APK bundle from APKMirror (extracts inner APKs).
python scripts\fetch_line_apk.py
# → apks\jp.naver.line.android\<version>\base.apk
#
# or grab a specific version / variant:
#   python scripts\fetch_line_apk.py --version 26.6.2
#   python scripts\fetch_line_apk.py --variant arm64+armv7
#
# alternative: adb pull from a connected device:
#   adb shell pm path jp.naver.line.android   # prints /data/.../base.apk
#   adb pull <that path> base.apk

# 2. sync linejs's Thrift schema from that base.apk
deno run -A scripts\apk\sync_from_apk.ts --apk apks\jp.naver.line.android\<version>\base.apk
```

`sync_from_apk.ts` runs five steps:

1. **decompile** — apktool baksmali (smali only; ~90s for LINE).
2. **extract** — walk the smali tree, recover Thrift type defs from `<clinit>`
   register state, diff against `packages/types/thrift.ts`, apply (additive new
   entries) + (in-place rewrites for direct-name mismatches).
3. **regenerate** `line_types.ts` via `scripts/thrift/gen_typedef.ts`.
4. **fmt** `packages/types/`.
5. **type-check + test** to confirm linejs still compiles.

## What the extractor does and does _not_ auto-apply

| change kind                                                         | auto-applied                                  | rationale                                                                                                                                        |
| ------------------------------------------------------------------- | --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| new enum value                                                      | yes                                           | additive, safe                                                                                                                                   |
| new struct field                                                    | yes                                           | additive, safe                                                                                                                                   |
| new type (enum / struct)                                            | yes (canonical names only)                    | additive                                                                                                                                         |
| field ttype change _on direct-name match_                           | yes                                           | high confidence                                                                                                                                  |
| field fid renumber _on direct-name match_                           | yes                                           | high confidence                                                                                                                                  |
| field rename _on direct-name match_                                 | yes                                           | high confidence                                                                                                                                  |
| field change on Jaccard-only match                                  | **no** (reported)                             | the obfuscated APK class might map to the wrong linejs entry; small structs (`{request}`, `{success}`) are particularly prone to false positives |
| enum value rename                                                   | **no** by default (`--rewrite-enums` opts in) | high false-positive rate on small enums                                                                                                          |
| obfuscated R8-synthetic class names (`a`, `j4`, …) as _new_ entries | **no**                                        | adds noise without a canonical name                                                                                                              |

The full mismatch list — both applied and skipped — is dumped to
`<decompiled-dir>/extract_report.json`.

## Robustness against R8/ProGuard shading

LINE re-runs R8 each build, which renames the Thrift library's own classes
(`TField`, `TBase`, `TEnum`) to single letters that differ between builds. The
extractor does **not** depend on those names: it identifies Thrift structs
structurally by the unique constructor signature `<init>(Ljava/lang/String;BS)V`
on `<clinit>`-allocated field descriptors, and Thrift enums by the `enum` class
modifier plus `<init>(Ljava/lang/String;II)V` self-instantiations. Each call's
three register arguments yield the `(name, ttype, fid)` triple of the field, or
`(name, ordinal, value)` of the enum member. Both signals are wire-format
invariants — they cannot change without breaking the Thrift binary protocol
itself.

For class names, the extractor uses what the APK retained:

- Canonical packages (`com.linecorp.square.protocol.thrift.*`) are unobfuscated,
  so structs there match linejs entries by direct name.
- Heavily-obfuscated packages (e.g. `fh8.u6` = `ChatRoomBGM`) match linejs
  entries through content-based Jaccard on field-name sets, with collision
  resolution: each linejs target keeps only the highest-scoring APK candidate to
  prevent dozens of small `*_args/_result` classes from collapsing onto one
  linejs entry.

Inner class prefixes are preserved (`SquareService$sendMessage_args` → linejs's
`SquareService_sendMessage_args`) so methods of different services don't collide
on identical inner names.

## Files

| file                  | role                                                                                                      |
| --------------------- | --------------------------------------------------------------------------------------------------------- |
| `decompile.ts`        | runs apktool (smali) and/or jadx (Java) on an APK                                                         |
| `extract_thrift.ts`   | smali → IDL → diff/apply against `thrift.ts`; verifies type-mismatches                                    |
| `extract_services.ts` | best-effort RPC catalog from `*$Client.smali` (Square family only — `TalkService.Client` is fully shaded) |
| `sync_from_apk.ts`    | top-level orchestrator: decompile → extract → regen → check                                               |

## Re-running on a future build

After LINE ships a new APK:

```powershell
python scripts\fetch_line_apk.py
deno run -A scripts\apk\sync_from_apk.ts --apk apks\jp.naver.line.android\<new-version>\base.apk
```

The diff against the previous run is purely additive in the common case (new
enum values for new LINE features, new struct fields, etc.) so the re-run is
safe and idempotent.
