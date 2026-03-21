---
"@logto/core": patch
---

Remove the standalone OIDC resource-server aggregate cache and move the safe cache hit down to the resource query layer, with invalidation and regression coverage for token exchange reads.
