---
"@logto/core": minor
---

support configurable oidc session ttl and add oidc session config management apis

- Updated OIDC provider initialization logic to respect `oidc.session.ttl` from `logto-config` instead of using only a hard-coded session TTL.  
  When `oidc.session.ttl` is provided, it overrides the default session TTL.

- The custom session TTL is loaded during OIDC provider initialization.  
   For OSS deployments, restart the service instance after config changes so the server can pick up the latest OIDC config updates. To apply OIDC config updates automatically without restarting the service, [enable central redis cache](https://docs.logto.io/logto-oss/central-cache).

- Added management APIs to manage OIDC session config (currently `ttl` only):
  - `GET /api/configs/oidc/session`
  - `PATCH /api/configs/oidc/session`
