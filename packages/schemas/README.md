# @logto/schemas

The central packages for all database schemas and their TypeScript definitions and utilities.

## Table init

The Logto CLI will pick up all necessary SQL queries in `tables/` and `src/models/` and run them in the following order:

1. Run `tables/_before_all.sql`
2. Run `tables/*.sql` with the snippet `/* init_order = <number> */` in ascending order of `<number>`
3. Run `tables/*.sql` without the `init_order` snippet in ascending order of filename (`tables/`) or table name (`src/models/`)
4. Run `tables/_after_all.sql`

Additional rules for step 2 and 3:

- If no snippet `/* no_after_each */` found, run `tables/_after_each.sql` after each SQL file
- Exclude lifecycle scripts `tables/_[lifecycle].sql` where `[lifecycle]` could be one of:
  - `after_all`
  - `after_each`
  - `before_all`

In the `after_each` lifecycle script, you can use `${name}` to represent the current filename (`tables/`) or table name (`src/models/`).

In all lifecycle scripts, you can use `${database}` to represent the current database.

## Indexes under row-level security

Core connects as each tenant's own database role, and every table core reads as a tenant role carries the row-level security policy from `tables/_after_each.sql`. Under that policy Postgres only lets a predicate become an index condition when every function in it is leakproof. Plain-column comparisons on text and timestamps are leakproof; `payload->>'key'`, `payload ? 'key'`, `like` and `lower()` are not. From a tenant role an index on such an expression is therefore never used for the key: the planner seeks on the plain-column prefix only (`tenant_id`, `model_name`, ...) and checks the expression on every fetched row, so the cost tracks the tenant's size rather than the number of matches. An `explain` run as the admin role, which owns the tables and bypasses the policy, shows a different plan from the one the app gets.

Rules:

- Do not add an index on an expression that contains a non-leakproof function for a lookup that runs from a tenant role, and do not put such a function on the column side of a hot predicate. Existing expression indexes in `tables/*.sql` are subject to the same limit; do not copy them for a new lookup.
- Promote the key to a real column instead:
  - Name it `payload_<key>` for a jsonb key, or `<column>_lower` for a case-folded copy.
  - Fill it with a `before insert or update of <source>` trigger. Its function goes in the table's own `tables/<table>.sql`; only shared trigger functions live in `tables/_functions.sql`.
  - Say in its doc comment that it is derived and never written directly.
  - Use it only in `where` and join conditions; read values from the source column.
  - Index it with `where <column> is not null`.
- Name new indexes `<table>__<column_a>_<column_b>` and omit `tenant_id`.
- Verify the plan as a tenant role, never as the admin: `set role <tenants.db_user>` on a local database before `explain`.

Unique expression indexes keep enforcing uniqueness on write; the rule is about lookups.
