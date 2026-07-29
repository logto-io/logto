---
"@logto/core": patch
---

keep OIDC interaction redirects under the endpoint base path

When Logto is served under a sub-path endpoint (for example `ENDPOINT=https://my.host/logto`), the sign-in and consent interaction redirects no longer escape to the host root. Root-mounted endpoints are unchanged.
