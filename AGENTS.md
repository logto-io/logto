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
