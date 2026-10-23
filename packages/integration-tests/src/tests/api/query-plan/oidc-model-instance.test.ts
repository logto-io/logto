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

    it.todo('seeks by the grant id once it is stored in a column');
  });
});
