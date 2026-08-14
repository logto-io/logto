---
'@logto/core': patch
---

validate the subject token class in token exchange

The `access_token` subject path of the token exchange grant falls back to JWT verification when the token is not a known opaque token. That fallback checked only the signature and the issuer, so any JWT signed by the tenant's keys was accepted as an access token — including an OIDC ID token, which is an authentication assertion and carries no API authorization. A client with token exchange enabled could therefore submit an ID token as `subject_token` and receive an API access token for that user.

The JWT subject token is now required to carry the RFC 9068 `at+jwt` type header and a `client_id` claim before the account is resolved. Both are set unconditionally on every JWT access token Logto issues, so legitimate subject tokens are unaffected; ID tokens are rejected with `invalid_grant`.
