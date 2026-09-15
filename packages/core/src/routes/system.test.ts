import { LicenseEnv, LicenseKey, ossDefaultQuota, ReservedPlanId } from '@logto/schemas';
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
import { createMockQuotaLibrary } from '#src/test-utils/quota.js';
import { MockTenant } from '#src/test-utils/tenant.js';

const { jest } = import.meta;
const { mockEsm } = createMockUtils(jest);

await mockIdGenerators();

const keyPair = await createLicenseKeyPair();

/** The public key the mocked build trusts, so a test can install licenses this instance accepts. */
const trustedKey = await importJWK(JSON.parse(keyPair.publicKey) as JWK, 'EdDSA');
const getLicensePublicKey = async () => trustedKey;
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

/**
 * The license routes are only registered while the self-hosted plans feature is on, and the flag is
 * read when the routes are registered, i.e. when `createRequester` below runs.
 */
const { isDevFeaturesEnabled: initialDevFeaturesEnabled } = EnvSet.values;
Reflect.set(EnvSet.values, 'isDevFeaturesEnabled', true);

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
  const [, installed] = upsertSystem.mock.calls.at(-1) ?? [];
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

  it('should not register the license routes while the self-hosted plans feature is off', async () => {
    Reflect.set(EnvSet.values, 'isDevFeaturesEnabled', false);
    const requestWithoutDevFeatures = createRequester(requesterOptions);

    const getResponse = await requestWithoutDevFeatures.get('/systems/license');
    const putResponse = await requestWithoutDevFeatures
      .put('/systems/license')
      .send({ license: 'foo' });

    expect(getResponse.status).toEqual(404);
    expect(putResponse.status).toEqual(404);

    Reflect.set(EnvSet.values, 'isDevFeaturesEnabled', true);
  });
});
