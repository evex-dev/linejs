# Repository Guidelines

## Project Structure & Module Organization
This repository is a Deno-first monorepo.

- `packages/linejs`: main TypeScript library (`@evex/linejs`) with feature modules under `client`, `base`, and `thrift`.
- `packages/types`: shared LINE type definitions (`@evex/linejs-types`).
- `docs`: VitePress documentation site and content.
- `example`: runnable examples for browser, node, talk, square, storage, thrift, etc.
- `scripts`: generation/utility scripts, including thrift tooling and service/type helpers.
- `resources`: static assets used by the project.

`README.md` in the root points to `packages/linejs/README.md` for package-level context.

## Build, Test, and Development Commands
- `deno task dev`: run local sandbox (workspace root).
- `deno task docs:dev`: run docs dev server from `docs`.
- `deno task docs:build`: build docs from `docs`.
- `cd docs && npm run dev|build|serve` or `bun run dev|build|serve`: alternate docs workflows.
- `deno test`: run the Deno test suite (CI uses this at repository root).
- `cd packages/linejs && deno test`: run package-scoped tests.
- `deno fmt`: apply repository formatter (configured in `deno.json`).

## Coding Style & Naming Conventions
- Use Deno formatter settings from repo: tabs for indentation, double quotes in most files.
- Keep TypeScript across all source files and prefer explicit typing for public APIs.
- Use clear, domain-based names: `camelCase` for functions/variables, `PascalCase` for classes/types.
- File names are typically kebab-case or snake-like and placed under relevant feature folders (`client/features/*`, `base/*`).

## Testing Guidelines
- Test framework: Deno’s built-in test runner.
- Test files use `*_test.ts` naming, e.g. `packages/linejs/base/core/typed-event-emitter/index.test.ts`.
- Run tests before PRs: `deno test` or package-scoped commands above.
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
