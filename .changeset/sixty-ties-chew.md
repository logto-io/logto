---
"@logto/integration-tests": patch
"@logto/core": patch
"@logto/api": patch
---

return role assignment results in user role APIs

- POST `/users/:userId/roles` now returns `{ addedRoleIds: string[] }` so clients can tell which roles were newly added
- PUT `/users/:userId/roles` now returns `{ roleIds: string[] }` to confirm the final assigned roles
