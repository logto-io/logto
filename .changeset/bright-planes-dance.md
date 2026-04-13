---
"@logto/integration-tests": patch
"@logto/core": patch
---

return response bodies from organization user and role assignment APIs

- POST `/organizations/:id/users` now returns `{ userIds: string[] }` echoing the user IDs that were added to the organization
- POST `/organizations/:id/users/:userId/roles` now returns `{ organizationRoleIds: string[] }` with the final deduplicated role IDs that were assigned, resolved from any provided role names
