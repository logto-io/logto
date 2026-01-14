---
"@logto/integration-tests": patch
"@logto/core": patch
"@logto/api": patch
---

return role assignment results in user role APIs

- POST `/users/:userId/roles` now returns `{ roleIds: string[]; addedRoleIds: string[] }` where `roleIds` echoes the requested IDs, and `addedRoleIds` includes only the IDs that were newly created (existing assignments are omitted)
- PUT `/users/:userId/roles` now returns `{ roleIds: string[] }` to confirm the final assigned roles
