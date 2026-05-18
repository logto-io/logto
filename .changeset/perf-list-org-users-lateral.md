---
"@logto/core": patch
---

speed up `GET /organizations/:id/users` on large memberships by aggregating roles via `LATERAL`

The entities query for `getUsersByOrganizationId` joined `organization_role_user_relations` and `organization_roles` before applying `GROUP BY users.id` + `LIMIT`. Postgres had to build the entire `members × roles_per_member` intermediate result on every paginated request, aggregate it, then slice. A 20-row page over a 10k-member org with 3 roles each materialized ~30k intermediate rows regardless of page size.

The rewrite moves the role aggregation into a `LATERAL` subquery joined per user row. `LIMIT` now prunes the outer user set before the role-table lookups fire, so the aggregation runs `limit` times instead of once over the full join, and each lateral lookup hits `organization_role_user_relations__tenant_id_org_id_user_id` (added in the prior Phase 0.5 migration) directly. The row ordering, previously incidental under the `GROUP BY` plan, is now pinned by an explicit `ORDER BY` so pagination is deterministic across calls.
