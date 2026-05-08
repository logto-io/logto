# PR #8746 review feedback follow-up

## Addressed events

- **review_comment:3206757638** (codex P2 — *Check persisted methods before skipping verification*): Tightened `canSetInitialPasswordWithoutVerification` to also require the Account Center `email` and `phone` fields to be at least `ReadOnly`. When those fields are hidden (`Off`), `userInfo` may omit `primaryEmail`/`primaryPhone` even though the underlying user record still has them, so we no longer treat that ambiguous case as a no-method user.
- **review_comment:3206761218** (Copilot — *TypeScript strict null safety*): Reworked `canSetInitialPasswordWithoutVerification` into an explicit guarded function so it does not rely on short-circuiting to access `primaryEmail`/`primaryPhone`, and removed the unsafe optional-chain reads.
- **review_comment:3206761265** (Copilot — *Add primary-phone test*): Added an integration test asserting that a user with `primaryPhone` but no password still requires a verification record for `POST /api/my-account/password`.

## Files changed

- `packages/account/src/utils/security-page.ts` — added `isReadableField` helper, hardened `canSetInitialPasswordWithoutVerification` to factor in Account Center field visibility, and threaded the `accountCenterFields` argument through `canOpenPasswordEditFlow`.
- `packages/account/src/pages/Password/index.tsx` — pass `accountCenterSettings.fields` into `canSetInitialPasswordWithoutVerification` so the no-verification path only triggers when email/phone visibility is sufficient to trust `userInfo`.
- `packages/account/src/pages/Security/PasswordSection/index.tsx` — pass `accountCenterSettings.fields` into `canOpenPasswordEditFlow` to keep the entry-point button gating consistent.
- `packages/account/src/utils/security-page.test.ts` — new tests for the field-visibility behavior and an explicit `undefined` userInfo case.
- `packages/integration-tests/src/tests/api/account/initial-password-setup.test.ts` — added the primary-phone-without-password integration test (and threaded `primaryPhone` through the test helper).

## Events not addressed (with rationale)

- **review_comment:3206761249** (Copilot — *Loading state dead-end*): `App.tsx`'s `Main` already short-circuits to `<GlobalLoading />` while `isLoadingUserInfo` is true and again when `userInfo` is undefined, so the `Password` component only mounts after `userInfo` is hydrated. No additional gating is required.
- **review_comment:3199202298** (charIeszhao — *atomic check + write*): Already replied to by the PR author; explicitly declined as out of scope. No code change.
- Older events (3165662579, 3198950109, 3198950123, 3198996916, 4202464341, 4241223252) were already resolved by previous commits on this branch.
- Bot/banner comments (4349500280 size diff, 4202464341, 4241068476 approval, 4250045534, 4250049967 review summaries) carry no actionable code request.

## Validation

- `pnpm --filter @logto/account check`
- `pnpm --filter @logto/account lint`
- `pnpm --filter @logto/integration-tests check`
- `pnpm --filter @logto/integration-tests lint`
- `pnpm --filter @logto/core check`

All commands pass. The account package has no `test:ci` script and the existing `*.test.ts` files are not wired into CI; behavior is guarded via the typecheck and lint runs above.
