import { LogKeyUnknown, LogResult, defaultTenantId, type Log } from '@logto/schemas';
import { generateStandardId } from '@logto/shared';
import { assertEnv } from '@silverhand/essentials';
import { createInterceptorsPreset, createPool, sql, type DatabasePool } from '@silverhand/slonik';

import { runAsTenant } from '#src/helpers/tenant-role.js';

type PayloadKeys = Pick<Log, 'payloadUserId' | 'payloadApplicationId' | 'payloadHookId'>;

describe('logs payload key columns', () => {
  const id = generateStandardId();
  // A valid audit log payload, so the row never breaks `GET /api/logs` while it exists.
  const basePayload = { key: LogKeyUnknown, result: LogResult.Success };
  /* eslint-disable @silverhand/fp/no-let -- pool handle assigned in beforeAll */
  let pool: DatabasePool;
  /* eslint-enable @silverhand/fp/no-let */

  const findKeys = async () =>
    pool.one<PayloadKeys>(sql`
      select payload_user_id, payload_application_id, payload_hook_id
      from logs
      where tenant_id = ${defaultTenantId} and id = ${id}
    `);

  beforeAll(async () => {
    /* eslint-disable @silverhand/fp/no-mutation -- pool handle assigned in beforeAll */
    pool = await createPool(assertEnv('DB_URL'), {
      interceptors: createInterceptorsPreset(),
    });
    /* eslint-enable @silverhand/fp/no-mutation */
  });

  afterAll(async () => {
    await pool.query(sql`delete from logs where tenant_id = ${defaultTenantId} and id = ${id}`);
    await pool.end();
  });

  it('fills the columns on insert and leaves absent keys null', async () => {
    await runAsTenant(pool, defaultTenantId, async (transaction) =>
      transaction.query(sql`
        insert into logs (tenant_id, id, key, payload)
        values (${defaultTenantId}, ${id}, ${LogKeyUnknown}, ${sql.jsonb({
          ...basePayload,
          userId: 'user-1',
          applicationId: 'application-1',
        })})
      `)
    );

    await expect(findKeys()).resolves.toEqual({
      payloadUserId: 'user-1',
      payloadApplicationId: 'application-1',
      payloadHookId: null,
    });
  });

  it('refreshes the columns when the payload is rewritten', async () => {
    // Longer than any registered application id: some routes log a request-supplied id.
    const applicationId = 'a'.repeat(300);

    await runAsTenant(pool, defaultTenantId, async (transaction) =>
      transaction.query(sql`
        update logs
        set payload = ${sql.jsonb({ ...basePayload, applicationId, hookId: 'hook-1' })}
        where tenant_id = ${defaultTenantId} and id = ${id}
      `)
    );

    await expect(findKeys()).resolves.toEqual({
      payloadUserId: null,
      payloadApplicationId: applicationId,
      payloadHookId: 'hook-1',
    });
  });

  it('overwrites a direct write to a key column from the payload', async () => {
    await runAsTenant(pool, defaultTenantId, async (transaction) =>
      transaction.query(sql`
        update logs set payload_hook_id = 'drifted'
        where tenant_id = ${defaultTenantId} and id = ${id}
      `)
    );

    await expect(findKeys()).resolves.toMatchObject({ payloadHookId: 'hook-1' });
  });
});
