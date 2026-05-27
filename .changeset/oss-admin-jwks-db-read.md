---
"@logto/core": patch
---

read admin tenant signing keys directly from the database in OSS to reduce self-hosted deployment friction

Self-hosted OSS deployments no longer need extra host or DNS mappings that let the Logto container fetch its own admin tenant OIDC configuration through the externally configured endpoint.
