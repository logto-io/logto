---
"@logto/core": minor
---

block third-party applications from mutating account data through the Account API and Verification API

The Account API is the user managing their own account at the identity provider, and was built for the first-party Account Center.

Third-party applications now receive `403 auth.third_party_application_forbidden` when they try to change account data. Every first-party application is unaffected, including Account Center and Console.

No read route gained a guard. Three reads do become unreachable for third-party applications as a side effect, because they require a verified user-permission verification record and the routes that mint one are now guarded:

- `GET /api/my-account/grants`
- `GET /api/my-account/sessions`
- `GET /api/my-account/mfa-verifications/backup-codes`

For a third-party application these now always return `401 verification_record.permission_denied`. Every other read is unchanged.
