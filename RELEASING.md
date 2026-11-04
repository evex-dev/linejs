# Releasing

Releases are manual. `.github/workflows/publish.yml` releases one package set
at a time, chosen from the workflow dispatch form:

| `package` | Packages                                                               | Tag              |
| --------- | ---------------------------------------------------------------------- | ---------------- |
| `linejs`  | `@evex-dev/linejs-types` + `@evex-dev/linejs` (lockstep)               | `v<version>`     |
| `cli`     | `@evex-dev/linejs-cli`                                                 | `cli-v<version>` |
| `all`     | Both sets, each bumped independently from its own npm `latest` version | both tags        |

The workflow reads the latest npm version, bumps it by the selected semver
level, runs the full check/build/test suite, publishes with npm Trusted
Publishing (OIDC), pushes the release commit and tags, creates one GitHub
Release per tag, and publishes the library tag to JSR.

JSR runs in `publish.yml` rather than from the tag push: tags pushed with
`GITHUB_TOKEN` do not trigger other workflows. `.github/workflows/release.yml`
remains for a human-pushed tag or a manual JSR retry (`workflow_dispatch` with
the tag name).

The CLI is published to npm only; it is a Node CLI, not a JSR library.

## One-time bootstrap

npm Trusted Publishing can only be configured after a package exists, and the
release workflow requires an existing npm version to increment. Do this once:

1. Publish the first versions locally (requires npm login with access to the
   `@evex-dev` scope):

   ```sh
   pnpm install
   pnpm run build
   (cd packages/types && pnpm publish --access public --no-git-checks)
   (cd packages/linejs && pnpm publish --access public --no-git-checks)
   (cd packages/cli && pnpm publish --access public --no-git-checks)
   ```

   `pnpm publish` applies the `publishConfig` manifest: the committed
   `exports`/`main`/`types` point at the TypeScript sources, while the packed
   tarball points at `dist/`. The CLI tarball ships `dist/line.mjs` as the
   `line` binary.

2. On npmjs.com, open each package → **Settings → Trusted Publisher** and add:

   - Publisher: GitHub Actions
   - Organization: `evex-dev`
   - Repository: `linejs`
   - Workflow filename: `publish.yml`

   Do this for `@evex-dev/linejs-types`, `@evex-dev/linejs`, and
   `@evex-dev/linejs-cli`. Do not add an `NPM_TOKEN` secret: publishing uses
   the workflow's OIDC token.

3. On jsr.io, make sure `@evex/linejs` and `@evex/linejs-types` are linked to
   this repository and allow GitHub Actions OIDC publishing.

The bootstrap publishes the checked-in versions without a tag or GitHub
Release. The first workflow dispatch therefore releases the _next_ versions.
The bootstrap must publish the CLI before a `cli` or `all` dispatch, because
the workflow reads the current CLI version from npm.

## Releasing a version

1. Open **Actions → publish → Run workflow** on `main`.
2. Choose the package set (`linejs`, `cli`, or `all`) and a semver level
   (`patch`, `minor`, or `major`).
3. The workflow:
   - reads the selected package versions from npm and fails with a clear
     message if a package is unpublished or unreachable;
   - computes the next version from the newest of the npm versions and the
     checked-in versions, so it never downgrades;
   - rewrites the selected `package.json` versions and, for `linejs`, both
     `jsr.json` files;
   - pins the CLI's `@evex-dev/linejs` / `@evex-dev/linejs-types` dependency
     ranges to the version published by this run (or to the latest npm
     versions for a CLI-only run);
   - installs, formats, builds, type-checks, lints, and runs the package and
     script tests;
   - refuses to reuse an existing version or tag, and asserts that `origin/main`
     has not moved since checkout;
   - publishes with `pnpm publish` (Trusted Publishing), then atomically pushes
     the release commit and every tag;
   - creates a GitHub Release for each tag (`v<version>` and/or
     `cli-v<version>`);
   - publishes `@evex/linejs-types` and `@evex/linejs` to JSR for library
     releases.

## Recovering from a partial failure

- **npm published, push failed:** the release commit/tag only exist in the
  failed run. Push them manually from the run's checkout, or accept the skipped
  version and dispatch a new release (the workflow computes the next version).
- **npm and tag succeeded, JSR failed:** re-run just the JSR part via
  **Actions → release → Run workflow** with the library tag (for example
  `v3.6.1`). The step skips versions that are already published.
- **One npm package published, the other failed:** dispatch the workflow again.
  It bumps from the newer npm version, so the packages converge on a fresh
  version instead of being stuck out of sync.
- **CLI-only release used a library API that is not on npm yet:** publish the
  library first (or use `all`) so the CLI's pinned dependency range resolves to
  a published version.
