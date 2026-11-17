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

import { expectIndexCondition, explainAsTenant } from '#src/helpers/query-plan.js';

const seedRows = async (connection: DatabasePoolConnection) => {
  await connection.query(sql`
    insert into users (tenant_id, id, username, primary_email)
    select ${defaultTenantId}, 'qp-user-' || n, 'QP_User_' || n, 'QP.User.' || n || '@Example.com'
    from generate_series(1, 20) as n
  `);
  await connection.query(sql`analyze users`);
};

describe('users query plans under the tenant role', () => {
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

  // The shapes the email and case-insensitive username lookups run once they read the columns;
  // `lower()` on the parameter side has no column, so it does not stop the seek.
  it.each([
    ['email', 'primary_email_lower', 'qp.user.1@example.com'],
    ['username', 'username_lower', 'QP_User_1'],
  ])('seeks the %s lookup by its lower-cased column', async (_, column, value) => {
    const plan = await explain(sql`
      select id from users
      where ${sql.identifier([column])} = lower(${value})
        and id <> ${'qp-user-2'}
    `);

    expectIndexCondition(plan, column);
  });
});
