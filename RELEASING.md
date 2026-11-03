# Releasing

Releases are manual. `.github/workflows/publish.yml` bumps the latest npm
version, publishes both npm packages with Trusted Publishing (OIDC), creates the
`v<version>` tag and GitHub Release, and `.github/workflows/release.yml` then
publishes the same tag to JSR.

## One-time bootstrap

npm Trusted Publishing can only be configured after a package exists, and the
release workflow requires an existing npm version to increment. Do this once:

1. Publish the first versions locally (requires npm login with access to the
   `@evex-dev` scope):

   ```sh
   pnpm install
   pnpm run build
   (cd packages/types && npm publish --access public)
   (cd packages/linejs && npm publish --access public)
   ```

2. On npmjs.com, open each package → **Settings → Trusted Publisher** and add:

   - Publisher: GitHub Actions
   - Organization: `evex-dev`
   - Repository: `linejs`
   - Workflow filename: `publish.yml`

   Do not add an `NPM_TOKEN` secret: publishing uses the workflow's OIDC token.

3. On jsr.io, make sure `@evex/linejs` and `@evex/linejs-types` are linked to
   this repository and allow GitHub Actions OIDC publishing.

4. For `@evex/linejs-agent`, create the package at
   <https://jsr.io/new?scope=evex&package=linejs-agent> if you want its
   (best-effort) JSR publish step to succeed.

## Releasing a version

1. Open **Actions → publish → Run workflow** on `main`.
2. Choose `patch`, `minor`, or `major`.
3. The workflow:
   - reads `@evex-dev/linejs-types` and `@evex-dev/linejs` from npm and refuses
     to run if they are unpublished or out of sync;
   - bumps both versions and rewrites both `jsr.json` files;
   - installs, builds, type-checks/lints, and runs the package and script tests;
   - refuses to reuse an existing version or tag;
   - publishes `@evex-dev/linejs-types` and then `@evex-dev/linejs` with
     `npm publish`;
   - pushes the release commit and `v<version>` tag, then creates the GitHub
     Release.

JSR publishing happens only after npm succeeds, from the pushed tag.
