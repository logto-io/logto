---
"@logto/core": patch
---

enforce consented and enabled organization scopes on third-party organization tokens

When a registered third-party application exchanges a refresh token for an organization token, Logto now intersects the user's organization role scopes with both the application's currently enabled organization scopes and the organization scopes consented in the grant. Organization scopes that are not enabled on the application, removed after consent, or only present in the refresh token via a same-named API resource or OIDC scope are no longer issued in organization tokens.
