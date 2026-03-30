---
"@logto/schemas": minor
---

introduce optional `oidc.session.ttl` config in logto-config for oidc session ttl

- Added a new optional `oidc.session.ttl` field in `logto-config`.
- This config allows developers to customize the OIDC provider session TTL in seconds.
- If `oidc.session.ttl` is not provided, the default session TTL remains `14 days`.
- For OSS deployments, restart the service instance after config changes so the server can pick up the latest OIDC config updates. To apply all OIDC configuration updates automatically without rebooting the service, [enable central redis cache](https://docs.logto.io/logto-oss/central-cache).
