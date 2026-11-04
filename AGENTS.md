# Repository Guidelines

## Project Structure & Module Organization

This repository is a pnpm + [Vite+](https://viteplus.dev/) monorepo.

- `packages/linejs`: main TypeScript library (`@evex-dev/linejs`, also published as JSR `@evex/linejs`) with feature modules under `client`, `base`, and `thrift`.
- `packages/types`: shared LINE type definitions (`@evex-dev/linejs-types`, JSR `@evex/linejs-types`).
- `packages/agent`: LINE Agent I / LINE AI REST helpers. Private workspace package; not published to npm or JSR.
- `packages/cli`: `@evex-dev/linejs-cli` (`line` binary, `--json` output, MCP stdio server).
- `docs`: VitePress documentation site and content.
- `example`: runnable examples for browser, node, talk, square, storage, thrift, etc.
- `scripts`: generation/utility scripts, including thrift tooling and service/type helpers.
- `resources`: static assets used by the project.

`README.md` in the root points to `packages/linejs/README.md` for package-level context.

## Build, Test, and Development Commands

- `pnpm install`: install the workspace (Node 22.18+, 24.11+, or 26+).
- `pnpm run build`: build every publishable package with `vp pack`.
- `pnpm test`: run `vp test` in every package.
- `pnpm run test:scripts`: run the repository-script tests under `scripts/`.
- `pnpm run check`: run Vite+ format/lint checks and TypeScript type-checking for the whole repository (root-only lint/fmt config).
- `pnpm run typecheck`: run `tsc --noEmit` in every package.
- `pnpm run format`: format the whole repository with `vp fmt . --write`.
- `pnpm line <args>`: run the CLI from source through `tsx` (for example `pnpm line help`).
- `pnpm docs:dev` / `pnpm docs:build`: run the VitePress site from `docs`.
- `cd packages/linejs && pnpm exec vp test`: package-scoped test run.
- `node example/<name>.ts`: run an example with plain Node 24; the root devDependencies link the workspace packages and the sources are strip-only-compatible TypeScript.

## Release

- `.github/workflows/publish.yml` is a manual `workflow_dispatch` release with a `package` choice (`all` / `linejs` / `cli`) and a `major` / `minor` / `patch` choice. It reads the latest npm versions, bumps the selected package set, publishes with npm Trusted Publishing (OIDC), then pushes the release commit/tags and creates the GitHub Releases. Library releases use `v<version>`; CLI releases use `cli-v<version>`.
- `publish.yml` also publishes the tag to JSR with OIDC (tags pushed with `GITHUB_TOKEN` do not trigger other workflows). `.github/workflows/release.yml` remains for a maintainer-pushed tag or a manual JSR retry via `workflow_dispatch`.
- Never add `NPM_TOKEN`/`NODE_AUTH_TOKEN`; trusted publishing supplies credentials.

## Coding Style & Naming Conventions

- Vite+ (`oxfmt`/`oxlint`) settings live only in the root `vite.config.ts`: tabs, double quotes, semicolons. Package `vite.config.ts` files only configure `vp pack` / `vp test`; do not add `fmt`/`lint` blocks to them.
- Keep TypeScript across all source files and prefer explicit typing for public APIs.
- Use clear, domain-based names: `camelCase` for functions/variables, `PascalCase` for classes/types.
- File names are typically kebab-case or snake-like and placed under relevant feature folders (`client/features/*`, `base/*`).

## Testing Guidelines

- Test framework: Vitest 5 through `vp test`; import `test` and `assert` from `vite-plus/test`.
- Test files use `*.test.ts` naming, e.g. `packages/linejs/base/core/typed-event-emitter/index.test.ts`.
- Run tests before PRs: `pnpm test` (and `pnpm run test:scripts` when touching `scripts/`).
- Add/adjust unit coverage when changing logic in touched files; keep existing test conventions.

## Commit & Pull Request Guidelines

- Commit history mostly follows Conventional Commit style (`feat:`, `fix:`, `chore:`, `testing:`).
- Use short, imperative summaries, e.g. `feat(client): add message retry logic`.
- PR description should explain behavior changes and testing performed.
- Include reproduction notes when behavior depends on credentials, protocol behavior, or network-sensitive paths.
- Optional checklist items in `.github/pull_request_template.md`: tests, jsdoc updates, local runtime checks.

## Security & Configuration Tips

- Do not commit API secrets, tokens, credentials, or device/account dumps.
- Prefer local config and environment-specific values for experimentation.
- Keep binary assets or generated thrift artifacts under version control only when intentionally derived and reviewed.
