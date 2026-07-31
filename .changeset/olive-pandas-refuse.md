---
"@logto/core": patch
---

Fix a 500 error when posting an empty array to relation-assigning Management API endpoints (e.g. `POST /applications/:applicationId/user-consent-scopes` with `{ "organizationScopes": [] }`, or `POST /organizations/:id/users/:userId/roles` with no role ids); empty arrays are now treated as no-ops.
