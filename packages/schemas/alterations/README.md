# Database alteration

The folder for all alteration files.

## Format

The alteration files are named in the format of `<version>-<timestamp>-name.js` where `<timestamp>` is the unix timestamp of when the alteration was created and `name` is the name of the alteration, `version` is this npm package's version number.

As for development, the `version` is "next" until the package is released.

Note that, you SHOULD NOT change the content of the alteration files after they are created. If you need to change the alteration, you should create a new alteration file with the new content.

## Deploy unreleased alterations

To deploy scripts with the `next` version, run `pnpm alteration deploy next`. This is helpful if you want to test your alteration scripts.

## Typing

```ts
type AlterationScript = {
  beforeUp?: (pool: DatabasePool) => Promise<void>;
  beforeDown?: (pool: DatabasePool) => Promise<void>;
  up: (connection: DatabaseTransactionConnection) => Promise<void>;
  down: (connection: DatabaseTransactionConnection) => Promise<void>;
};
```

`up` runs inside a transaction together with the alteration state update, so a failure there rolls back `up` and records no state. `beforeUp` runs first, outside any transaction, for statements that cannot run inside one, such as `create index concurrently`. Whatever it committed stays even if `up` later fails, and a rerun runs `beforeUp` again, so it must cope with its own earlier work. `down` and `beforeDown` are their counterparts for reverting.

## Example

```ts
import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const alteration: AlterationScript = {
  up: async (connection) => {
    await connection.query(sql`
      alter table users
        add column email varchar(255);
    `);
  },
  down: async (connection) => {
    await connection.query(sql`
      alter table users
        drop column email;
    `);
  },
};

export default alteration;
```

## Indexes

- Never add `if not exists` to `create index`. If an index with that name already exists, from schema drift or an invalid leftover of an interrupted `concurrently` build, the alteration must fail so the operator investigates instead of silently skipping.
- `create index concurrently` and `drop index concurrently` go in `beforeUp` / `beforeDown`, with `up` / `down` left as no-ops. The seed in `tables/*.sql` carries the same index without `concurrently`.
- One alteration file per concurrent index. The alteration state is recorded per file and the rule above forbids `if not exists`, so a rerun after an interruption only needs the one invalid index dropped; with several indexes in one file, the ones already built would make the rerun fail too.
- A build or drop on a large table outlives the pool's default statement timeout. Run it inside `withoutStatementTimeout` from `utils/`:

```ts
import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';
import { withoutStatementTimeout } from './utils/1792569975-statement-timeout.js';

const alteration: AlterationScript = {
  beforeUp: async (pool) => {
    await withoutStatementTimeout(pool, async (connection) => {
      await connection.query(sql`
        create index concurrently users__primary_email_lower
          on users (tenant_id, primary_email_lower)
          where primary_email_lower is not null;
      `);
    });
  },
  up: async () => {
    /** `concurrently` cannot run inside a transaction. */
  },
  beforeDown: async (pool) => {
    await withoutStatementTimeout(pool, async (connection) => {
      await connection.query(sql`drop index concurrently users__primary_email_lower;`);
    });
  },
  down: async () => {
    /** `concurrently` cannot run inside a transaction. */
  },
};

export default alteration;
```

A long statement inside `up` / `down` cannot use the helper, which needs the pool; run `set local statement_timeout = 0` on the transaction first instead.

Indexes on row-level-security tables follow the rules in the package [README](../README.md#indexes-under-row-level-security).

## Backfills

- A backfill that touches many rows runs in `beforeUp` in batches, so each statement stays short and the loop can resume after an interruption. `beforeUp` runs before `up`, so the column and its trigger must already exist: add them in an earlier alteration.
- Walk the table in a fixed order through an existing index and remember the last key seen. A loop of the form `where <column> is null limit 1000` rescans the rows earlier batches already filled and grows quadratic on large tables.
- Check first and fill only what is missing, so a rerun on an already-filled table is cheap.
- Finish by counting what is still missing and throw if the count is not zero, so the alteration fails instead of recording a state that later code relies on.
