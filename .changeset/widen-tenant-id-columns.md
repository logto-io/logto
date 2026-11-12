---
"@logto/schemas": minor
---

widen `tenants.id` and every tenant-ID-bearing column (118 columns across 78 tables) to `varchar(64)`

The widening runs online: catalog-only `alter` statements under briefly-held, timeout-bounded locks, with the dependent check constraints re-validated without blocking writes and no table data rewritten. To keep the migration bounded, the large partial and expression indexes on `logs`, `oidc_model_instances`, `users`, and `service_logs` are dropped, with temporary covering indexes standing in until follow-up releases rebuild the live ones concurrently; eight legacy expression indexes that row-level security already made unusable for tenant queries are removed for good. The maximum length of a custom tenant ID is unchanged in this release.
