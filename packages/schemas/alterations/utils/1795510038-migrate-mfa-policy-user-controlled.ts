import { setTimeout as sleep } from 'node:timers/promises';

import { type CommonQueryMethods, sql } from '@silverhand/slonik';

const batchSize = 1000;
const batchDelayMs = 50;

type BatchResult = {
  lastBatchTenantId: string | null;
  lastBatchId: string | null;
  scanned: number | string;
  migrated: number | string;
};

const countPending = async (connection: CommonQueryMethods) => {
  const count = await connection.oneFirst<number | string>(sql`
    select count(*)
    from sign_in_experiences
    where mfa->>'policy' = 'UserControlled'
  `);

  return Number(count);
};

const migrateBatches = async (connection: CommonQueryMethods) => {
  /* eslint-disable @silverhand/fp/no-let, @silverhand/fp/no-mutation -- keyset cursor and running total */
  let lastTenantId = '';
  let lastId = '';
  let migratedCount = 0;

  for (;;) {
    // eslint-disable-next-line no-await-in-loop -- each batch starts after the previous one's last key
    const batchResult = await connection.one<BatchResult>(sql`
      with batch as (
        select tenant_id, id
        from sign_in_experiences
        where (tenant_id, id) > (${lastTenantId}, ${lastId})
        order by tenant_id, id
        limit ${batchSize}
      ),
      locked as (
        select target.tenant_id, target.id
        from sign_in_experiences as target
        join batch
          on batch.tenant_id = target.tenant_id
          and batch.id = target.id
        where target.mfa->>'policy' = 'UserControlled'
        for no key update of target skip locked
      ),
      migrated as (
        update sign_in_experiences as target
        set mfa = jsonb_set(target.mfa, '{policy}', '"PromptAtSignInAndSignUp"')
        from locked
        where target.tenant_id = locked.tenant_id
          and target.id = locked.id
        returning 1
      )
      select
        (select tenant_id from batch order by tenant_id desc, id desc limit 1) as last_batch_tenant_id,
        (select id from batch order by tenant_id desc, id desc limit 1) as last_batch_id,
        (select count(*) from batch) as scanned,
        (select count(*) from migrated) as migrated
    `);

    const scanned = Number(batchResult.scanned);
    const migrated = Number(batchResult.migrated);
    migratedCount += migrated;

    if (
      batchResult.lastBatchTenantId === null ||
      batchResult.lastBatchId === null ||
      scanned < batchSize
    ) {
      break;
    }

    lastTenantId = batchResult.lastBatchTenantId;
    lastId = batchResult.lastBatchId;

    if (migrated > 0) {
      // eslint-disable-next-line no-await-in-loop -- pause after writes to spare live traffic
      await sleep(batchDelayMs);
    }
  }
  /* eslint-enable @silverhand/fp/no-let, @silverhand/fp/no-mutation */

  console.log(`Migrated ${migratedCount} sign_in_experiences rows.`);
};

export const migrateMfaPolicyUserControlled = async (connection: CommonQueryMethods) => {
  const initialCount = await countPending(connection);

  if (initialCount === 0) {
    return;
  }

  await migrateBatches(connection);

  const remainingCount = await countPending(connection);

  if (remainingCount > 0) {
    throw new Error(
      `sign_in_experiences still has ${remainingCount} rows with mfa.policy = 'UserControlled'. Deploy again to retry.`
    );
  }
};
