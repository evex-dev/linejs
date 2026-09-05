# APK → linejs Thrift sync pipeline

Pull a fresh LINE Android APK and refresh `packages/types/thrift.ts` +
`packages/types/line_types.ts` from the live bytecode. The pipeline is
non-destructive: anything it can't auto-resolve safely is reported (not
applied), and re-running on a future APK should always succeed.

## Requirements

`apktool` and (optionally) `jadx` on `PATH` — on Arch, `android-apktool` (AUR)
and `jadx` (extra); elsewhere, point `APKTOOL_JAR` / `JADX_BIN` at your own
copies. Java 17+ and Deno 2.x. `fetch_line_apk.py` is stdlib-only, so any Python
3 works.

Decompiled output defaults to `apks/decompiled/<apk-stem>/`, which the repo's
`apks/` ignore rule already covers — a LINE smali tree is ~1.3 GB.

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

Everything the extractor proposes rests on one _pairing_ — "this APK class is
that linejs entry" — and how much that pairing is worth decides what may be
written without review. After R8 the APK class is usually called `h` or `e0`, so
there are three grades of evidence:

| tier | how the pairing was made | worth                                                                                                                                                                 |
| ---- | ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A    | canonical name           | an identity — LINE does not obfuscate `com.linecorp.square.protocol.thrift.*`                                                                                         |
| B    | wire RPC string          | strong, but keyed by the R8 short name, and short names collide across the whole app — so the binding is only kept when the two classes' field names actually overlap |
| C    | field-name overlap       | good on a 100-member enum, worthless on a `{request}`-shaped `_args`                                                                                                  |

| change kind                                                         | auto-applied                                                                                      | rationale                                                                                                                                                                       |
| ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| new enum value, enum matched at tier A                              | yes                                                                                               | additive, and the pairing is an identity                                                                                                                                        |
| new enum value, enum matched at tier B/C                            | only if the enum has ≥ `--enum-add-min-members` (16)                                              | on a 112-member enum a name overlap cannot be coincidence; on a 6-member one it means nothing                                                                                   |
| new struct field, struct matched at tier A                          | yes                                                                                               | additive, and the pairing is an identity                                                                                                                                        |
| new struct field, struct matched at tier B                          | only above `--min-overlap` (0.6) **and** sharing ≥ `--min-shared-fields` (3) names                | the RPC binding is asserted by short name, so it carries an add only once the content agrees and the structs are wide enough for agreement to mean something                    |
| new struct field, struct matched at tier C                          | **no** (reported)                                                                                 | an add invents a slot on the pairing alone. A wrong one writes a field no LINE build ever sent — this is how `establishE2EESession_args` was proposed three coin-balance fields |
| new type (enum / struct)                                            | yes (canonical names only)                                                                        | additive                                                                                                                                                                        |
| field ttype / fid / name change at tier A                           | yes                                                                                               | high confidence                                                                                                                                                                 |
| field change at tier B/C                                            | only above `--min-overlap` (0.6), and tier C also needs a field-name set unique on **both** sides | uniqueness alone is not enough: two structs with disjoint field names are each unique                                                                                           |
| any field change across disjoint field-name sets                    | **no**, at every tier                                                                             | disjoint names refute the premise that these are the same struct                                                                                                                |
| enum value rename                                                   | **no** by default (`--rewrite-enums` opts in)                                                     | high false-positive rate on small enums                                                                                                                                         |
| obfuscated R8-synthetic class names (`a`, `j4`, …) as _new_ entries | **no**                                                                                            | adds noise without a canonical name                                                                                                                                             |

The gates live in `gates.ts` and are unit-tested against real pairings from the
26.14.0 extraction. `--min-overlap`, `--min-shared-fields` and
`--enum-add-min-members` move the floors if you want to see more (or less)
applied. The two struct floors work as a pair: the ratio catches pairings that
disagree, the absolute count catches pairings too small to agree about anything.

The full picture — what was applied, what was held and why, and the pairing
behind each mismatch — is dumped to `<decompiled-dir>/extract_report.json`
(`diff`, `heldAdds`, `mismatches`).

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
