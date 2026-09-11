---
"@logto/core": patch
---

fix enterprise SSO sign-in failing for OIDC connectors whose issuer ends with a slash

A trailing slash on the connector's `Issuer` produced a discovery request to `<issuer>//.well-known/openid-configuration`, which identity providers that do not collapse the doubled slash reject. The discovery path is now joined onto the issuer rather than concatenated. The stored issuer value is left untouched, so existing SSO identities keep resolving.

Failed outbound requests made by an OIDC SSO connector now report a concise reason — the error message, or the status code alongside the response body for an HTTP failure — instead of whichever internals the underlying error object happened to carry.
