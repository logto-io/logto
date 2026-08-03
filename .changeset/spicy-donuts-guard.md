---
'@logto/core': patch
---

reject token issuance for suspended users

Suspending a user revokes their sessions and tokens, but token issuance itself never checked the suspension flag — if revocation partially failed, a surviving refresh token kept working indefinitely. The OIDC `findAccount` hook now rejects suspended users with `invalid_grant`, mirroring how deleted users are handled, so all user token grants (refresh token, authorization code, device code, token exchange) and userinfo reject suspended users regardless of revocation state.
