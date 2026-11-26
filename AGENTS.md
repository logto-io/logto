# Project Instructions

## Pull Requests

When creating PRs:

- If creating a branch, start it with the author's GitHub username (or another stable branch-safe identifier if unavailable), normalized to lowercase kebab-case, followed by lowercase kebab-case words, with no `/`.
- Follow the org-level PR template at `logto-io/.github/PULL_REQUEST_TEMPLATE.md` (not in this checkout) and fill in all of its sections.
- Do not describe feature flag details such as `isDevFeaturesEnabled` in the PR description.
- In the `Testing` section, write only `Tested locally`, `Unit tests`, `Integration tests`, or `N/A`.

## Changesets

Unless explicitly requested otherwise, guard new features with `isDevFeaturesEnabled` (unless the code is already inside a guard) and add no changeset; a changeset and `isDevFeaturesEnabled` never appear together for the same change. When releasing a feature, remove only that feature's guard, never all `isDevFeaturesEnabled` usage, and add its changeset.

Standalone bug fixes do not need `isDevFeaturesEnabled`, but should include a changeset when the fix affects released behavior.

Changeset text should use this format:

- First paragraph: one concise summary sentence that starts with a lowercase letter and omits the trailing period.
- Optional following paragraph: detailed description when needed.
- Write for the user-facing changelog: describe the final product capability or behavior, not the release mechanics or implementation process, such as removing a feature flag.

## Dev features

When adding `isDevFeaturesEnabled` for a new feature, include a comment that identifies the guarded feature at a high level. Prefer naming the broader feature area rather than a narrow implementation detail so the guard can be found and removed together when the feature is released.

When adding or changing API behavior, update the corresponding OpenAPI document in the same PR. For an in-development API, use `tags: ["Dev feature"]` to guard an entire operation, or set `x-logto-dev-feature: true` on an individual schema property. These markers keep in-development API surfaces out of public OpenAPI output when dev features are disabled.

## Localization

When changing copy under `packages/phrases`, sync and translate the corresponding entries for the other locale files in the same PR unless the change is intentionally source-locale only.

## Database Schema

Core queries run as each tenant's database role under row-level security, which changes which indexes the planner can use. Before adding an index, a hot predicate, or a backfill, read `packages/schemas/README.md` (indexes under row-level security) and `packages/schemas/alterations/README.md` (indexes, backfills).

## Lint Suppressions

Every `eslint-disable` must include a short reason explaining why the suppression is safe or necessary.

## Commit Hooks

Never bypass commit hooks. Many packages depend on each other through built artifacts; when checks fail because local package outputs are stale or missing, run `pnpm prepack` before retrying.

## MFA Gates & Flowcharts

When changing an MFA gate in `ExperienceInteraction.submit()` or modifying either MFA decision function (`resolveMfaVerificationRequirement`, `resolvePreBindMfaEnrollment`, or `resolveMfaEnrollmentRequirement`), update the corresponding matrix test (`mfa-verification-decision.test.ts` / `experience-interaction.mfa-verification-reason.test.ts` or `mfa-enrollment-decision.test.ts`) and `end-user-flows/submit-gates.md` (plus `end-user-flows/sign-in-flow.md` and `end-user-flows/register-flow.md` when entry flows change) in the same PR.
