import { createServer, type Server } from 'node:http';

import {
  LicenseUsageMetric,
  licenseUsageGuard,
  type LicenseUsage,
  type LicenseUsageWarning,
} from '@logto/schemas';
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

/** The UTC calendar month `offset` months from now, as `YYYY-MM`. */
const getUtcMonth = (offset = 0) => {
  const now = new Date();
  const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + offset, 1));

  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
};

/** The warnings Core is expected to evaluate locally from the usage it returned. */
const expectLocalWarnings = (usage: LicenseUsage) => {
  const value = Math.max(usage.mau.lastMonth, usage.mau.monthToDate);

  return value > usageLimits.mau
    ? [{ metric: LicenseUsageMetric.Mau, limit: usageLimits.mau, value }]
    : [];
};

devFeatureTest.describe('self-hosted license usage', () => {
  beforeAll(async () => {
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
    const { usage } = await getSystemLicense();
    const { mau, monthlyAccessTokens } = licenseUsageGuard.parse(usage);

    expect(months.map(({ month }) => month)).toEqual(
      Array.from({ length: 12 }, (_, index) => getUtcMonth(index - 12))
    );
    // The last month of the statement is the last full month of the usage.
    expect(months.at(-1)).toEqual({
      month: getUtcMonth(-1),
      mau: mau.lastMonth,
      monthlyAccessTokens: monthlyAccessTokens.lastMonth,
    });
  });
});
