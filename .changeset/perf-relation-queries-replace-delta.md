---
"@logto/core": minor
---

add `TwoRelationsQueries.replaceWithDelta()` for high-cardinality relation tables; switch `PUT /organizations/:id/users` to use it

The existing `replace()` runs `DELETE WHERE schema1_id = X` + bulk `INSERT` inside a transaction, rewriting O(N) rows on every call. The new `replaceWithDelta()` computes the added/removed sets in a single CTE statement, so a no-op call writes zero rows and a one-row delta writes exactly one row. It returns `{ added, removed }` so downstream consumers (notably the membership-webhook payload work in LOG-13462) can read the delta without a re-query.

`replace()` is unchanged. The new method is opt-in. This PR migrates one call site — `PUT /organizations/:id/users` — where organization membership can grow into the 10k+ range. The other nine `TwoRelationsQueries` subclasses continue to use `replace()`.

For relation tables upstream of an `on delete cascade` FK (e.g. `organization_user_relations` → `organization_role_user_relations`), `replace()` cascades for every current row on every call — silently dropping dependents of unchanged members. `replaceWithDelta()` only cascades for truly-departing rows, so dependents of surviving members are preserved. The migrated `PUT /organizations/:id/users` now keeps a member's role assignments when their membership survives the PUT; a new integration test guards this.
