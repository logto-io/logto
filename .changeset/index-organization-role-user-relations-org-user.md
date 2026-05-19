---
"@logto/schemas": patch
---

add secondary index on `organization_role_user_relations (tenant_id, organization_id, user_id)` to speed up per-user role lookups

The primary key column order is `(tenant_id, organization_id, organization_role_id, user_id)`, which prevents queries that filter by `(organization_id, user_id)` without specifying `organization_role_id` from using the index. This pattern is hit by `getUserScopes` (called on every `GET /organizations/:id/users/:userId/scopes`) and by the per-user role join in `getUsersByOrganizationId`.
