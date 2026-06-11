---
"@logto/core": minor
"@logto/schemas": minor
"@logto/console": minor
"@logto/experience": minor
"@logto/phrases": minor
"@logto/phrases-experience": minor
---

add a configurable per-tenant password expiration policy

Operators can enable password expiration from Console → Security → Password policy and set the number of days a password stays valid. When a password reaches the end of its valid period — or is manually expired for a specific user — the end user is forced through the forgot-password flow on their next password sign-in before they can continue. Users signing in via SSO or passkey are not affected.

- **Console**: a new "Password expiration" card with an enable toggle and a valid-period (days) input, an inline reminder when sign-up requires no contact identifier to guarantee password recovery, and a per-user "Expire password" action on the user details page.
- **Core / API**: the policy is stored on the sign-in experience (`passwordExpiration`) and enforced after password verification. `PATCH /api/users/:userId/password/expiration` lets admins manually expire a user's password, and deleting the last forgot-password connector is rejected while the policy is enabled.
- **Experience**: an expired password prompts the user to reset it via the configured recovery method before sign-in completes.

Legacy users without a recorded password-change date are anchored to the timestamp the policy was enabled, so they get a full valid period instead of being expired immediately.
