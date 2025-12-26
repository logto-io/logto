---
"@logto/core": minor
---

support JWT access token exchange for service-to-service delegation

Added a new `subject_token_type` value `urn:ietf:params:oauth:token-type:jwt` to enable JWT access token exchange. This allows services to exchange JWT tokens issued by trusted issuers for Logto access tokens, enabling service-to-service delegation scenarios. The JWT tokens are verified using the issuer's JWK set and can be reused multiple times.
