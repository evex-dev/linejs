# TODO

## Performance

- **Lazy-load heavy deps via dynamic import.** Right now constructing
  `BaseClient` pulls in jsdom, parse5, undici, undici-types, tough-cookie,
  cssstyle, whatwg-mimetype, html-encoding-sniffer, etc. — ~30 packages
  initialize at module top-level. Most callers don't need any of that:
  the LIFF consent helper is the only path that actually parses HTML
  (`_csrfRegExp` against the consent page response). Defer those imports
  to the point of use:
  - `jsdom` / `parse5` → only inside `tryConsentAuthorize`
  - `tough-cookie` → only when LiffService runs
  - re-check after refactor whether the BaseClient cold-start dropped
    from ~30 `Initialize` lines to <5.

