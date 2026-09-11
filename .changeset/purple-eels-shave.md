---
"@logto/core": patch
---

support a trailing slash in the issuer of OIDC enterprise SSO connectors

The discovery path is now joined onto the connector's `Issuer`, so `https://idp.example.com/` and `https://idp.example.com` both resolve to `https://idp.example.com/.well-known/openid-configuration`. The stored issuer value stays exactly as configured, so existing SSO identities keep resolving.

Failed outbound requests made by an OIDC SSO connector now report a concise reason: the error message, or the status code alongside the response body for an HTTP failure.
