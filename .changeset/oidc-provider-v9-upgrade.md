---
"@logto/core": minor
---

upgrade the OIDC provider to node-oidc-provider v9

## Security

- revoking an opaque access token now also revokes all tokens under the same grant, including the refresh token. In v8, the refresh token stayed usable after revocation and could keep requesting new access tokens.

## Updates

- the revocation endpoint now rejects JWT access tokens with `unsupported_token_type`, instead of returning a success response without actually revoking anything in v8.
- add the RFC 8414 authorization server metadata endpoint (`/oidc/.well-known/oauth-authorization-server`).
- remove the redundant `at_hash` claim from ID tokens issued at the token endpoint. Official SDKs never verify this claim, so no action is needed unless your integration verifies it manually.
