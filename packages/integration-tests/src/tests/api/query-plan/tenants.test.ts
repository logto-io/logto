import { defaultTenantId } from '@logto/schemas';
import { assertEnv } from '@silverhand/essentials';
import { createInterceptorsPreset, createPool, sql, type DatabasePool } from '@silverhand/slonik';

import { expectIndexCondition, explainAsTenant } from '#src/helpers/query-plan.js';

describe('tenants query plans under the tenant role', () => {
  /* eslint-disable @silverhand/fp/no-let -- pool handle assigned in beforeAll */
  let pool: DatabasePool;
  /* eslint-enable @silverhand/fp/no-let */

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

  it('seeks the row-level security tenant lookup by db_user', async () => {
    const plan = await explainAsTenant(pool, defaultTenantId, sql`select id from applications`);

    expectIndexCondition(plan, 'db_user');
  });
});
