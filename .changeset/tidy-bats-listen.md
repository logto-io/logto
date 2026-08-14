---
'@logto/core': patch
---

stop issuing user scopes a third-party application is no longer configured for

Removing a user scope from a third-party application's consent settings only affected new authorization requests — anything already recorded in a user's grant kept being issued. Refresh token exchanges now drop the scopes that are no longer allowed, and an authorization that resumes on an existing grant is rejected with `invalid_scope`.
