# Releasing

Releases are manual. `.github/workflows/publish.yml` reads the latest npm
version, bumps both packages, runs the full check/build/test suite, publishes
`@evex-dev/linejs-types` and then `@evex-dev/linejs` with npm Trusted Publishing
(OIDC), pushes the release commit and `v<version>` tag, creates the GitHub
Release, and publishes the same tag to JSR.

JSR also runs in `publish.yml` rather than from the tag push: tags pushed with
`GITHUB_TOKEN` do not trigger other workflows. `.github/workflows/release.yml`
remains for a human-pushed tag or a manual retry (`workflow_dispatch` with the
tag name).

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
   ```

   `pnpm publish` applies the `publishConfig` manifest: the committed
   `exports`/`main`/`types` point at the TypeScript sources, while the packed
   tarball points at `dist/`.

2. On npmjs.com, open each package → **Settings → Trusted Publisher** and add:

   - Publisher: GitHub Actions
   - Organization: `evex-dev`
   - Repository: `linejs`
   - Workflow filename: `publish.yml`

   Do not add an `NPM_TOKEN` secret: publishing uses the workflow's OIDC token.

3. On jsr.io, make sure `@evex/linejs` and `@evex/linejs-types` are linked to
   this repository and allow GitHub Actions OIDC publishing.

4. Create `@evex/linejs-agent` at
   <https://jsr.io/new?scope=evex&package=linejs-agent> and link it to this
   repository. The release workflow bumps its `jsr.json` version together with
   the other two packages and publishes it strictly, so a missing package fails
   the release visibly (it is `private` for npm, but still published to JSR).

The bootstrap publishes the checked-in version (currently `3.6.0`) without a
tag or GitHub Release. The first workflow dispatch therefore releases the _next_
version (for example `3.6.1`); `v3.6.0` is never tagged.

## Releasing a version

1. Open **Actions → publish → Run workflow** on `main`.
2. Choose `patch`, `minor`, or `major`.
3. The workflow:
   - reads both packages from npm and fails with a clear message if either is
     unpublished or unreachable;
   - computes the next version from the newest of the npm versions and the
     checked-in versions, so it never downgrades;
   - rewrites both `package.json` versions and both `jsr.json` files;
   - installs, formats, builds, type-checks, lints, and runs the package and
     script tests;
   - refuses to reuse an existing version or tag, and asserts that `origin/main`
     has not moved since checkout;
   - publishes with `pnpm publish` (Trusted Publishing), then atomically pushes
     the release commit and tag;
   - creates the GitHub Release;
   - publishes all three packages to JSR with OIDC (agent included).

## Recovering from a partial failure

- **npm published, push failed:** the release commit/tag only exist in the
  failed run. Push them manually from the run's checkout, or accept the skipped
  version and dispatch a new release (the workflow computes the next version).
- **npm and tag succeeded, JSR failed:** re-run just the JSR part via
  **Actions → release → Run workflow** with the tag name (for example
  `v3.6.1`). A missing or unlinked `@evex/linejs-agent` JSR package is the most
  likely cause.
- **One npm package published, the other failed:** dispatch the workflow again.
  It bumps from the newer npm version, so both packages converge on a fresh
  version instead of being stuck out of sync.
