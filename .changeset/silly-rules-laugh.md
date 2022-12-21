---
"@logto/connector-kit": patch
---

Add optional `setSession` method and `getSession` method as input parameters of `getAuthorizationUri` and `getUserInfo` respectively.

This change enabled stateless connectors to utilize Logto session to pass parameters between APIs.
