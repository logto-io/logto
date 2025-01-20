---
"@logto/core": patch
---

fix POST /api/organization-roles API

When invalid organization scope IDs or resource scope IDs are provided, the API should return a 422 error without creating the organization role.
