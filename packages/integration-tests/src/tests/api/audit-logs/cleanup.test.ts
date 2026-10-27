import { defaultTenantId, interaction, LogResult } from '@logto/schemas';
import { generateStandardId } from '@logto/shared';
import { assertEnv } from '@silverhand/essentials';
import { createInterceptorsPreset, createPool, sql, type DatabasePool } from '@silverhand/slonik';

import { authedAdminApi } from '#src/api/api.js';

type CleanupResponse = {
  deletedCount: number;
  hasMore: boolean;
  deletedRange?: { oldest: number; newest: number };
};

// Integration coverage for `DELETE /api/logs`. The endpoint accepts no log filter, so the
// window is deliberately far in the past where no other test writes rows; the unique log key
// then keeps this test's fixtures distinguishable for seeding and verification.
describe('DELETE /logs cleanup', () => {
  // 2020-09-13T12:26:40.000Z, one minute wide.
  const lowerBound = 1_600_000_000_000;
  const upperBound = lowerBound + 60_000;

  // The endpoint deletes `lowerBound < created_at < upperBound`. Seed one row exactly on each
  // exclusive bound and one row one millisecond inside each bound; only the interior rows may
  // be deleted.
  const atLowerBoundId = generateStandardId();
  const insideLowerBoundId = generateStandardId();
  const insideUpperBoundId = generateStandardId();
  const atUpperBoundId = generateStandardId();

  const seededRows = [
    { id: atLowerBoundId, createdAt: lowerBound },
    { id: insideLowerBoundId, createdAt: lowerBound + 1 },
    { id: insideUpperBoundId, createdAt: upperBound - 1 },
    { id: atUpperBoundId, createdAt: upperBound },
  ];
  const survivingIds = [atLowerBoundId, atUpperBoundId];

  const logKey = `${interaction.prefix}.CleanupBoundary.${generateStandardId()}`;

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
  });

  afterAll(async () => {
    await pool.query(sql`
      delete from logs
      where tenant_id = ${defaultTenantId} and key = ${logKey}
    `);
    await pool.end();
  });

  it('deletes only the rows strictly between the exclusive bounds', async () => {
    const response = await authedAdminApi.delete('logs', {
      searchParams: { before: String(upperBound), after: String(lowerBound) },
    });
    const body = await response.json<CleanupResponse>();

    expect(response.status).toBe(200);
    expect(body).toEqual({
      deletedCount: 2,
      hasMore: false,
      deletedRange: { oldest: lowerBound + 1, newest: upperBound - 1 },
    });

    const remainingRows = await pool.any<{ id: string }>(sql`
      select id from logs
      where tenant_id = ${defaultTenantId} and key = ${logKey}
    `);
    expect(
      remainingRows
        .map(({ id }) => id)
        .slice()
        .sort()
    ).toEqual(survivingIds.slice().sort());
  });
});
