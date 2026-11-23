---
"@logto/core": patch
---

limit third-party app organization tokens to scopes granted for organization access and still enabled for the app

Organization tokens no longer include same-named scopes granted only for another resource or in the OIDC context. Disabling an organization scope for an app also takes effect when an existing refresh token is exchanged for a new organization token.
