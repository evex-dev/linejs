"""Fetch the latest (or a specific) LINE Android APK bundle from APKMirror via pure HTTP.

The APKMirror "Download APK Bundle" flow uses a 4-step key chain:

    1. Landing page          /apk/line-corporation/line/
       → version slugs (`line-calls-messages-26-6-2-release/` …)
    2. Version page          /apk/.../line-calls-messages-X-Y-release/
       → variant rows; pick the row matching the requested architecture
    3. Variant download page /apk/.../line-calls-messages-X-Y-android-apk-download/
       → an anchor `?key=<40-char-hex>` labeled "Download APK Bundle"
    4. Key page              /apk/.../download/?key=<40-char-hex>
       → a "click here" anchor pointing at
         /wp-content/themes/APKMirror/download.php?id=<id>&key=<another-40-hex>
    5. download.php URL      → 302 redirect to a Cloudflare R2 signed URL → binary

No JavaScript is involved — every step is a static-HTML fetch that we parse
with regex. Cookies are kept across requests via http.cookiejar.

`.apkm` is a signed zip; we extract base.apk + split_config.*.apk so the rest
of the tooling (jadx, apktool, decompile.py) operates on real APKs.

Usage:
    python scripts/fetch_line_apk.py                            # latest, arm64-v8a
    python scripts/fetch_line_apk.py --version 26.6.2           # specific version
    python scripts/fetch_line_apk.py --variant arm64+armv7      # universal variant
    python scripts/fetch_line_apk.py --no-extract               # keep only .apkm
    python scripts/fetch_line_apk.py --resolve-only             # print URL, don't fetch
"""
from __future__ import annotations

import argparse
import html
import re
import sys
import zipfile
from http.cookiejar import CookieJar
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.request import HTTPCookieProcessor, Request, build_opener

ROOT = Path(__file__).resolve().parent.parent
APKS_DIR = ROOT / "apks"

PACKAGE = "jp.naver.line.android"
HOST = "https://www.apkmirror.com"
APP_LANDING = f"{HOST}/apk/line-corporation/line/"

VARIANT_LABELS = {
    "arm64-v8a": "arm64-v8a",
    "arm64+armv7": "arm64-v8a + armeabi-v7a",
}

USER_AGENT = (
    "Mozilla/5.0 (Linux; Android 16; Pixel 6a) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/148.0.7778.96 Mobile Safari/537.36"
)


def log(msg: str) -> None:
    print(f"[fetch_line_apk] {msg}", flush=True)


def make_opener():
    cj = CookieJar()
    opener = build_opener(HTTPCookieProcessor(cj))
    opener.addheaders = [
        ("User-Agent", USER_AGENT),
        ("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"),
        ("Accept-Language", "en-US,en;q=0.5"),
    ]
    return opener


def fetch_text(opener, url: str, *, timeout: float = 30.0) -> str:
    req = Request(url)
    with opener.open(req, timeout=timeout) as resp:
        return resp.read().decode("utf-8", errors="replace")


def stream_to_file(opener, url: str, out: Path, *, expected_min_bytes: int = 1_000_000) -> int:
    """Stream a (possibly redirecting) URL to `out`. Returns bytes written.
    Prints progress every ~5 MB."""
    req = Request(url)
    out.parent.mkdir(parents=True, exist_ok=True)
    written = 0
    next_report = 5 * 1024 * 1024
    chunk_size = 1 << 20  # 1 MiB

    with opener.open(req, timeout=300) as resp, out.open("wb") as fp:
        total = resp.headers.get("Content-Length")
        total_int = int(total) if total and total.isdigit() else None
        if total_int:
            log(f"  Content-Length: {total_int / 1024 / 1024:.1f} MB")
        while True:
            buf = resp.read(chunk_size)
            if not buf:
                break
            fp.write(buf)
            written += len(buf)
            if written >= next_report:
                if total_int:
                    log(f"  ... {written / 1024 / 1024:6.1f} / {total_int / 1024 / 1024:.1f} MB")
                else:
                    log(f"  ... {written / 1024 / 1024:6.1f} MB")
                next_report += 5 * 1024 * 1024

    if written < expected_min_bytes:
        raise RuntimeError(
            f"downloaded only {written} bytes from {url}; "
            f"expected at least {expected_min_bytes}"
        )
    return written


# -----------------------------------------------------------------------------
# Step 1: enumerate versions
# -----------------------------------------------------------------------------

_VERSION_LINK_RE = re.compile(
    r'href="(/apk/line-corporation/line/line-calls-messages-([0-9.\-]+)-release/)"'
)


def list_versions(opener) -> list[tuple[str, str]]:
    body = fetch_text(opener, APP_LANDING)
    seen: set[str] = set()
    out: list[tuple[str, str]] = []
    for m in _VERSION_LINK_RE.finditer(body):
        ver = m.group(2).replace("-", ".")
        if ver in seen:
            continue
        seen.add(ver)
        out.append((ver, HOST + m.group(1)))
    return out


# -----------------------------------------------------------------------------
# Step 2: pick variant on a version page
# -----------------------------------------------------------------------------

_TABLE_ROW_RE = re.compile(
    r'<div class="table-row[^"]*"[^>]*>(.*?)</div>\s*</div>',
    re.S,
)
_VARIANT_HREF_RE = re.compile(
    r'href="(/apk/line-corporation/line/[^"]+/[^"]+-android-apk-download/)"'
)
_ARCH_RE = re.compile(r">(arm[^<]+|x86[^<]+|noarch)<")


def pick_variant(opener, version_url: str, want_arch_label: str) -> str:
    body = fetch_text(opener, version_url)
    rows = _TABLE_ROW_RE.findall(body)
    available: list[str] = []
    for row in rows:
        am = _ARCH_RE.search(row)
        if not am:
            continue
        row_arch = am.group(1).strip()
        available.append(row_arch)
        # Exact match — substring would let "arm64-v8a" also match the
        # "arm64-v8a + armeabi-v7a" universal variant.
        if row_arch != want_arch_label:
            continue
        hm = _VARIANT_HREF_RE.search(row)
        if hm:
            return HOST + hm.group(1)
    raise RuntimeError(
        f"variant {want_arch_label!r} not found on {version_url}; "
        f"available: {sorted(set(available))}"
    )


# -----------------------------------------------------------------------------
# Step 3: extract the bundle key URL from the variant page
# -----------------------------------------------------------------------------

_BUNDLE_KEY_RE = re.compile(
    r'href="(/apk/line-corporation/line/[^"]+/download/\?key=[0-9a-f]+)"'
    r'[^>]*>\s*(?:<[^>]+>\s*)*Download APK(?:\s+Bundle)?',
    re.I,
)


def find_bundle_key_url(opener, variant_url: str) -> str:
    body = fetch_text(opener, variant_url)
    m = _BUNDLE_KEY_RE.search(body)
    if not m:
        raise RuntimeError(f"no Download APK Bundle anchor on {variant_url}")
    return HOST + html.unescape(m.group(1))


# -----------------------------------------------------------------------------
# Step 4: extract the direct download.php URL from the key page
# -----------------------------------------------------------------------------

_DIRECT_DOWNLOAD_RE = re.compile(
    r'href="(/wp-content/themes/APKMirror/download\.php\?id=\d+&(?:amp;)?key=[0-9a-f]+)"'
)


def find_direct_download_url(opener, key_url: str) -> str:
    body = fetch_text(opener, key_url)
    m = _DIRECT_DOWNLOAD_RE.search(body)
    if not m:
        raise RuntimeError(f"no download.php anchor on {key_url}")
    return HOST + html.unescape(m.group(1))


# -----------------------------------------------------------------------------
# .apkm bundle extraction
# -----------------------------------------------------------------------------

def extract_apkm(apkm: Path, target_dir: Path) -> list[Path]:
    """Extract the inner APKs from a .apkm bundle (a signed zip).
    Returns the list of *.apk paths written."""
    target_dir.mkdir(parents=True, exist_ok=True)
    extracted: list[Path] = []
    with zipfile.ZipFile(apkm) as zf:
        for member in zf.namelist():
            base = Path(member).name
            if member.endswith(".apk") or base == "info.json":
                out = target_dir / base
                with zf.open(member) as src, out.open("wb") as dst:
                    while True:
                        chunk = src.read(1 << 20)
                        if not chunk:
                            break
                        dst.write(chunk)
                if out.suffix == ".apk":
                    extracted.append(out)
    return extracted


# -----------------------------------------------------------------------------
# Orchestration
# -----------------------------------------------------------------------------

def resolve(opener, version_request: str, variant: str) -> tuple[str, str]:
    """Return (resolved_version, direct_download_url)."""
    arch_label = VARIANT_LABELS[variant]

    versions = list_versions(opener)
    if not versions:
        raise RuntimeError("could not enumerate any LINE versions on apkmirror")
    log(f"versions seen (5 newest): {[v for v, _ in versions[:5]]}  total={len(versions)}")

    if version_request == "latest":
        version, version_url = versions[0]
    else:
        pick = [(v, u) for v, u in versions if v == version_request]
        if not pick:
            raise RuntimeError(
                f"version {version_request} not found; first few: {[v for v, _ in versions[:10]]}"
            )
        version, version_url = pick[0]
    log(f"selected version: {version}")
    log(f"  version page: {version_url}")

    variant_url = pick_variant(opener, version_url, arch_label)
    log(f"  variant page: {variant_url}")

    key_url = find_bundle_key_url(opener, variant_url)
    log(f"  bundle key:   {key_url}")

    direct = find_direct_download_url(opener, key_url)
    log(f"  direct dl:    {direct[:140]}...")

    return version, direct


def main() -> None:
    p = argparse.ArgumentParser(
        description=__doc__,
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    p.add_argument("--version", default="latest", help="LINE version (e.g. 26.6.2) or 'latest'")
    p.add_argument(
        "--variant",
        default="arm64-v8a",
        choices=sorted(VARIANT_LABELS),
        help="architecture variant",
    )
    p.add_argument(
        "--no-extract",
        action="store_true",
        help="keep the raw .apkm bundle without expanding the inner APKs",
    )
    p.add_argument(
        "--resolve-only",
        action="store_true",
        help="print resolved direct-download URL and exit (no fetch)",
    )
    p.add_argument(
        "--out",
        default=None,
        help=f"output dir (default: {APKS_DIR}/{PACKAGE}/<version>/)",
    )
    args = p.parse_args()

    log(f"target: package={PACKAGE} version={args.version} variant={args.variant}")

    opener = make_opener()
    try:
        version, direct_url = resolve(opener, args.version, args.variant)
    except (HTTPError, URLError) as e:
        sys.exit(f"network error during resolve: {e}")
    except RuntimeError as e:
        sys.exit(f"resolve failed: {e}")

    if args.resolve_only:
        print(direct_url)
        return

    out_dir = Path(args.out) if args.out else APKS_DIR / PACKAGE / version
    apkm_path = out_dir / f"line-{version}-{args.variant}.apkm"
    log(f"download -> {apkm_path}")
    try:
        written = stream_to_file(opener, direct_url, apkm_path)
    except (HTTPError, URLError) as e:
        sys.exit(f"network error during download: {e}")
    log(f"download complete: {written / 1024 / 1024:.1f} MB")

    if not args.no_extract:
        inner = extract_apkm(apkm_path, out_dir)
        for ap in inner:
            log(f"  extracted: {ap.relative_to(ROOT)} ({ap.stat().st_size / 1024 / 1024:.1f} MB)")


if __name__ == "__main__":
    main()
