---
"@logto/core": patch
---

read admin tenant public JWKs from the database in single-tenant (OSS) deployments

When validating Management API tokens, a user tenant needs the admin tenant's public signing keys. Since v1.17 these were fetched over HTTP from `<admin>/oidc/.well-known/openid-configuration` and `<admin>/oidc/jwks`. In containerized OSS setups behind a reverse proxy this self-call frequently fails — the admin endpoint resolves to `127.0.0.1` inside the Logto container and never reaches the proxy — causing every Management API request to return `401 Unauthorized` (see #6048).

OSS deployments now read `oidc.privateKeys` directly from `logto_configs` (the pre-v1.17 behavior) and derive public JWKs locally, removing the self-HTTP dependency entirely. The keys exposed are the canonical Current + Next + Previous set, so this stays compatible with the staged signing key rotation introduced in #8702; rotations also propagate immediately rather than waiting up to one hour for the in-process JWKS cache to expire.

Multi-tenant (Cloud) deployments are unchanged and keep using the OIDC discovery endpoint.
