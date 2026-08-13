---
'@logto/core': patch
---

fix revoking a user's third-party app authorization also dropping that browser's single sign-on session

Revoking a third-party application grant (from the Console user details page, the Management API, or the Account API) rotated the identifier of the OIDC session the grant belonged to. Since revocation runs outside any browser request, the rotated session cookie could never reach the user agent, so the browser's single sign-on session was silently orphaned: applications that already held tokens kept working until the tokens expired, but the next authorization request from that browser — for any application — forced the user to enter their credentials again instead of signing in silently. The revocation now only removes the grant's authorization entry from the session: the affected third-party app loses its tokens and must re-consent on the next sign-in, while the browser's single sign-on session stays intact.
