---
"@logto/core": patch
---

Improve token exchange performance by caching the minimal OIDC resource lookup at the query layer and pre-generating the grant ID during token issuance to avoid an extra write just for grant creation.
