import { setTimeout as sleep } from 'node:timers/promises';

import { type CommonQueryMethods, sql } from '@silverhand/slonik';

const batchSize = 1000;
const batchDelayMs = 50;

// Catches unfilled and wrong rows alike. The columns are not unique, so case-variant duplicates
// need no special handling.
const needsFill = sql`(
  primary_email_lower is distinct from lower(primary_email)
  or username_lower is distinct from lower(username)
)`;

// Both columns are `varchar(384)`; one longer value would fail the whole batch statement.
const fits = sql`(
  coalesce(length(lower(primary_email)), 0) <= 384
  and coalesce(length(lower(username)), 0) <= 384
)`;

type UnfilledCount = {
  needed: number;
  overLong: number;
};

/** Counts users whose lower-cased columns differ from their source, split by whether they fit. */
const countUnfilled = async (connection: CommonQueryMethods) =>
  connection.one<UnfilledCount>(sql`
    select
      count(*) filter (where ${fits}) as needed,
      count(*) filter (where not ${fits}) as over_long
    from users
    where ${needsFill}
  `);

const fill = async (connection: CommonQueryMethods) => {
  /* eslint-disable @silverhand/fp/no-let, @silverhand/fp/no-mutation -- keyset cursor and running total */
  let lastId = '';
  let filledCount = 0;

  for (;;) {
    // eslint-disable-next-line no-await-in-loop -- each batch starts after the previous one's last id
    const { lastBatchId, scanned, filled } = await connection.one<{
      lastBatchId: string | null;
      scanned: number;
      filled: number;
    }>(sql`
      with batch as (
        select id from users
        where id > ${lastId}
        order by id
        limit ${batchSize}
      ),
      locked as (
        select target.id from users as target
        join batch on batch.id = target.id
        where ${needsFill}
          and ${fits}
        for no key update of target skip locked
      ),
      filled as (
        update users as target set
          primary_email_lower = lower(target.primary_email),
          username_lower = lower(target.username)
        from locked
        where target.id = locked.id
        returning 1
      )
      select
        (select max(id) from batch) as last_batch_id,
        (select count(*) from batch) as scanned,
        (select count(*) from filled) as filled
    `);

    filledCount += filled;

    if (!lastBatchId || scanned < batchSize) {
      break;
    }

    lastId = lastBatchId;

    if (filled > 0) {
      // eslint-disable-next-line no-await-in-loop -- pause after writes to spare live traffic
      await sleep(batchDelayMs);
    }
  }
  /* eslint-enable @silverhand/fp/no-let, @silverhand/fp/no-mutation */

  console.log(`Filled ${filledCount} users rows.`);
};

/**
 * Fills `primary_email_lower` and `username_lower` of users written before their trigger existed.
 * Users whose lower-cased value is longer than its column are reported and left unfilled.
 *
 * @throws If users that fit their columns still have a missing or wrong lower-cased value.
 */
export const backfillUsersLowerKeys = async (connection: CommonQueryMethods) => {
  const initialCount = await countUnfilled(connection);
  const hasPending = initialCount.needed > 0;

  if (hasPending) {
    await fill(connection);
  }

  const { needed, overLong } = hasPending ? await countUnfilled(connection) : initialCount;
  const listQuery = `select tenant_id, id from users where ${needsFill.sql.replaceAll(/\s+/g, ' ').trim()}`;

  if (overLong > 0) {
    console.warn(
      `${overLong} users have an email or username too long for its lower-cased column; they were left unfilled and cannot sign in by email or username. List them with: ${listQuery}`
    );
  }

  if (needed > 0) {
    throw new Error(
      `${needed} users still have a missing or wrong primary_email_lower or username_lower and could not sign in by email or username. Deploy again to retry; if they remain, list them with: ${listQuery}`
    );
  }
};
