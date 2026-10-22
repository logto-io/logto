import { LogResult, defaultTenantId } from '@logto/schemas';
import { assertEnv } from '@silverhand/essentials';
import {
  createInterceptorsPreset,
  createPool,
  sql,
  type DatabasePool,
  type DatabasePoolConnection,
  type SqlSqlToken,
} from '@silverhand/slonik';

import { expectIndexCondition, explainAsTenant } from '#src/helpers/query-plan.js';

const seedRows = async (connection: DatabasePoolConnection) => {
  await connection.query(sql`
    insert into logs (tenant_id, id, key, payload, created_at)
    select
      ${defaultTenantId},
      'qp-log-' || n,
      'Unknown',
      jsonb_build_object(
        'key', 'Unknown',
        'result', ${LogResult.Success}::text,
        'userId', 'query-plan-seed-user-' || (n % 5),
        'applicationId', 'query-plan-seed-app-' || (n % 5),
        -- Short: hook ids fit payload_hook_id varchar(21), longer values fail the trigger.
        'hookId', 'qp-hook-' || (n % 5)
      ),
      now() - n * interval '1 minute'
    from generate_series(1, 20) as n
  `);
  await connection.query(sql`analyze logs`);
};

const hasSortNode = (plan: readonly string[]) =>
  plan.some((line) => /^(->\s+)?(Incremental )?Sort\b/.test(line.trimStart()));

describe('logs query plans under the tenant role', () => {
  /* eslint-disable @silverhand/fp/no-let -- pool handle assigned in beforeAll */
  let pool: DatabasePool;
  /* eslint-enable @silverhand/fp/no-let */

  const explain = async (statement: SqlSqlToken) =>
    explainAsTenant(pool, defaultTenantId, statement, seedRows);

  beforeAll(async () => {
    /* eslint-disable @silverhand/fp/no-mutation -- pool handle assigned in beforeAll */
    pool = await createPool(assertEnv('DB_URL'), {
      interceptors: createInterceptorsPreset(),
    });
    /* eslint-enable @silverhand/fp/no-mutation */
  });

  afterAll(async () => {
    await pool.end();
  });

  // The shape `findLogs` runs once it filters on the column: one key, newest first.
  it.each([
    ['user', 'payload_user_id', 'query-plan-seed-user-1'],
    ['application', 'payload_application_id', 'query-plan-seed-app-1'],
    ['hook', 'payload_hook_id', 'qp-hook-1'],
  ])('seeks the %s filter and returns rows in order', async (_, column, value) => {
    const plan = await explain(sql`
      select id from logs
      where ${sql.identifier([column])} = ${value}
      order by created_at desc
      limit ${20}
      offset ${0}
    `);

    expectIndexCondition(plan, column);
    expect(hasSortNode(plan)).toBe(false);
  });

  it('keeps the user seek with the console key prefixes and a time window', async () => {
    const plan = await explain(sql`
      select id from logs
      where (key like ${'ExchangeTokenBy.%'} or key like ${'Interaction.%'} or key like ${'Unknown%'})
        and payload_user_id = ${'query-plan-seed-user-1'}
        and created_at >= now() - interval '1 day'
        and created_at < now()
      order by created_at desc
      limit ${20}
      offset ${0}
    `);

    expectIndexCondition(plan, 'payload_user_id');
    expect(hasSortNode(plan)).toBe(false);
  });

  it('seeks the webhook execution stats by hook id and time', async () => {
    // The shape `getHookExecutionStatsByHookId` runs once it filters on the column.
    const startTimeExclusive = Date.now() - 24 * 60 * 60 * 1000;
    const plan = await explain(sql`
      select count(*) as request_count,
      count(case when payload->>'result' = 'Success' then 1 end) as success_count
      from logs
      where created_at > to_timestamp(${startTimeExclusive}::double precision / 1000)
        and payload_hook_id = ${'qp-hook-1'}
    `);

    expectIndexCondition(plan, 'payload_hook_id');
    expectIndexCondition(plan, 'created_at');
  });
});
