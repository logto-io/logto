---
"@logto/core": minor
---

filter organization members by tenant-level user role

Pass `roleId` to `GET /api/organizations/{id}/users` to list only members assigned that tenant-level user role. The filter applies before pagination and can be combined with `organizationRoleId` and `q`.
