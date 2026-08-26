---
'@logto/core': patch
---

stop issuing user scopes a third-party application is no longer configured for

Removing a user scope from a third-party application's consent settings used to affect only new authorization requests, and scopes already in a user's grant kept being issued. Now a refresh token exchange drops the removed scopes, an authorization resuming on an existing grant fails with `invalid_scope`, and an organization token request is rejected with `insufficient_scope` once the organizations scope is removed.
