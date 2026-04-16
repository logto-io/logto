---
"@logto/account": patch
---

Use `prompt=none` for silent re-auth when the access token expires in Account Center, falling back to `prompt=login` only when the OIDC session is truly gone. This avoids showing an unnecessary login screen on every token expiry.
