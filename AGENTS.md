# Project Instructions

## Pull Requests

When creating PRs:

- If creating a branch, start it with the author's GitHub username (or another stable branch-safe identifier if unavailable), normalized to lowercase kebab-case, followed by lowercase kebab-case words, with no `/`.
- Follow the repository PR template when available instead of duplicating it in instructions.
- Do not describe feature flag details such as `isDevFeaturesEnabled` in the PR description.
- In the `Testing` section, write `Tested locally`, `Unit tests`, `Integration tests`, or `N/A` as appropriate.
- Do not mention build success, typecheck passing, or other CI-style checks in the `Testing` section.

## Changesets

Changesets and `isDevFeaturesEnabled` should not appear together for the same change. If a feature is protected by `isDevFeaturesEnabled`, it is not released yet; add the changeset when removing the feature flag.

Unless explicitly requested otherwise, prefer `isDevFeaturesEnabled` over a changeset. New features should be protected by `isDevFeaturesEnabled` by default, unless the affected code is already inside an `isDevFeaturesEnabled` guard.

Standalone bug fixes do not need `isDevFeaturesEnabled`, but bug-fix PRs should include a changeset when the fix affects released behavior.

For larger features split across multiple PRs, keep the implementation PRs behind `isDevFeaturesEnabled` and do not add intermediate changesets. Use a dedicated release PR to remove only the dev feature guard logic introduced for that feature, and add the feature-specific changeset in that release PR.

When adding a `.changeset` entry, prefer running `pnpm changeset` from the repository root.

Changeset text should use this format:

- First paragraph: one concise summary sentence.
- The summary must start with a lowercase letter and omit the trailing period.
- Optional following paragraph: detailed description when needed.
- Write changeset text for the user-facing changelog. Describe the final product capability or behavior users can use.
- Do not describe the release mechanics or implementation process, such as releasing a feature, removing a feature flag, or enabling an already-built feature.

## Dev features

When asked to remove `isDevFeaturesEnabled`, treat the request as scoped to one specific feature. Never remove all `isDevFeaturesEnabled` usage globally unless explicitly instructed otherwise.

When adding `isDevFeaturesEnabled` for a new feature, include a comment that identifies the guarded feature at a high level. Prefer naming the broader feature area rather than a narrow implementation detail so the guard can be found and removed together when the feature is released.

Any runtime logic for a new feature must be protected by `isDevFeaturesEnabled` until the feature is released. This includes backend enforcement paths, API behavior, UI entry points, and tests that exercise in-development behavior.

## API contract

Keep public API changes backward-compatible. Do not rename existing fields, remove accepted inputs, or change released error semantics without an explicit product decision.

When adding or changing API behavior, update the corresponding OpenAPI document in the same PR. If the API is protected by `isDevFeaturesEnabled`, the OpenAPI document must also be guarded so the in-development API does not leak into public OpenAPI output before release. Use the existing `Dev Feature` tag or `x-logto-dev-feature` property as appropriate for that OpenAPI file.

## Localization

When changing copy under `packages/phrases`, sync and translate the corresponding entries for the other locale files in the same PR unless the change is intentionally source-locale only.

## Lint and TypeScript Suppressions

Prefer narrow suppressions over broad disables. Avoid file-level `eslint-disable` unless there is a strong reason and no narrower option is practical.

Every `eslint-disable` and `@ts-expect-error` must include a short reason explaining why the suppression is safe or necessary.

## Commit Hook Discipline

Never bypass commit hooks.

Many packages in this project depend on each other through built artifacts. When checks fail because local package outputs are stale or missing, run `pnpm prepack` to rebuild them before retrying.

If a hook cannot be fixed safely within the current task, stop and report the blocker with the failed command, relevant output, why it is out of scope, and what decision is needed.

## Cursor Cloud specific instructions

### Services overview

| Service | Port | Purpose |
|---------|------|---------|
| PostgreSQL | 5432 | Primary data store (required) |
| Logto Core | 3001 (user), 3002 (admin) | Backend: OIDC provider + Management API |
| Console (Vite) | 5002 | Admin dashboard SPA |
| Experience (Vite) | 5001 | Sign-in experience SPA |

### Starting the development environment

1. Start Docker daemon: `sudo dockerd &>/tmp/dockerd.log &` then `sudo chmod 666 /var/run/docker.sock`
2. Start PostgreSQL: `docker run -d --name logto-postgres -p 5432:5432 -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=p0stgr3s -e POSTGRES_DB=logto postgres:17-alpine`
3. Set env: `export DB_URL="postgres://postgres:p0stgr3s@localhost:5432/logto"`
4. If first run (empty database): `pnpm cli db seed` and `pnpm cli connector link -p .`
5. If Core exits with undeployed alterations on an existing database: `pnpm alteration deploy` with the version in `packages/schemas/package.json`, then `pnpm alteration deploy next`
6. Start dev: `pnpm start:dev` (skip `pnpm dev` which re-runs prepack; prepack is already done by the update script)

### Optional dev workflows (skills)

Skills live under [.agents/skills/](.agents/skills/) ([Agent Skills](https://agentskills.io) format; Cursor Cloud and other agents discover `.agents/skills/` and `.cursor/skills/`). Read a skill **only when the task needs it**—do not load full command lists into context unless relevant.

| Skill | Read when |
|-------|-----------|
| [.agents/skills/logto-dev-environment/SKILL.md](.agents/skills/logto-dev-environment/SKILL.md) | Local dev environment bootstrap, database seed/alteration, service health checks, localhost smoke tests, Experience `/demo-app` walkthroughs |
| [.agents/skills/logto-local-storage/SKILL.md](.agents/skills/logto-local-storage/SKILL.md) | Avatar/file upload, `storage.not_configured`, `user-assets`, collect-profile **avatar** field |

### Key caveats

- `rsync` must be installed (needed by `@logto/core` for `copy:apidocs`). Install with `sudo apt-get install -y rsync` if missing.
- Connector load errors at startup are expected in dev mode — connectors are not built by default (`pnpm start:dev` excludes them).
- `@logto/core` unit tests require `pnpm build:test` in `packages/core` before running `pnpm test:only`, because Jest reads from `./build` (the tsup dev bundle doesn't include test files).
- `@logto/elements` tests require Playwright browsers: run `pnpm exec playwright install chromium --with-deps` inside `packages/elements`.
- The pre-commit hook runs `lint-staged` on changed packages; if it fails due to stale outputs, run `pnpm prepack` first.
- `pnpm install` runs `sync-preset` over every `packages/connectors/connector-*` directory; orphan connector folders without `package.json` (not in git) will break install—remove them before `pnpm install`.

### Running tests and lint

- Lint: `pnpm ci:lint` (ESLint) and `pnpm ci:stylelint` (Stylelint) from repo root.
- Unit tests: `pnpm ci:test` from repo root runs all package tests in parallel.
- Individual package tests: `pnpm test` inside the package directory.
- See `.github/CONTRIBUTING.md` for integration test instructions (Docker-based).
