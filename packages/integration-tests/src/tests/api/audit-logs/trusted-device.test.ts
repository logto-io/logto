import { LogResult, defaultTenantId, trustedDevice } from '@logto/schemas';
import { generateStandardId } from '@logto/shared';
import { assertEnv } from '@silverhand/essentials';
import { createInterceptorsPreset, createPool, sql, type DatabasePool } from '@silverhand/slonik';

import { getAuditLogs } from '#src/api/logs.js';

describe('trusted-device audit logs', () => {
  const createdLogId = generateStandardId();
  const usedLogId = generateStandardId();
  const createdLogKey = `${trustedDevice.prefix}.${trustedDevice.Type.Created}`;
  const usedLogKey = `${trustedDevice.prefix}.${trustedDevice.Type.Used}`;

  /* eslint-disable @silverhand/fp/no-let -- Jest lifecycle initializes the shared database pool */
  let pool: DatabasePool;
  /* eslint-enable @silverhand/fp/no-let */

  beforeAll(async () => {
    /* eslint-disable @silverhand/fp/no-mutation -- Jest lifecycle initializes the shared database pool */
    pool = await createPool(assertEnv('DB_URL'), {
      interceptors: createInterceptorsPreset(),
    });
    /* eslint-enable @silverhand/fp/no-mutation */

    await pool.query(sql`
      insert into logs (tenant_id, id, key, payload)
      values
        (
          ${defaultTenantId},
          ${createdLogId},
          ${createdLogKey},
          ${sql.jsonb({ key: createdLogKey, result: LogResult.Success })}
        ),
        (
          ${defaultTenantId},
          ${usedLogId},
          ${usedLogKey},
          ${sql.jsonb({ key: usedLogKey, result: LogResult.Success })}
        )
    `);
  });

  afterAll(async () => {
    await pool.query(sql`
      delete from logs where id in (${createdLogId}, ${usedLogId})
    `);
    await pool.end();
  });

  it.each([
    [createdLogKey, createdLogId],
    [usedLogKey, usedLogId],
  ])('returns %s from the audit log listing endpoint', async (logKey, logId) => {
    const logs = await getAuditLogs(new URLSearchParams({ logKey }));

    expect(logs.some(({ id }) => id === logId)).toBeTruthy();
  });
});
