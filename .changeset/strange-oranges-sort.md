---
"@logto/core": patch
---

fix: incorrect pagination behavior in organization role scopes APIs

- Fix `/api/organization-roles/{id}/scopes` and `/api/organization-roles/{id}/resource-scopes` endpoints to:
  - Return all scopes when no pagination parameters are provided
  - Support optional pagination when query parameters are present
- Fix Console to properly display all organization role scopes on the organization template page
