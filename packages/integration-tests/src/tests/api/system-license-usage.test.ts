import { createServer, type Server } from 'node:http';

import {
  LicenseUsageMetric,
  adminTenantId,
  defaultTenantId,
  licenseUsageGuard,
  type LicenseUsage,
  type LicenseUsageWarning,
} from '@logto/schemas';
import { assertEnv } from '@silverhand/essentials';
import { createInterceptorsPreset, createPool, sql, type DatabasePool } from '@silverhand/slonik';
import { z } from 'zod';

import {
  getSystemLicense,
  getSystemLicenseUsageStatement,
  putSystemLicense,
} from '#src/api/system.js';
import { buildTestLicensePayload, signTestLicenseKey } from '#src/helpers/license.js';
import { devFeatureTest, waitFor } from '#src/utils.js';

/**
 * Core refreshes against `CLOUD_ENDPOINT` in integration tests, which defaults to this port. The
 * Docker Compose setup points it at the host, where this server listens.
 */
const licenseServicePort = 3003;

const refreshRequestGuard = z.object({
  license: z.string(),
  deploymentId: z.string(),
  logtoVersion: z.string(),
  usage: z.unknown().optional(),
});

const productionDeploymentsNotice: LicenseUsageWarning = {
  metric: LicenseUsageMetric.ProductionDeployments,
  limit: 1,
  value: 2,
};

const licenseId = 'integration-test-usage-license';
const usageLimits = { mau: 0, productionDeployments: 1 };

const refreshes: Array<z.infer<typeof refreshRequestGuard>> = [];

/**
 * A stand-in for the Logto Cloud license service: it records every refresh and answers with a
 * newly signed key and a production deployment notice, as Cloud does for a license with too many
 * production deployments.
 */
const licenseService: Server = createServer((request, response) => {
  const chunks: Uint8Array[] = [];

  request.on('data', (chunk: Uint8Array) => {
    // eslint-disable-next-line @silverhand/fp/no-mutating-methods -- collects the request body
    chunks.push(chunk);
  });

  request.on('end', async () => {
    if (request.url !== `/api/self-hosted-licenses/${licenseId}/refresh`) {
      response.writeHead(404).end();
      return;
    }

    // eslint-disable-next-line @silverhand/fp/no-mutating-methods -- records the refresh
    refreshes.push(refreshRequestGuard.parse(JSON.parse(Buffer.concat(chunks).toString())));

    const license = await signTestLicenseKey(buildTestLicensePayload({ licenseId, usageLimits }));
    response
      .writeHead(200, { 'Content-Type': 'application/json' })
      .end(JSON.stringify({ license, notices: [productionDeploymentsNotice] }));
  });
});

const waitUntil = async (condition: () => Promise<boolean> | boolean, attempts = 50) => {
  for (const _ of Array.from({ length: attempts })) {
    // eslint-disable-next-line no-await-in-loop -- polls until the background refresh lands
    if (await condition()) {
      return;
    }

    // eslint-disable-next-line no-await-in-loop -- polls until the background refresh lands
    await waitFor(200);
  }

  throw new Error('Timed out waiting for the license refresh.');
};

/** The first instant of the UTC calendar month `offset` months from now. */
const getUtcMonthStart = (offset = 0) => {
  const now = new Date();

  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + offset, 1));
};

/** The UTC calendar month `offset` months from now, as `YYYY-MM`. */
const getUtcMonth = (offset = 0) => getUtcMonthStart(offset).toISOString().slice(0, 7);

/** A second before `date`. */
const justBefore = (date: Date) => new Date(date.getTime() - 1000);

/**
 * Backdated usage for the usage statement. A fresh database has usage in the current month only,
 * so every full month of the statement only counts these rows.
 */
const seededActiveUsers = [
  // The first instant of the statement, and a second before it.
  { userId: 'statement-first', date: getUtcMonthStart(-12) },
  { userId: 'statement-before', date: justBefore(getUtcMonthStart(-12)) },
  // Both sides of the boundary between the last two full months.
  { userId: 'statement-boundary-a', date: justBefore(getUtcMonthStart(-1)) },
  { userId: 'statement-boundary-b', date: getUtcMonthStart(-1) },
  // The same user twice in a month counts once.
  { userId: 'statement-boundary-b', date: new Date(getUtcMonthStart(-1).getTime() + 86_400_000) },
  // The admin tenant is excluded.
  { userId: 'statement-admin', date: getUtcMonthStart(-1), tenantId: adminTenantId },
];
const seededTokenUsage = [
  { usage: 3, date: getUtcMonthStart(-12) },
  { usage: 5, date: justBefore(getUtcMonthStart(-12)) },
  { usage: 7, date: justBefore(getUtcMonthStart(-1)) },
  { usage: 11, date: getUtcMonthStart(-1) },
  { usage: 1000, date: getUtcMonthStart(-1), tenantId: adminTenantId },
];
const seededIdPrefix = 'usage-statement-';
const toTimestamp = (date: Date) => sql`to_timestamp(${date.getTime()}::double precision / 1000)`;

/** The warnings Core is expected to evaluate locally from the usage it returned. */
const expectLocalWarnings = (usage: LicenseUsage) => {
  const value = Math.max(usage.mau.lastMonth, usage.mau.monthToDate);

  return value > usageLimits.mau
    ? [{ metric: LicenseUsageMetric.Mau, limit: usageLimits.mau, value }]
    : [];
};

devFeatureTest.describe('self-hosted license usage', () => {
  /* eslint-disable @silverhand/fp/no-let */
  let pool: DatabasePool;
  /* eslint-enable @silverhand/fp/no-let */

  beforeAll(async () => {
    /* eslint-disable @silverhand/fp/no-mutation */
    pool = await createPool(assertEnv('DB_URL'), {
      interceptors: createInterceptorsPreset(),
    });
    /* eslint-enable @silverhand/fp/no-mutation */

    await Promise.all([
      ...seededActiveUsers.map(async ({ userId, date, tenantId = defaultTenantId }, index) =>
        pool.query(sql`
          insert into daily_active_users (id, tenant_id, user_id, date)
          values (${`${seededIdPrefix}${index}`}, ${tenantId}, ${userId}, ${toTimestamp(date)})
        `)
      ),
      ...seededTokenUsage.map(async ({ usage, date, tenantId = defaultTenantId }, index) =>
        pool.query(sql`
          insert into daily_token_usage (id, tenant_id, usage, date)
          values (${`${seededIdPrefix}${index}`}, ${tenantId}, ${usage}, ${toTimestamp(date)})
        `)
      ),
    ]);

    await new Promise<void>((resolve) => {
      licenseService.listen(licenseServicePort, resolve);
    });

    const license = await signTestLicenseKey(buildTestLicensePayload({ licenseId, usageLimits }));
    const response = await putSystemLicense(license);
    expect(response.status).toEqual(204);
  });

  afterAll(async () => {
    await new Promise((resolve) => {
      licenseService.close(resolve);
    });

    const seededIds = sql.join(
      [...seededActiveUsers, ...seededTokenUsage].map((_, index) => `${seededIdPrefix}${index}`),
      sql`, `
    );
    await pool.query(sql`delete from daily_active_users where id in (${seededIds})`);
    await pool.query(sql`delete from daily_token_usage where id in (${seededIds})`);
    await pool.end();
  });

  it('should report usage on refresh and show the returned notices', async () => {
    // The first read of a newly installed key starts its refresh in the background.
    const installed = await getSystemLicense();

    expect(installed).toMatchObject({ usageLimits, usageReportingEnabled: true });
    expect(installed.usageWarnings).not.toContainEqual(productionDeploymentsNotice);

    await waitUntil(() => refreshes.length > 0);

    const [refresh] = refreshes;
    const reportedUsage = licenseUsageGuard.parse(refresh?.usage);

    expect(reportedUsage.month).toEqual(getUtcMonth());

    await waitUntil(async () => {
      const { usageWarnings } = await getSystemLicense();
      return Boolean(usageWarnings?.some(({ metric }) => metric === 'productionDeployments'));
    });

    const { usage, usageWarnings } = await getSystemLicense();
    const parsedUsage = licenseUsageGuard.parse(usage);

    // Local warnings come first, and Cloud only adds the metrics it alone can count.
    expect(usageWarnings).toEqual([
      ...expectLocalWarnings(parsedUsage),
      productionDeploymentsNotice,
    ]);
  });

  it('should return the usage statement of the last 12 full months', async () => {
    const { months } = await getSystemLicenseUsageStatement();
    const seededMonths = new Map([
      [getUtcMonth(-12), { mau: 1, monthlyAccessTokens: 3 }],
      [getUtcMonth(-2), { mau: 1, monthlyAccessTokens: 7 }],
      [getUtcMonth(-1), { mau: 1, monthlyAccessTokens: 11 }],
    ]);

    expect(months).toEqual(
      Array.from({ length: 12 }, (_, index) => {
        const month = getUtcMonth(index - 12);

        return { month, ...(seededMonths.get(month) ?? { mau: 0, monthlyAccessTokens: 0 }) };
      })
    );
  });
});
