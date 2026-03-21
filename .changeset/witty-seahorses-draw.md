---
"@logto/core": patch
---

Improve token exchange performance by caching the minimal OIDC resource lookup at the query layer and reducing extra grant work during token issuance.
