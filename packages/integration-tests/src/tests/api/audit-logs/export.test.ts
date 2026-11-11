import { defaultTenantId, hook, interaction, LogResult } from '@logto/schemas';
import { generateStandardId } from '@logto/shared';
import { assertEnv } from '@silverhand/essentials';
import { createInterceptorsPreset, createPool, sql, type DatabasePool } from '@silverhand/slonik';

import { authedAdminApi } from '#src/api/api.js';
import { devFeatureTest } from '#src/utils.js';

type CsvRow = {
  tenantId: string;
  id: string;
  key: string;
  createdAt: number;
  payload: Record<string, unknown>;
};

const parseCsvRow = (line: string): CsvRow | undefined => {
  const match = /^([^,]+),([^,]+),([^,]+),(\d+),"(.*)"$/.exec(line);

  if (!match) {
    return undefined;
  }

  const [, tenantId, id, key, createdAt, payload] = match;

  if (!tenantId || !id || !key || !createdAt) {
    return undefined;
  }

  return {
    tenantId,
    id,
    key,
    createdAt: Number(createdAt),
    payload: JSON.parse(payload?.replaceAll('""', '"') ?? '{}') as Record<string, unknown>,
  };
};

// Integration coverage for `GET /api/logs/export`.
//
// Like `cleanup.test.ts`, the rows are seeded directly with SQL: the boundary and payload
// fixtures need timestamps far in the past and exact millisecond values, which the Management API
// cannot create. The window is far enough back that other suites do not write into it.
devFeatureTest.describe('GET /logs/export', () => {
  const startTime = 1_600_000_000_000;
  const endTime = startTime + 60_000;

  const logKey = `${interaction.prefix}.Export.${generateStandardId()}`;
  const firstId = generateStandardId();
  const secondId = generateStandardId();
  const firstCreatedAt = startTime + 1000;
  const secondCreatedAt = startTime + 2000;
  const firstPayload = {
    key: logKey,
    result: LogResult.Success,
    userId: 'export-user',
    applicationId: 'export-app',
    note: 'comma, quote " and newline\n',
  };
  const secondPayload = {
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
          ${firstId},
          ${logKey},
          ${sql.jsonb(firstPayload)},
          to_timestamp(${firstCreatedAt}::double precision / 1000)
        ),
        (
          ${defaultTenantId},
          ${secondId},
          ${logKey},
          ${sql.jsonb(secondPayload)},
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

  const exportLogs = async (format: 'csv' | 'jsonl', extra?: Record<string, string>) => {
    const searchParams = new URLSearchParams({
      format,
      start_time: String(startTime),
      end_time: String(endTime),
      ...extra,
    });

    return authedAdminApi.get('logs/export', { searchParams });
  };

  it('exports audit logs as CSV and escapes payloads', async () => {
    const response = await exportLogs('csv', { logKey });

    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toContain('text/csv');
    expect(response.headers.get('content-disposition')).toMatch(
      /^attachment; filename="logs-.+\.csv"$/
    );
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(response.headers.get('x-log-range-oldest')).toBe(String(firstCreatedAt));
    expect(response.headers.get('x-log-range-newest')).toBe(String(secondCreatedAt));

    const text = await response.text();
    const lines = text.trimEnd().split('\n');
    expect(lines[0]).toBe('tenantId,id,key,createdAt,payload');

    const rows = lines.slice(1).map((line) => parseCsvRow(line));
    expect(rows).toEqual([
      {
        tenantId: defaultTenantId,
        id: firstId,
        key: logKey,
        createdAt: firstCreatedAt,
        payload: firstPayload,
      },
      {
        tenantId: defaultTenantId,
        id: secondId,
        key: logKey,
        createdAt: secondCreatedAt,
        payload: secondPayload,
      },
    ]);
  });

  it('exports audit logs as JSONL in ascending createdAt order', async () => {
    const response = await exportLogs('jsonl', { logKey });

    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toContain('application/x-ndjson');
    expect(response.headers.get('content-disposition')).toMatch(
      /^attachment; filename="logs-.+\.jsonl"$/
    );
    expect(response.headers.get('x-log-range-oldest')).toBe(String(firstCreatedAt));
    expect(response.headers.get('x-log-range-newest')).toBe(String(secondCreatedAt));

    const text = await response.text();
    const rows = text
      .trimEnd()
      .split('\n')
      .map((line) => JSON.parse(line) as Record<string, unknown>);

    expect(rows).toEqual([
      {
        tenantId: defaultTenantId,
        id: firstId,
        key: logKey,
        createdAt: firstCreatedAt,
        payload: firstPayload,
      },
      {
        tenantId: defaultTenantId,
        id: secondId,
        key: logKey,
        createdAt: secondCreatedAt,
        payload: secondPayload,
      },
    ]);
  });

  it('includes webhook delivery logs by default', async () => {
    const response = await exportLogs('jsonl', { logKey: webhookLogKey });

    expect(response.status).toBe(200);
    expect(response.headers.get('x-log-range-oldest')).toBe(String(firstCreatedAt));
    expect(response.headers.get('x-log-range-newest')).toBe(String(firstCreatedAt));

    const text = await response.text();
    const rows = text
      .trimEnd()
      .split('\n')
      .map((line) => JSON.parse(line) as Record<string, unknown>);
    expect(rows).toEqual([
      {
        tenantId: defaultTenantId,
        id: webhookLogId,
        key: webhookLogKey,
        createdAt: firstCreatedAt,
        payload: webhookPayload,
      },
    ]);
  });

  it('excludes webhook delivery logs when excludeWebhookLogs=true', async () => {
    const response = await exportLogs('jsonl', {
      logKey: webhookLogKey,
      excludeWebhookLogs: 'true',
    });

    expect(response.status).toBe(200);
    expect(response.headers.get('x-log-range-oldest')).toBeNull();
    expect(response.headers.get('x-log-range-newest')).toBeNull();
    await expect(response.text()).resolves.toBe('');
  });

  it('applies the userId filter', async () => {
    const response = await exportLogs('jsonl', { logKey, userId: 'someone-else' });

    expect(response.status).toBe(200);
    await expect(response.text()).resolves.toBe('');
  });
});
