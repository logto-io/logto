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

When adding a `.changeset` entry, prefer running `pnpm changeset` from the repository root.

Changeset text should use this format:

- First paragraph: one concise summary sentence.
- The summary must start with a lowercase letter and omit the trailing period.
- Optional following paragraph: detailed description when needed.

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
5. Start dev: `pnpm start:dev` (skip `pnpm dev` which re-runs prepack; prepack is already done by the update script)

### Optional dev workflows (skills)

Skills live under [.agents/skills/](.agents/skills/) ([Agent Skills](https://agentskills.io) format; Cursor Cloud and other agents discover `.agents/skills/` and `.cursor/skills/`). Read a skill **only when the task needs it**—do not load full command lists into context unless relevant.

| Skill | Read when |
|-------|-----------|
| [.agents/skills/logto-local-storage/SKILL.md](.agents/skills/logto-local-storage/SKILL.md) | Avatar/file upload, `storage.not_configured`, `user-assets`, collect-profile **avatar** field |
| [.agents/skills/logto-sign-in-exp-demo-app/SKILL.md](.agents/skills/logto-sign-in-exp-demo-app/SKILL.md) | Experience **screenshots**, PR visuals, `/demo-app`, Live preview, sign-up/sign-in walkthrough |

### Key caveats

- `rsync` must be installed (needed by `@logto/core` for `copy:apidocs`). Install with `sudo apt-get install -y rsync` if missing.
- Connector load errors at startup are expected in dev mode — connectors are not built by default (`pnpm start:dev` excludes them).
- `@logto/core` unit tests require `pnpm build:test` in `packages/core` before running `pnpm test:only`, because Jest reads from `./build` (the tsup dev bundle doesn't include test files).
- `@logto/elements` tests require Playwright browsers: run `pnpm exec playwright install chromium --with-deps` inside `packages/elements`.
- The pre-commit hook runs `lint-staged` on changed packages; if it fails due to stale outputs, run `pnpm prepack` first.

### Running tests and lint

- Lint: `pnpm ci:lint` (ESLint) and `pnpm ci:stylelint` (Stylelint) from repo root.
- Unit tests: `pnpm ci:test` from repo root runs all package tests in parallel.
- Individual package tests: `pnpm test` inside the package directory.
- See `.github/CONTRIBUTING.md` for integration test instructions (Docker-based).
