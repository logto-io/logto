import {
  LicenseEnv,
  LicenseKey,
  LicenseUsageMetric,
  ossDefaultQuota,
  ReservedPlanId,
  type LicenseUsage,
  type LicenseUsageStatement,
} from '@logto/schemas';
import { createMockUtils, pickDefault } from '@logto/shared/esm';
import { type JWK, importJWK } from 'jose';

import { mockProtectedAppConfigProviderConfig } from '#src/__mocks__/index.js';
import { EnvSet } from '#src/env-set/index.js';
import koaErrorHandler from '#src/middleware/koa-error-handler.js';
import koaI18next from '#src/middleware/koa-i18next.js';
import {
  buildLicensePayload,
  createLicenseKeyPair,
  signLicenseKey,
} from '#src/test-utils/license.js';
import { mockIdGenerators } from '#src/test-utils/nanoid.js';

const { jest } = import.meta;
const { mockEsm } = createMockUtils(jest);

await mockIdGenerators();

const keyPair = await createLicenseKeyPair();

/** The public key the mocked build trusts, so a test can install licenses this instance accepts. */
const trustedKey = await importJWK(JSON.parse(keyPair.publicKey) as JWK, 'ES256');
const getLicensePublicKey = jest.fn(async (): Promise<unknown> => trustedKey);
mockEsm('#src/license/public-key.js', () => ({ getLicensePublicKey }));

/**
 * The mocked `systems` table: `findSystemByKey` reads whatever a test installed, and `upsertSystem`
 * records what a `PUT` wrote so the test can decide whether the row holds it.
 */
const findSystemByKey = jest.fn(async (_key: string): Promise<unknown> => null);
const upsertSystem = jest.fn(async (key: string, value: unknown) => ({ key, value }));
mockEsm('#src/queries/system.js', () => ({
  createSystemsQuery: () => ({ findSystemByKey, upsertSystem }),
}));

/**
 * Usage is collected from the shared pool, which unit tests cannot reach. Imported before it is
 * mocked, so the evaluation keeps its real implementation.
 */
const actualUsage = await import('#src/license/usage.js');
const usage = {
  month: '2026-10',
  mau: { lastMonth: 60_000, monthToDate: 1000 },
  monthlyAccessTokens: { lastMonth: 9000, monthToDate: 3000 },
  tenants: 2,
} satisfies LicenseUsage;
const statement = {
  months: [{ month: '2026-09', mau: 60_000, monthlyAccessTokens: 9000 }],
} satisfies LicenseUsageStatement;
const collectLicenseUsage = jest.fn(async (): Promise<LicenseUsage | undefined> => usage);
const getLicenseUsageStatement = jest.fn(async () => statement);
mockEsm('#src/license/usage.js', () => ({
  ...actualUsage,
  collectLicenseUsage,
  getLicenseUsageStatement,
}));

/**
 * Imported after the mocks: `mockEsm` only affects modules imported afterwards, and the tenant
 * builds a `SubscriptionLibrary` whose self-hosted accessor reads the installed license, so it
 * pulls in the public key the reader verifies against.
 */
const { MockTenant } = await import('#src/test-utils/tenant.js');
const { createMockQuotaLibrary } = await import('#src/test-utils/quota.js');

/**
 * Imported after the mocks: `mockEsm` only affects modules imported afterwards, and the reader
 * pulls in the public key it verifies against.
 */
const LicenseReader = await pickDefault(import('#src/license/LicenseReader.js'));

const tenantContext = new MockTenant(undefined, undefined, undefined, {
  quota: createMockQuotaLibrary(),
  protectedApps: {
    getDefaultDomain: jest.fn(async () => mockProtectedAppConfigProviderConfig.domain),
  },
});

// Exercise the released routes and license reader without enabling unrelated dev features.
const { isDevFeaturesEnabled: initialDevFeaturesEnabled } = EnvSet.values;
Reflect.set(EnvSet.values, 'isDevFeaturesEnabled', false);

const { createRequester } = await import('#src/utils/test-utils.js');
const systemRoutes = await pickDefault(import('./system.js'));

const installedAt = '2026-09-14T00:00:00.000Z';
const oneYearInSeconds = 365 * 24 * 60 * 60;

const requesterOptions = {
  middlewares: [koaI18next(), koaErrorHandler()],
  authedRoutes: systemRoutes,
  tenantContext,
};

/** Install a license key into the mocked `systems` row, as an earlier `PUT` would have. */
const installLicense = async (payload = buildLicensePayload()) => {
  const jwt = await signLicenseKey(payload, keyPair.privateKey);
  findSystemByKey.mockResolvedValue({ value: { jwt, installedAt } });
  LicenseReader.shared.invalidate();

  return { payload, jwt };
};

/** Point the mocked `systems` row at what the last `PUT` wrote. */
const useInstalledLicenseFromLastPut = () => {
  const [, installed] = upsertSystem.mock.calls.find(([key]) => key === LicenseKey.License) ?? [];
  findSystemByKey.mockResolvedValue({ value: installed });
};

describe('system route', () => {
  const systemRequest = createRequester(requesterOptions);

  it('GET /systems/application', async () => {
    const response = await systemRequest.get('/systems/application');
    expect(response.status).toEqual(200);
    expect(response.body).toStrictEqual({
      protectedApps: { defaultDomain: mockProtectedAppConfigProviderConfig.domain },
    });
  });
});

describe('system license route', () => {
  const { isCloud } = EnvSet.values;
  const systemRequest = createRequester(requesterOptions);

  afterEach(() => {
    jest.clearAllMocks();
    findSystemByKey.mockReset();
    findSystemByKey.mockResolvedValue(null);
    LicenseReader.shared.invalidate();
  });

  afterAll(() => {
    Reflect.set(EnvSet.values, 'isDevFeaturesEnabled', initialDevFeaturesEnabled);
    Reflect.set(EnvSet.values, 'isCloud', isCloud);
  });

  it('PUT /systems/license should install a license and GET should return it without the key', async () => {
    const payload = buildLicensePayload({
      quota: { hideLogtoBranding: true, samlApplicationsLimit: null },
    });
    const jwt = await signLicenseKey(payload, keyPair.privateKey);

    const installResponse = await systemRequest.put('/systems/license').send({ license: jwt });

    expect(installResponse.status).toEqual(204);

    const [key, installed] = upsertSystem.mock.calls[0] ?? [];

    expect(key).toEqual(LicenseKey.License);
    expect(installed).toMatchObject({ jwt });
    expect(upsertSystem).toHaveBeenCalledWith(
      LicenseKey.LicenseRefreshState,
      expect.objectContaining({ lastRefreshedAt: new Date(payload.iat * 1000).toISOString() })
    );
    expect(upsertSystem).toHaveBeenCalledWith(LicenseKey.LicenseDeploymentId, expect.any(String));

    useInstalledLicenseFromLastPut();

    const response = await systemRequest.get('/systems/license');

    expect(response.status).toEqual(200);
    expect(response.body).toMatchObject({
      plan: ReservedPlanId.SelfHostedPro,
      env: LicenseEnv.Production,
      quota: {
        ...ossDefaultQuota,
        hideLogtoBranding: true,
        samlApplicationsLimit: null,
      },
      expiresAt: new Date(payload.exp * 1000).toISOString(),
    });
    expect(response.body.installedAt).toEqual(expect.any(String));
    expect(JSON.stringify(response.body)).not.toContain(jwt);
  });

  it('GET /systems/license should report that no license is installed', async () => {
    const response = await systemRequest.get('/systems/license');

    expect(response.status).toEqual(404);
    expect(response.body).toMatchObject({ code: 'license.not_installed' });
  });

  it('PUT /systems/license should reject a key it did not issue', async () => {
    const otherKeyPair = await createLicenseKeyPair();
    const jwt = await signLicenseKey(buildLicensePayload(), otherKeyPair.privateKey);

    const response = await systemRequest.put('/systems/license').send({ license: jwt });

    expect(response.status).toEqual(400);
    expect(response.body).toMatchObject({ code: 'license.invalid_key' });
    expect(upsertSystem).not.toHaveBeenCalled();
  });

  it('PUT /systems/license should reject a signed key that is not a license', async () => {
    const jwt = await signLicenseKey({ foo: 'bar' }, keyPair.privateKey);

    const response = await systemRequest.put('/systems/license').send({ license: jwt });

    expect(response.status).toEqual(400);
    expect(response.body).toMatchObject({ code: 'license.invalid_key' });
    expect(upsertSystem).not.toHaveBeenCalled();
  });

  it('PUT /systems/license should not blame the key when the public key cannot be loaded', async () => {
    getLicensePublicKey.mockRejectedValueOnce(new TypeError('Invalid license public key'));
    const jwt = await signLicenseKey(buildLicensePayload(), keyPair.privateKey);

    const response = await systemRequest.put('/systems/license').send({ license: jwt });

    expect(response.status).toEqual(500);
    expect(response.body).not.toMatchObject({ code: 'license.invalid_key' });
    expect(upsertSystem).not.toHaveBeenCalled();
  });

  it('PUT /systems/license should reject an expired key', async () => {
    const issuedAt = Math.floor(Date.now() / 1000);
    const jwt = await signLicenseKey(
      buildLicensePayload({ iat: issuedAt - oneYearInSeconds, exp: issuedAt - 1 }),
      keyPair.privateKey
    );

    const response = await systemRequest.put('/systems/license').send({ license: jwt });

    expect(response.status).toEqual(400);
    expect(response.body).toMatchObject({ code: 'license.expired_key' });
    expect(upsertSystem).not.toHaveBeenCalled();
  });

  it('PUT /systems/license should replace the installed license', async () => {
    const { jwt: installedJwt } = await installLicense();
    const payload = buildLicensePayload({
      plan: ReservedPlanId.SelfHostedEnterprise,
      env: LicenseEnv.NonProduction,
    });
    const jwt = await signLicenseKey(payload, keyPair.privateKey);

    const installResponse = await systemRequest.put('/systems/license').send({ license: jwt });

    useInstalledLicenseFromLastPut();

    const response = await systemRequest.get('/systems/license');

    expect(installResponse.status).toEqual(204);
    expect(response.body).toMatchObject({
      plan: ReservedPlanId.SelfHostedEnterprise,
      env: LicenseEnv.NonProduction,
      expiresAt: new Date(payload.exp * 1000).toISOString(),
    });
    expect(installedJwt).not.toEqual(jwt);
  });

  it('should return 501 on Cloud, so a Cloud tenant cannot install a license', async () => {
    Reflect.set(EnvSet.values, 'isCloud', true);
    const { jwt } = await installLicense();

    const getResponse = await systemRequest.get('/systems/license');
    const putResponse = await systemRequest.put('/systems/license').send({ license: jwt });

    expect(getResponse.status).toEqual(501);
    expect(putResponse.status).toEqual(501);
    expect(upsertSystem).not.toHaveBeenCalled();
  });
});

describe('system license usage', () => {
  const { isLicenseUsageReportingDisabled } = EnvSet.values;

  // The usage fields and the statement route are still in development.
  Reflect.set(EnvSet.values, 'isDevFeaturesEnabled', true);
  const systemRequest = createRequester(requesterOptions);
  Reflect.set(EnvSet.values, 'isDevFeaturesEnabled', false);
  const releasedSystemRequest = createRequester(requesterOptions);

  const productionDeploymentsNotice = {
    metric: LicenseUsageMetric.ProductionDeployments,
    limit: 1,
    value: 2,
  };

  /** Install a key and the notices of its last refresh into the mocked `systems` rows. */
  const installWithNotices = async () => {
    const payload = buildLicensePayload({
      usageLimits: { mau: 50_000, productionDeployments: 1 },
    });
    const jwt = await signLicenseKey(payload, keyPair.privateKey);
    const lastRefreshedAt = new Date().toISOString();

    findSystemByKey.mockImplementation(async (key) => {
      if (key === LicenseKey.License) {
        return { value: { jwt, installedAt } };
      }
      if (key === LicenseKey.LicenseRefreshState) {
        return {
          value: {
            lastRefreshedAt,
            lastAttemptAt: lastRefreshedAt,
            cloudNotices: [productionDeploymentsNotice],
          },
        };
      }
      return null;
    });
    LicenseReader.shared.invalidate();
  };

  beforeEach(() => {
    Reflect.set(EnvSet.values, 'isDevFeaturesEnabled', true);
  });

  afterEach(() => {
    Reflect.set(EnvSet.values, 'isDevFeaturesEnabled', false);
    Reflect.set(EnvSet.values, 'isLicenseUsageReportingDisabled', isLicenseUsageReportingDisabled);
    jest.clearAllMocks();
    findSystemByKey.mockReset();
    findSystemByKey.mockResolvedValue(null);
    LicenseReader.shared.invalidate();
  });

  it('GET /systems/license should return the usage, its limits and the warnings', async () => {
    await installWithNotices();

    const response = await systemRequest.get('/systems/license');

    expect(response.status).toEqual(200);
    expect(response.body).toMatchObject({
      usageLimits: { mau: 50_000, productionDeployments: 1 },
      usage,
      usageWarnings: [
        { metric: LicenseUsageMetric.Mau, limit: 50_000, value: 60_000 },
        productionDeploymentsNotice,
      ],
      usageReportingEnabled: true,
    });
  });

  it('GET /systems/license should still warn when reporting is disabled', async () => {
    await installWithNotices();
    Reflect.set(EnvSet.values, 'isLicenseUsageReportingDisabled', true);

    const response = await systemRequest.get('/systems/license');

    expect(response.body).toMatchObject({
      usageWarnings: [
        { metric: LicenseUsageMetric.Mau, limit: 50_000, value: 60_000 },
        productionDeploymentsNotice,
      ],
      usageReportingEnabled: false,
    });
  });

  it('GET /systems/license should keep the notices when usage cannot be collected', async () => {
    await installWithNotices();
    // eslint-disable-next-line unicorn/no-useless-undefined -- a failed collection answers `undefined`
    collectLicenseUsage.mockResolvedValueOnce(undefined);

    const response = await systemRequest.get('/systems/license');

    expect(response.status).toEqual(200);
    expect(response.body).not.toHaveProperty('usage');
    expect(response.body.usageWarnings).toEqual([productionDeploymentsNotice]);
  });

  it('GET /systems/license should leave the usage out without dev features', async () => {
    await installWithNotices();
    Reflect.set(EnvSet.values, 'isDevFeaturesEnabled', false);

    const response = await releasedSystemRequest.get('/systems/license');

    expect(response.status).toEqual(200);
    for (const field of ['usageLimits', 'usage', 'usageWarnings', 'usageReportingEnabled']) {
      expect(response.body).not.toHaveProperty(field);
    }
  });

  it('GET /systems/license/usage-statement should return the statement', async () => {
    await installWithNotices();

    const response = await systemRequest.get('/systems/license/usage-statement');

    expect(response.status).toEqual(200);
    expect(response.body).toEqual(statement);
  });

  it('GET /systems/license/usage-statement should require an installed license', async () => {
    const response = await systemRequest.get('/systems/license/usage-statement');

    expect(response.status).toEqual(404);
    expect(response.body).toMatchObject({ code: 'license.not_installed' });
    expect(getLicenseUsageStatement).not.toHaveBeenCalled();
  });

  it('GET /systems/license/usage-statement should not exist without dev features', async () => {
    await installWithNotices();
    Reflect.set(EnvSet.values, 'isDevFeaturesEnabled', false);

    const response = await releasedSystemRequest.get('/systems/license/usage-statement');

    expect(response.status).toEqual(404);
    expect(getLicenseUsageStatement).not.toHaveBeenCalled();
  });
});
