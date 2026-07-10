---
"@logto/connector-apple": patch
"@logto/connector-google": patch
"@logto/connector-oauth": patch
"@logto/connector-oidc": patch
---

upgrade jose from v5 to v6

These connectors now use jose 6, which runs on the Web Crypto API instead of Node's crypto module. Token signing and ID token verification behave exactly as before.
