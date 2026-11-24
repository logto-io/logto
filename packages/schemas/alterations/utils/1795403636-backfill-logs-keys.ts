import { setTimeout as sleep } from 'node:timers/promises';

import { type CommonQueryMethods, sql } from '@silverhand/slonik';

const batchSize = 1000;
const batchDelayMs = 50;

// The trigger fills the columns on insert, so a row it has seen with any key fails the null checks
// before `payload`, which may be stored out of line, is read.
const needsFill = sql`(
  payload_user_id is null
  and payload_application_id is null
  and payload_hook_id is null
  and (
    payload->>'userId' is not null
    or payload->>'applicationId' is not null
    or payload->>'hookId' is not null
  )
)`;

// The fill writes all three keys in one statement, so one that does not fit fails the whole batch:
// `payload_user_id` is `varchar(128)`, `payload_hook_id` is `varchar(21)`, and a btree entry is
// capped at 2704 bytes, which `payload_application_id` shares with `tenant_id` and `created_at` in
// its index.
const fits = sql`(
  coalesce(length(payload->>'userId'), 0) <= 128
  and coalesce(length(payload->>'hookId'), 0) <= 21
  and coalesce(octet_length(payload->>'applicationId'), 0) <= 2600
)`;

type UnfilledCount = {
  tenantId: string;
  needed: number;
  overLong: number;
};

/**
 * Counts rows with a `payload` key but empty `payload_*` columns, split by whether they fit, in one
 * scan of the table.
 */
const countUnfilled = async (connection: CommonQueryMethods) =>
  connection.any<UnfilledCount>(sql`
    select
      tenant_id,
      count(*) filter (where ${fits}) as needed,
      count(*) filter (where not ${fits}) as over_long
    from logs
    where ${needsFill}
    group by tenant_id
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
        select id from logs
        where id > ${lastId}
        order by id
        limit ${batchSize}
      ),
      locked as (
        select target.id from logs as target
        join batch on batch.id = target.id
        where ${needsFill}
          and ${fits}
        for no key update of target skip locked
      ),
      filled as (
        update logs as target set
          payload_user_id = target.payload->>'userId',
          payload_application_id = target.payload->>'applicationId',
          payload_hook_id = target.payload->>'hookId'
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

  console.log(`Filled ${filledCount} logs rows.`);
};

const formatCounts = (counts: readonly UnfilledCount[], key: 'needed' | 'overLong') =>
  counts.map((count) => `${count.tenantId}: ${count[key]}`).join(', ');

/**
 * Fills the `payload_*` key columns of `logs` rows written before their trigger existed. Rows with
 * a key too long for its column or index are reported and left unfilled.
 *
 * @throws If rows that fit their columns are still unfilled after the fill.
 */
export const backfillLogsKeys = async (connection: CommonQueryMethods) => {
  const initialCounts = await countUnfilled(connection);
  const hasPending = initialCounts.some(({ needed }) => needed > 0);

  if (hasPending) {
    await fill(connection);
  }

  const counts = hasPending ? await countUnfilled(connection) : initialCounts;
  const overLong = counts.filter(({ overLong }) => overLong > 0);
  const unfilled = counts.filter(({ needed }) => needed > 0);

  if (overLong.length > 0) {
    console.warn(
      `logs rows with a payload key too long for its column or index were left unfilled and match no user, application or hook filter (tenant: rows): ${formatCounts(overLong, 'overLong')}`
    );
  }

  if (unfilled.length > 0) {
    throw new Error(
      `logs rows still have unfilled payload_* columns (tenant: rows): ${formatCounts(unfilled, 'needed')}. Deploy again to retry.`
    );
  }
};
