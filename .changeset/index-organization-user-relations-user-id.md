---
"@logto/schemas": patch
---

add secondary index on `organization_user_relations (tenant_id, user_id)` to speed up reverse lookups

The primary key column order is `(tenant_id, organization_id, user_id)`, which prevents queries that filter by `user_id` without specifying `organization_id` from using the index. This pattern is hit on every sign-in (via `getOrganizationsByUserId`) and on every request to the `/organizations/:id/users/:userId/roles` family (via the membership-existence middleware).
