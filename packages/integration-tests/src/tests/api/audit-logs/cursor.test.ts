import { defaultTenantId, hook, interaction, LogResult, type LogResponse } from '@logto/schemas';
import { generateStandardId } from '@logto/shared';
import { assertEnv } from '@silverhand/essentials';
import { createInterceptorsPreset, createPool, sql, type DatabasePool } from '@silverhand/slonik';

import { authedAdminApi } from '#src/api/api.js';

// Integration coverage for the audit-log cursor mode of `GET /api/logs`.
//
// Like `cleanup.test.ts`, the rows are seeded directly with SQL: the boundary and payload
// fixtures need timestamps far in the past and exact millisecond values, which the Management API
// cannot create. The window is far enough back and disjoint from other suites that the read can
// be scoped by time alone.
describe('GET /logs cursor mode', () => {
  const startTime = 1_600_000_200_000;
  const endTime = startTime + 60_000;

  const logKey = `${interaction.prefix}.Cursor.${generateStandardId()}`;
  const sameTimeIdA = generateStandardId();
  const sameTimeIdB = generateStandardId();
  const laterId = generateStandardId();
  const microsecondIdA = generateStandardId();
  const microsecondIdB = generateStandardId();
  const firstCreatedAt = startTime + 1000;
  const secondCreatedAt = startTime + 2000;
  // Outside the default window, so the main pagination assertions stay unaffected.
  const microsecondCreatedAt = endTime + 30_000;

  const firstPayloadA = {
    key: logKey,
    result: LogResult.Success,
    userId: 'cursor-user',
    applicationId: 'cursor-app',
  };
  const firstPayloadB = {
    key: logKey,
    result: LogResult.Success,
    userId: 'cursor-user',
    applicationId: 'cursor-app',
  };
  const laterPayload = {
    key: logKey,
    result: LogResult.Success,
    userId: 'cursor-user',
    applicationId: 'cursor-app',
  };

  // Cursor mode is audit-only; this row must never appear in its results.
  const webhookLogKey = `${hook.Type.TriggerHook}.Cursor.${generateStandardId()}`;
  const webhookLogId = generateStandardId();
  const webhookPayload = {
    key: webhookLogKey,
    result: LogResult.Success,
    hookId: 'cursor-probe',
  };

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
      values
        (
          ${defaultTenantId},
          ${sameTimeIdA},
          ${logKey},
          ${sql.jsonb(firstPayloadA)},
          to_timestamp(${firstCreatedAt}::double precision / 1000)
        ),
        (
          ${defaultTenantId},
          ${sameTimeIdB},
          ${logKey},
          ${sql.jsonb(firstPayloadB)},
          to_timestamp(${firstCreatedAt}::double precision / 1000)
        ),
        (
          ${defaultTenantId},
          ${laterId},
          ${logKey},
          ${sql.jsonb(laterPayload)},
          to_timestamp(${secondCreatedAt}::double precision / 1000)
        ),
        (
          ${defaultTenantId},
          ${webhookLogId},
          ${webhookLogKey},
          ${sql.jsonb(webhookPayload)},
          to_timestamp(${firstCreatedAt}::double precision / 1000)
        ),
        (
          ${defaultTenantId},
          ${microsecondIdA},
          ${logKey},
          ${sql.jsonb(laterPayload)},
          to_timestamp(${microsecondCreatedAt}::double precision / 1000) + interval '1 microsecond'
        ),
        (
          ${defaultTenantId},
          ${microsecondIdB},
          ${logKey},
          ${sql.jsonb(laterPayload)},
          to_timestamp(${microsecondCreatedAt}::double precision / 1000) + interval '2 microseconds'
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

  const getCursorPage = async (extra?: Record<string, string>) => {
    const searchParams = new URLSearchParams({
      pagination: 'cursor',
      start_time: String(startTime),
      end_time: String(endTime),
      ...extra,
    });

    return authedAdminApi.get('logs', {
      searchParams,
      throwHttpErrors: false,
    });
  };

  const readAllAuditIds = async (cursor?: string): Promise<string[]> => {
    const response = await getCursorPage({
      limit: '1',
      ...(cursor ? { cursor } : {}),
    });
    expect(response.status).toBe(200);

    const logs = await response.json<LogResponse[]>();
    const ids = logs.map(({ id }) => id);
    const nextCursor = response.headers.get('next-cursor') ?? undefined;

    return [...ids, ...(nextCursor ? await readAllAuditIds(nextCursor) : [])];
  };

  it('paginates rows that share a timestamp without dropping or duplicating them', async () => {
    const ids = await readAllAuditIds();

    expect(ids.slice().sort()).toEqual([sameTimeIdA, sameTimeIdB, laterId].slice().sort());
    expect(new Set(ids).size).toBe(3);
    expect(ids).not.toContain(webhookLogId);
  });

  it('omits Next-Cursor when the page is exactly full', async () => {
    const response = await getCursorPage({ limit: '3' });

    expect(response.status).toBe(200);
    const logs = await response.json<LogResponse[]>();
    expect(
      logs
        .map(({ id }) => id)
        .slice()
        .sort()
    ).toEqual([sameTimeIdA, sameTimeIdB, laterId].slice().sort());
    expect(response.headers.get('next-cursor')).toBeNull();
  });

  it('keeps microsecond ordering within one millisecond', async () => {
    const first = await getCursorPage({
      start_time: String(microsecondCreatedAt),
      end_time: String(microsecondCreatedAt),
      limit: '1',
    });

    expect(first.status).toBe(200);
    const firstLogs = await first.json<LogResponse[]>();
    expect(firstLogs.map(({ id }) => id)).toEqual([microsecondIdA]);

    const nextCursor = first.headers.get('next-cursor');
    expect(nextCursor).toEqual(expect.any(String));

    const second = await getCursorPage({
      start_time: String(microsecondCreatedAt),
      end_time: String(microsecondCreatedAt),
      limit: '1',
      cursor: nextCursor!,
    });

    expect(second.status).toBe(200);
    const secondLogs = await second.json<LogResponse[]>();
    expect(secondLogs.map(({ id }) => id)).toEqual([microsecondIdB]);
    expect(second.headers.get('next-cursor')).toBeNull();
  });

  it('returns an empty cursor page when the window has no rows', async () => {
    const response = await getCursorPage({
      start_time: String(startTime + 120_000),
      end_time: String(startTime + 180_000),
    });

    expect(response.status).toBe(200);
    await expect(response.json<LogResponse[]>()).resolves.toEqual([]);
    expect(response.headers.get('next-cursor')).toBeNull();
  });

  it('rejects a future end_time', async () => {
    const response = await getCursorPage({ end_time: String(Date.now() + 3_600_000) });

    expect(response.status).toBe(400);
  });

  it('rejects page-mode parameters in cursor mode', async () => {
    const response = await getCursorPage({ page: '1' });

    expect(response.status).toBe(400);
  });

  it('rejects a limit above the cursor cap', async () => {
    const response = await getCursorPage({ limit: '1001' });

    expect(response.status).toBe(400);
  });
});
