---
"@logto/core": patch
---

Reduce OSS deployment friction by reading admin tenant signing keys directly from the database in OSS, instead of fetching them through the admin tenant's OIDC discovery endpoint. This removes the requirement that the admin tenant endpoint be reachable from within the OSS instance itself, which previously broke setups behind reverse proxies or inside container networks where the admin URL is not self-loopback addressable.
