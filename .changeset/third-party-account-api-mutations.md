---
"@logto/core": minor
---

block third-party applications from mutating account data through the Account API and Verification API

The Account API is the user managing their own account at the identity provider, and was built for the first-party Account Center.

Third-party applications now receive `403 auth.third_party_application_forbidden` when they try to change account data. First-party applications are unaffected, including Account Center and Console.

The check fails closed: a client identifier that no longer resolves to an application is treated as third-party. Two cases follow from that. A client identifier document (CIMD) client identifier is a URL and never names a registered application, so CIMD clients are blocked from these routes. An application that has been deleted while its access tokens are still live is blocked as well, because the token keeps authenticating after the application row is gone.

No read route gained a guard. Three reads do become unreachable for third-party applications as a side effect, because they require a verified user-permission verification record and the routes that mint one are now guarded:

- `GET /api/my-account/grants`
- `GET /api/my-account/sessions`
- `GET /api/my-account/mfa-verifications/backup-codes`

For a third-party application these now return `401 verification_record.permission_denied` whenever Account Center is enabled, and the existing `400 account_center.not_enabled` when it is not. Every other read is unchanged.
