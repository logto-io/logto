---
'@logto/core': patch
---

Fix OIDC AccessDenied error code to 403.

This error may happen when you try to grant an access token to a user lacking the required permissions, especially when granting for orgnization related resources. The error code should be 403 instead of 400.
