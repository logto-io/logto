---
"@logto/core": patch
---

issue access tokens with only the API resource permissions that still exist

When an app exchanged an authorization code or a device code for an access token for an API resource, the token could still include permissions (scopes) that had been removed from that API resource after the user granted them. Logto now issues these tokens, both opaque and JWT, with only the granted permissions that the API resource still has. If all of them have been removed, the token's `scope` is empty. The refresh token grant already behaved this way.
