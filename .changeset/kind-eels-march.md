---
"@logto/core": minor
---

support access token exchange for service-to-service delegation

The standard `subject_token_type` value `urn:ietf:params:oauth:token-type:access_token` now supports access token exchange. This allows services to exchange access tokens (both opaque and JWT formats) issued by Logto for new access tokens with different audiences, enabling service-to-service delegation scenarios.

Token validation order:
1. If token starts with `sub_` prefix, treat as legacy impersonation token (backward compatibility)
2. Try to find as opaque access token via oidc-provider
3. Fallback to JWT verification using the issuer's JWK set

Access tokens are not consumption-tracked, allowing the same token to be exchanged multiple times (e.g., by different services).

Additionally, a new `urn:logto:token-type:impersonation_token` type has been added for explicit impersonation token handling.
