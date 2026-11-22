import { defaultTenantId, hook, interaction, LogResult, type LogResponse } from '@logto/schemas';
import { generateStandardId } from '@logto/shared';
import { assertEnv, type Nullable } from '@silverhand/essentials';
import { createInterceptorsPreset, createPool, sql, type DatabasePool } from '@silverhand/slonik';

import { authedAdminApi } from '#src/api/api.js';

type LogPage = {
  items: LogResponse[];
  nextCursor: Nullable<string>;
};

// Integration coverage for `GET /api/logs/export`.
//
// Like `cleanup.test.ts`, the rows are seeded directly with SQL: the boundary and payload
// fixtures need timestamps far in the past and exact millisecond values, which the Management API
// cannot create. The window is far enough back and disjoint from other suites that the export can
// be scoped by time alone, without content filters.
describe('GET /logs/export', () => {
  const startTime = 1_600_000_200_000;
  const endTime = startTime + 60_000;

  const logKey = `${interaction.prefix}.Export.${generateStandardId()}`;
  const sameTimeIdA = generateStandardId();
  const sameTimeIdB = generateStandardId();
  const laterId = generateStandardId();
  const firstCreatedAt = startTime + 1000;
  const secondCreatedAt = startTime + 2000;

  const firstPayloadA = {
    key: logKey,
    result: LogResult.Success,
    userId: 'export-user',
    applicationId: 'export-app',
    note: 'comma, quote " and newline\n',
  };
  const firstPayloadB = {
    key: logKey,
    result: LogResult.Success,
    userId: 'export-user',
    applicationId: 'export-app',
  };
  const laterPayload = {
    key: logKey,
    result: LogResult.Success,
    userId: 'export-user',
    applicationId: 'export-app',
  };

  // Webhook delivery logs share the table and are included unless the caller opts out with
  // `excludeWebhookLogs=true`.
  const webhookLogKey = `${hook.Type.TriggerHook}.Export.${generateStandardId()}`;
  const webhookLogId = generateStandardId();
  const webhookPayload = {
    key: webhookLogKey,
    result: LogResult.Success,
    hookId: 'export-probe',
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
        )
    `);

    await pool.query(sql`
      insert into logs (tenant_id, id, key, payload, created_at)
      values (
        ${defaultTenantId},
        ${webhookLogId},
        ${webhookLogKey},
        ${sql.jsonb(webhookPayload)},
        to_timestamp(${firstCreatedAt}::double precision / 1000)
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

  const exportLogs = async (extra?: Record<string, string>) => {
    const searchParams = new URLSearchParams({
      start_time: String(startTime),
      end_time: String(endTime),
      ...extra,
    });

    return authedAdminApi.get('logs/export', {
      searchParams,
      throwHttpErrors: false,
    });
  };

  const readAllAuditIds = async (cursor?: string): Promise<string[]> => {
    const response = await exportLogs({
      excludeWebhookLogs: 'true',
      limit: '1',
      ...(cursor ? { cursor } : {}),
    });
    expect(response.status).toBe(200);

    const page = await response.json<LogPage>();
    const ids = page.items.map(({ id }) => id);

    return [...ids, ...(page.nextCursor ? await readAllAuditIds(page.nextCursor) : [])];
  };

  it('paginates rows that share a timestamp without dropping or duplicating them', async () => {
    const ids = await readAllAuditIds();

    expect(ids.slice().sort()).toEqual([sameTimeIdA, sameTimeIdB, laterId].slice().sort());
    expect(new Set(ids).size).toBe(3);
  });

  it('returns nextCursor null when the page is exactly full', async () => {
    const response = await exportLogs({
      excludeWebhookLogs: 'true',
      limit: '3',
    });

    expect(response.status).toBe(200);
    const page = await response.json<LogPage>();
    expect(
      page.items
        .map(({ id }) => id)
        .slice()
        .sort()
    ).toEqual([sameTimeIdA, sameTimeIdB, laterId].slice().sort());
    expect(page.nextCursor).toBeNull();
  });

  it('includes webhook delivery logs by default', async () => {
    const response = await exportLogs({ limit: '10' });

    expect(response.status).toBe(200);
    const page = await response.json<LogPage>();
    expect(
      page.items
        .map(({ id }) => id)
        .slice()
        .sort()
    ).toEqual([sameTimeIdA, sameTimeIdB, laterId, webhookLogId].slice().sort());
    expect(page.nextCursor).toBeNull();
  });

  it('excludes webhook delivery logs when excludeWebhookLogs=true', async () => {
    const response = await exportLogs({ excludeWebhookLogs: 'true', limit: '10' });

    expect(response.status).toBe(200);
    const page = await response.json<LogPage>();
    expect(
      page.items
        .map(({ id }) => id)
        .slice()
        .sort()
    ).toEqual([sameTimeIdA, sameTimeIdB, laterId].slice().sort());
    expect(page.nextCursor).toBeNull();
  });

  it('returns an empty page with nextCursor null when the window has no rows', async () => {
    const response = await exportLogs({
      start_time: String(startTime + 120_000),
      end_time: String(startTime + 180_000),
    });

    expect(response.status).toBe(200);
    await expect(response.json<LogPage>()).resolves.toEqual({
      items: [],
      nextCursor: null,
    });
  });
});
