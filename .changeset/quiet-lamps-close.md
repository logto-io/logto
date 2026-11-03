---
"@logto/core": patch
---

accept an authorization code, device code, pushed authorization request or one-time token from at most one request

Every other request that presents one gets the error a reused one returns: `invalid_grant` for a code, `invalid_request_uri` for a pushed authorization request, and `one_time_token.token_consumed` for a one-time token. Refresh tokens keep their reuse window.
