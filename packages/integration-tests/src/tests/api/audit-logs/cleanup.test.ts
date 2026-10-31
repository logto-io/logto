import { defaultTenantId, hook, interaction, LogResult } from '@logto/schemas';
import { generateStandardId } from '@logto/shared';
import { assertEnv } from '@silverhand/essentials';
import { createInterceptorsPreset, createPool, sql, type DatabasePool } from '@silverhand/slonik';

import { authedAdminApi } from '#src/api/api.js';
import { getAuditLogs } from '#src/api/logs.js';

type CleanupResponse = {
  deletedCount: number;
  hasMore: boolean;
  deletedRange?: { oldest: number; newest: number };
};

// Integration coverage for `DELETE /api/logs`.
//
// The rows are inserted directly with SQL rather than produced through the API, matching the
// approach already used in this directory by `time-window.test.ts`, `log-payload-keys.test.ts`
// and `trusted-device.test.ts`. Three reasons:
//
// 1. `created_at` is always `now()` for logs the application writes, while the boundary behaviour
//    lives at sub-millisecond resolution: the fixture needs rows exactly on each bound, one
//    millisecond outside, and half a millisecond inside.
// 2. The Management API does not write audit logs at all — `koaAuditLog` is mounted on the
//    experience router only — so driving this suite's API cannot produce the needed rows.
// 3. The delete filters by time and key prefix only, so borrowing rows produced by other tests
//    would delete shared state and make this test depend on execution order.
//
// The window is deliberately far in the past where no other test writes rows, and unique log keys
// keep this test's fixtures distinguishable. The assertions read back through the API (GET before
// and after), so the seeded rows are never trusted blindly.
describe('DELETE /logs cleanup', () => {
  // 2020-09-13T12:26:40.000Z, one minute wide. Both bounds are inclusive, matching `GET /logs`.
  const startTime = 1_600_000_000_000;
  const endTime = startTime + 60_000;

  const belowStartId = generateStandardId(); // Started one millisecond earlier: outside
  const subMsBelowStartId = generateStandardId(); // Half a millisecond earlier: outside
  const atStartId = generateStandardId(); // Exactly on the inclusive lower bound: inside
  const insideId = generateStandardId(); // Well inside: inside
  const atEndId = generateStandardId(); // Exactly on the inclusive upper bound: inside
  const subMsAtEndId = generateStandardId(); // Half a millisecond later: still inside
  const aboveEndId = generateStandardId(); // One millisecond later: outside

  const seededRows = [
    { id: belowStartId, createdAt: startTime - 1 },
    { id: subMsBelowStartId, createdAt: startTime - 0.5 },
    { id: atStartId, createdAt: startTime },
    { id: insideId, createdAt: startTime + 1000 },
    { id: atEndId, createdAt: endTime },
    { id: subMsAtEndId, createdAt: endTime + 0.5 },
    { id: aboveEndId, createdAt: endTime + 1 },
  ];

  // `subMsAtEndId` is the case that proves the upper bound is inclusive at millisecond
  // granularity: it is stamped at `endTime + 0.5` ms and is displayed as `endTime`.
  const deletedIds = [atStartId, insideId, atEndId, subMsAtEndId];
  const survivingIds = [belowStartId, subMsBelowStartId, aboveEndId];

  const logKey = `${interaction.prefix}.CleanupBoundary.${generateStandardId()}`;

  // Webhook delivery logs share the `logs` table but are a separate surface. One sits inside the
  // window and must survive: `DELETE /api/logs` only targets audit log keys.
  const webhookLogKey = `${hook.Type.TriggerHook}.SignIn`;
  const webhookLogId = generateStandardId();

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
      insert into logs (tenant_id, id, key, payload, created_at)
      values ${sql.join(
        seededRows.map(
          ({ id, createdAt }) => sql`(
            ${defaultTenantId},
            ${id},
            ${logKey},
            ${sql.jsonb({ key: logKey, result: LogResult.Success })},
            to_timestamp(${createdAt}::double precision / 1000)
          )`
        ),
        sql`, `
      )}
    `);

    await pool.query(sql`
      insert into logs (tenant_id, id, key, payload, created_at)
      values (
        ${defaultTenantId},
        ${webhookLogId},
        ${webhookLogKey},
        ${sql.jsonb({ key: webhookLogKey, result: LogResult.Success, hookId: 'probe-hook' })},
        to_timestamp(${startTime + 1000}::double precision / 1000)
      )
    `);
  });

  afterAll(async () => {
    await pool.query(sql`
      delete from logs
      where tenant_id = ${defaultTenantId} and key in (${logKey}, ${webhookLogKey})
    `);
    await pool.end();
  });

  it('deletes exactly the audit logs inside the inclusive window', async () => {
    // Read the seeded rows back through the public API first, so the test proves the list and
    // delete endpoints agree on what exists, rather than only trusting the seeder.
    const beforeDelete = await getAuditLogs(new URLSearchParams({ logKey }));
    expect(
      beforeDelete
        .map(({ id }) => id)
        .slice()
        .sort()
    ).toEqual(
      seededRows
        .map(({ id }) => id)
        .slice()
        .sort()
    );

    const response = await authedAdminApi.delete('logs', {
      searchParams: { start_time: String(startTime), end_time: String(endTime) },
    });
    const body = await response.json<CleanupResponse>();

    expect(response.status).toBe(200);
    expect(body).toEqual({
      deletedCount: deletedIds.length,
      hasMore: false,
      deletedRange: { oldest: startTime, newest: endTime },
    });

    // And read the survivors back through the API: only the rows outside the window remain.
    const afterDelete = await getAuditLogs(new URLSearchParams({ logKey }));
    expect(
      afterDelete
        .map(({ id }) => id)
        .slice()
        .sort()
    ).toEqual(survivingIds.slice().sort());
  });

  it('leaves webhook delivery logs inside the same window untouched', async () => {
    const remaining = await pool.any<{ id: string }>(sql`
      select id from logs
      where tenant_id = ${defaultTenantId} and id = ${webhookLogId}
    `);

    expect(remaining).toHaveLength(1);
  });
});
