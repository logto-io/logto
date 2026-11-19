import { defaultTenantId } from '@logto/schemas';
import { assertEnv } from '@silverhand/essentials';
import {
  createInterceptorsPreset,
  createPool,
  sql,
  type DatabasePool,
  type DatabasePoolConnection,
  type SqlSqlToken,
} from '@silverhand/slonik';

import {
  expectFilter,
  expectIndexCondition,
  expectNoIndexCondition,
  explainAsTenant,
} from '#src/helpers/query-plan.js';

// `explain` prints operators space-padded, unlike the query text.
const grantIdExpression = /payload ->> 'grantId'/;

const seedRows = async (connection: DatabasePoolConnection) => {
  await connection.query(sql`
    insert into oidc_model_instances (tenant_id, model_name, id, payload, expires_at)
    select
      ${defaultTenantId},
      'RefreshToken',
      'query-plan-seed-' || n,
      jsonb_build_object('grantId', 'query-plan-seed-grant-' || n),
      now() + interval '1 hour'
    from generate_series(1, 10) as n
  `);
  await connection.query(sql`
    insert into oidc_model_instances (tenant_id, model_name, id, payload, expires_at)
    select
      ${defaultTenantId},
      model,
      'query-plan-seed-' || lower(model) || '-' || n,
      jsonb_build_object('accountId', 'query-plan-seed-account-' || n)
        || case when model = 'Session' then jsonb_build_object('uid', 'query-plan-seed-uid-' || n) else '{}' end,
      now() + interval '1 hour'
    from generate_series(1, 10) as n, unnest(array['Session', 'Grant']) as model
  `);
  await connection.query(sql`
    insert into oidc_model_instances (tenant_id, model_name, id, payload, expires_at)
    select
      ${defaultTenantId},
      'DeviceCode',
      'query-plan-seed-device-code-' || n,
      jsonb_build_object('userCode', 'query-plan-seed-user-code-' || n),
      now() + interval '1 hour'
    from generate_series(1, 10) as n
  `);
  await connection.query(sql`analyze oidc_model_instances`);
};

describe('oidc_model_instances query plans under the tenant role', () => {
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

  it('seeks by the tenant policy', async () => {
    const plan = await explain(
      sql`select id from oidc_model_instances where model_name = ${'RefreshToken'}`
    );

    expectIndexCondition(plan, 'tenant_id');
  });

  it('seeks by id', async () => {
    const plan = await explain(
      sql`
        select payload, consumed_at from oidc_model_instances
        where model_name = ${'RefreshToken'} and id = ${'query-plan-test-id'}
      `
    );

    expectIndexCondition(plan, 'id');
  });

  describe('revoke by grant id', () => {
    // The lookup inside core's batched delete; the delete itself only probes the primary key.
    const statement = sql`
      select id from oidc_model_instances
      where model_name = ${'RefreshToken'}
        and payload ? 'grantId'
        and payload->>'grantId' = ${'query-plan-test-grant'}
      limit ${500}
    `;

    it('filters the grant id instead of seeking by it', async () => {
      const plan = await explain(statement);

      expectIndexCondition(plan, 'tenant_id');
      expectNoIndexCondition(plan, grantIdExpression);
      expectFilter(plan, grantIdExpression);
    });

    it('seeks by the grant id column', async () => {
      const plan = await explain(sql`
        select id from oidc_model_instances
        where model_name = ${'RefreshToken'}
          and payload_grant_id = ${'query-plan-seed-grant-1'}
        limit ${500}
      `);

      expectIndexCondition(plan, 'payload_grant_id');
    });
  });

  it.each(['Session', 'Grant'])('seeks a %s lookup by the account id column', async (modelName) => {
    const plan = await explain(sql`
      select id from oidc_model_instances
      where model_name = ${modelName}
        and payload_account_id = ${'query-plan-seed-account-1'}
        and expires_at > now()
    `);

    expectIndexCondition(plan, 'payload_account_id');
  });

  it('seeks by the tenant and filters the current uid lookup', async () => {
    // The shape `findPayloadByUid` runs today, after its expression index was dropped. The planner
    // may pick any Session-only partial index, which covers `model_name` by its predicate rather
    // than an Index Cond, so only the tenant seek is stable.
    const plan = await explain(sql`
      select payload, consumed_at from oidc_model_instances
      where model_name = ${'Session'} and payload->>'uid' = ${'query-plan-seed-uid-1'}
      limit ${2}
    `);

    expectIndexCondition(plan, 'tenant_id');
    expectFilter(plan, /payload ->> 'uid'/);
  });

  it('seeks a session lookup by the uid column', async () => {
    const plan = await explain(sql`
      select payload, consumed_at from oidc_model_instances
      where model_name = ${'Session'} and payload_uid = ${'query-plan-seed-uid-1'}
      limit ${2}
    `);

    expectIndexCondition(plan, 'payload_uid');
  });

  it('seeks a device code lookup by the user code column', async () => {
    const plan = await explain(sql`
      select payload, consumed_at from oidc_model_instances
      where model_name = ${'DeviceCode'} and payload_user_code = ${'query-plan-seed-user-code-1'}
      limit ${2}
    `);

    expectIndexCondition(plan, 'payload_user_code');
  });
});
