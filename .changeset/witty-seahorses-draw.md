---
"@logto/core": patch
---

improve token exchange performance

Cache the minimal OIDC resource lookup at the query layer and pre-generating the grant ID during token issuance to avoid an extra write just for grant creation.
