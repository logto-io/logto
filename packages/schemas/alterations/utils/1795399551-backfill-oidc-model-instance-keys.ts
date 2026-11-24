import { setTimeout as sleep } from 'node:timers/promises';

import { type CommonQueryMethods, sql } from '@silverhand/slonik';

const batchSize = 1000;
const batchDelayMs = 50;

// The trigger writes all four columns together, so a row it has seen fails the null checks before
// `payload`, which may be stored out of line, is read.
const needsFill = sql`(
  payload_grant_id is null
  and payload_account_id is null
  and payload_uid is null
  and payload_user_code is null
  and (
    payload->>'grantId' is not null
    or payload->>'accountId' is not null
    or payload->>'uid' is not null
    or payload->>'userCode' is not null
  )
)`;

// The fill writes all four keys into `varchar(128)` columns, so one over-long key would fail the
// whole batch statement.
const fits = sql`(
  coalesce(length(payload->>'grantId'), 0) <= 128
  and coalesce(length(payload->>'accountId'), 0) <= 128
  and coalesce(length(payload->>'uid'), 0) <= 128
  and coalesce(length(payload->>'userCode'), 0) <= 128
)`;

type UnfilledCount = {
  tenantId: string;
  modelName: string;
  needed: number;
  overLong: number;
};

/** Counts live rows with a `payload` key but empty `payload_*` columns, split by whether they fit. */
const countUnfilled = async (connection: CommonQueryMethods) => {
  const tenantIds = await connection.anyFirst<string>(sql`select id from tenants order by id`);
  const counts: UnfilledCount[] = [];

  for (const tenantId of tenantIds) {
    // eslint-disable-next-line no-await-in-loop -- one short statement per tenant keeps each snapshot short
    const rows = await connection.any<Omit<UnfilledCount, 'tenantId'>>(sql`
      select
        model_name,
        count(*) filter (where ${fits}) as needed,
        count(*) filter (where not ${fits}) as over_long
      from oidc_model_instances
      where tenant_id = ${tenantId}
        and expires_at > now()
        and ${needsFill}
      group by model_name
    `);
    // eslint-disable-next-line @silverhand/fp/no-mutating-methods -- accumulating sequential results
    counts.push(...rows.map((row) => ({ tenantId, ...row })));
  }

  return counts;
};

const fillModel = async (connection: CommonQueryMethods, tenantId: string, modelName: string) => {
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
        select id from oidc_model_instances
        where tenant_id = ${tenantId}
          and model_name = ${modelName}
          and id > ${lastId}
        order by id
        limit ${batchSize}
      ),
      locked as (
        select target.id from oidc_model_instances as target
        join batch on batch.id = target.id
        where target.expires_at > now()
          and ${needsFill}
          and ${fits}
        for no key update of target skip locked
      ),
      filled as (
        update oidc_model_instances as target set
          payload_grant_id = target.payload->>'grantId',
          payload_account_id = target.payload->>'accountId',
          payload_uid = target.payload->>'uid',
          payload_user_code = target.payload->>'userCode'
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
    // eslint-disable-next-line no-await-in-loop -- pause between batches to spare live traffic
    await sleep(batchDelayMs);
  }
  /* eslint-enable @silverhand/fp/no-let, @silverhand/fp/no-mutation */

  console.log(`Filled ${filledCount} ${modelName} rows of tenant ${tenantId}.`);
};

const formatCounts = (counts: UnfilledCount[], key: 'needed' | 'overLong') =>
  counts.map((count) => `${count.tenantId}/${count.modelName}: ${count[key]}`).join(', ');

/**
 * Fills the `payload_*` key columns of live `oidc_model_instances` rows written before their
 * trigger existed. Rows with a key longer than its `varchar(128)` column are reported and left
 * unfilled.
 *
 * @throws If live rows that fit their columns are still unfilled after the fill.
 */
export const backfillOidcModelInstanceKeys = async (connection: CommonQueryMethods) => {
  const initialCounts = await countUnfilled(connection);
  const pending = initialCounts.filter(({ needed }) => needed > 0);

  for (const { tenantId, modelName } of pending) {
    // eslint-disable-next-line no-await-in-loop -- one walk at a time to limit write load
    await fillModel(connection, tenantId, modelName);
  }

  const counts = pending.length > 0 ? await countUnfilled(connection) : initialCounts;
  const overLong = counts.filter(({ overLong }) => overLong > 0);
  const unfilled = counts.filter(({ needed }) => needed > 0);

  if (overLong.length > 0) {
    console.warn(
      `Live oidc_model_instances rows with a payload key over 128 characters were left unfilled (tenant/model: rows): ${formatCounts(overLong, 'overLong')}`
    );
  }

  if (unfilled.length > 0) {
    throw new Error(
      `Live oidc_model_instances rows still have unfilled payload_* columns (tenant/model: rows): ${formatCounts(unfilled, 'needed')}. Deploy again to retry.`
    );
  }
};
