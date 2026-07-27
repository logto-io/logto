---
"@logto/core": minor
---

upgrade the OIDC provider to node-oidc-provider v9

## Security

- revoking an opaque access token now also revokes all tokens under the same grant, including the refresh token. In v8, the refresh token stayed usable after revocation and could keep requesting new access tokens.

## Updates

- the revocation endpoint now rejects JWT access tokens with `unsupported_token_type`, instead of returning a success response without actually revoking anything in v8.
- add the RFC 8414 authorization server metadata endpoint (`/oidc/.well-known/oauth-authorization-server`).
- remove the redundant `at_hash` claim from ID tokens issued at the token endpoint.
- ID tokens no longer include the optional `typ: "JWT"` header. OpenID Connect defines ID tokens as JWTs and does not require clients to verify this header.

## Action required for custom ID token verification

No action is required when using an official Logto SDK. If your integration performs custom ID token verification:

- if it requires the `at_hash` claim on ID tokens returned by the token endpoint, update it to allow the claim to be absent.
- if it requires the `typ: "JWT"` header, update it to allow the header to be absent.
