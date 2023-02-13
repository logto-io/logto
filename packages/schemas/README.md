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
