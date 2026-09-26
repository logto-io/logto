import { LicenseKey, licenseRefreshStateGuard, ossDefaultQuota } from '@logto/schemas';
import { createMockUtils, pickDefault } from '@logto/shared/esm';
import { noop } from '@silverhand/essentials';
import { createMockPool } from '@silverhand/slonik';
import { type CryptoKey, type JWK, importJWK } from 'jose';
import nock from 'nock';

import { EnvSet } from '#src/env-set/index.js';
import {
  buildLicensePayload,
  createLicenseKeyPair,
  signLicenseKey,
} from '#src/test-utils/license.js';

import { licenseConsoleLog } from './console.js';

const { jest } = import.meta;
const { mockEsm } = createMockUtils(jest);

const pool = createMockPool({ query: jest.fn() });

// `maybeOne` resolves to `null` when the row is absent.
const findSystemByKey = jest.fn(async (_key: string): Promise<unknown> => null);
const upsertSystem = jest.fn(async (key: string, value: unknown) => ({ key, value }));
mockEsm('#src/queries/system.js', () => ({
  createSystemsQuery: () => ({
    findSystemByKey,
    findSystemByKeyForUpdate: findSystemByKey,
    upsertSystem,
  }),
}));

const error = jest.spyOn(licenseConsoleLog, 'error').mockImplementation(noop);

const keyPair = await createLicenseKeyPair();

/** The public key the mocked build trusts, so a test can sign licenses this instance accepts. */
const trustedKey = await importJWK(JSON.parse(keyPair.publicKey) as JWK, 'EdDSA');
const getLicensePublicKey: () => Promise<CryptoKey | Uint8Array> = async () => trustedKey;
mockEsm('./public-key.js', () => ({ getLicensePublicKey }));

const LicenseReader = await pickDefault(import('./LicenseReader.js'));

const installedAt = '2026-09-14T00:00:00.000Z';

const waitFor = async (condition: () => boolean, attempts = 100): Promise<void> => {
  if (condition()) {
    return;
  }

  if (attempts === 0) {
    throw new Error('Timed out waiting for the license refresh.');
  }

  await new Promise((resolve) => {
    setTimeout(resolve, 5);
  });
  return waitFor(condition, attempts - 1);
};

/** Put a license key into the `systems` table, as `PUT /api/systems/license` does. */
const install = (jwt: string) => {
  findSystemByKey.mockImplementation(async (key) =>
    key === LicenseKey.License ? { value: { jwt, installedAt } } : null
  );
};

describe('LicenseReader', () => {
  const reader = new LicenseReader();
  const { isDevFeaturesEnabled } = EnvSet.values;

  afterEach(() => {
    Reflect.set(EnvSet.values, 'isDevFeaturesEnabled', isDevFeaturesEnabled);
    jest.clearAllMocks();
    nock.cleanAll();
    findSystemByKey.mockReset();
    findSystemByKey.mockResolvedValue(null);
    upsertSystem.mockReset();
    reader.invalidate();
  });

  it('should share one reader across the process', () => {
    expect(LicenseReader.shared).toBeInstanceOf(LicenseReader);
  });

  it('should read no license when none is installed', async () => {
    await expect(reader.read(pool)).resolves.toBeUndefined();
  });

  it('should read an installed license and fill the self-hosted defaults in', async () => {
    const payload = buildLicensePayload({
      quota: { hideLogtoBranding: true, samlApplicationsLimit: null },
    });
    install(await signLicenseKey(payload, keyPair.privateKey));

    await expect(reader.read(pool)).resolves.toEqual({
      payload,
      installedAt,
      quota: {
        ...ossDefaultQuota,
        hideLogtoBranding: true,
        samlApplicationsLimit: null,
      },
      lastRefreshedAt: new Date(payload.iat * 1000).toISOString(),
      graceEndsAt: new Date(payload.iat * 1000 + 30 * 24 * 60 * 60 * 1000).toISOString(),
    });
  });

  it('should ignore a stored value that is not an installed license', async () => {
    findSystemByKey.mockResolvedValue({ value: { jwt: 42 } });

    await expect(reader.read(pool)).resolves.toBeUndefined();
    expect(error).toHaveBeenCalledTimes(1);
  });

  it('should ignore a license key that does not verify, rather than fail the request', async () => {
    install('not-a-license-key');

    await expect(reader.read(pool)).resolves.toBeUndefined();
    expect(error).toHaveBeenCalledTimes(1);
  });

  it('should read the database once until it is invalidated', async () => {
    install(await signLicenseKey(buildLicensePayload(), keyPair.privateKey));

    await Promise.all([reader.read(pool), reader.read(pool)]);
    await reader.read(pool);
    expect(findSystemByKey).toHaveBeenCalledTimes(3);

    reader.invalidate();
    await reader.read(pool);
    expect(findSystemByKey).toHaveBeenCalledTimes(6);
  });

  it('should refresh an installed key asynchronously on the first read', async () => {
    const issuedAt = Math.floor(Date.now() / 1000) - 8 * 24 * 60 * 60;
    const payload = buildLicensePayload({ iat: issuedAt, exp: issuedAt - 1 });
    const refreshedPayload = buildLicensePayload();
    const jwt = await signLicenseKey(payload, keyPair.privateKey);
    const refreshedJwt = await signLicenseKey(refreshedPayload, keyPair.privateKey);
    const refreshState = {
      lastRefreshedAt: new Date(issuedAt * 1000).toISOString(),
      lastAttemptAt: new Date(issuedAt * 1000).toISOString(),
    };

    findSystemByKey.mockImplementation(async (key) => {
      if (key === LicenseKey.License) {
        return { value: { jwt, installedAt } };
      }
      if (key === LicenseKey.LicenseRefreshState) {
        return { value: refreshState };
      }
      if (key === LicenseKey.LicenseDeploymentId) {
        return { value: 'deployment_1' };
      }
      return null;
    });

    const { endpoint } = EnvSet.values.cloudUrlSet;
    const request = nock(endpoint.origin)
      .post(
        `/api/self-hosted-licenses/${payload.licenseId}/refresh`,
        (body: { license: string; deploymentId: string; logtoVersion: string }) =>
          body.license === jwt &&
          body.deploymentId === 'deployment_1' &&
          body.logtoVersion.length > 0
      )
      .reply(200, { license: refreshedJwt });

    const [firstResult, secondResult] = await Promise.all([reader.read(pool), reader.read(pool)]);

    expect(firstResult?.payload).toEqual(payload);
    expect(secondResult?.payload).toEqual(payload);

    await waitFor(() => request.isDone());
    await waitFor(() => upsertSystem.mock.calls.some(([key]) => key === LicenseKey.License));

    expect(request.isDone()).toBe(true);
    const refreshStateWrite = upsertSystem.mock.calls.find(
      ([key]) => key === LicenseKey.LicenseRefreshState
    );
    expect(refreshStateWrite).toBeDefined();
    const parsedRefreshState = licenseRefreshStateGuard.parse(refreshStateWrite?.[1]);
    expect(typeof parsedRefreshState.lastAttemptAt).toBe('string');
    expect(upsertSystem).toHaveBeenCalledWith(LicenseKey.License, {
      jwt: refreshedJwt,
      installedAt,
    });
  });

  it('should keep the last successful refresh when the service refuses a refresh', async () => {
    const issuedAt = Math.floor(Date.now() / 1000) - 8 * 24 * 60 * 60;
    const payload = buildLicensePayload({ iat: issuedAt, exp: issuedAt - 1 });
    const jwt = await signLicenseKey(payload, keyPair.privateKey);
    const lastRefreshedAt = new Date(issuedAt * 1000).toISOString();

    findSystemByKey.mockImplementation(async (key) => {
      if (key === LicenseKey.License) {
        return { value: { jwt, installedAt } };
      }
      if (key === LicenseKey.LicenseRefreshState) {
        return { value: { lastRefreshedAt, lastAttemptAt: lastRefreshedAt } };
      }
      if (key === LicenseKey.LicenseDeploymentId) {
        return { value: 'deployment_1' };
      }
      return null;
    });

    const request = nock(EnvSet.values.cloudUrlSet.endpoint.origin)
      .post(`/api/self-hosted-licenses/${payload.licenseId}/refresh`)
      .reply(403, { reason: 'canceled' });

    await reader.read(pool);
    await waitFor(() => request.isDone());
    await waitFor(() =>
      upsertSystem.mock.calls.some(
        ([key, value]) =>
          key === LicenseKey.LicenseRefreshState &&
          typeof value === 'object' &&
          value !== null &&
          'refusalReason' in value
      )
    );

    expect(request.isDone()).toBe(true);
    const refreshStateWrite = upsertSystem.mock.calls.find(
      ([key, value]) =>
        key === LicenseKey.LicenseRefreshState &&
        typeof value === 'object' &&
        value !== null &&
        'refusalReason' in value
    );
    expect(refreshStateWrite).toBeDefined();
    const parsedRefreshState = licenseRefreshStateGuard.parse(refreshStateWrite?.[1]);
    expect(parsedRefreshState).toMatchObject({ lastRefreshedAt, refusalReason: 'canceled' });
    expect(typeof parsedRefreshState.lastAttemptAt).toBe('string');
    expect(upsertSystem).not.toHaveBeenCalledWith(LicenseKey.License, expect.anything());
  });

  it('should drop a refresh response once the installed key has been replaced', async () => {
    const issuedAt = Math.floor(Date.now() / 1000) - 8 * 24 * 60 * 60;
    const payload = buildLicensePayload({ iat: issuedAt });
    const jwt = await signLicenseKey(payload, keyPair.privateKey);
    const replacementJwt = await signLicenseKey(buildLicensePayload(), keyPair.privateKey);
    const refreshedJwt = await signLicenseKey(buildLicensePayload(), keyPair.privateKey);
    const lastRefreshedAt = new Date(issuedAt * 1000).toISOString();
    const installed = { jwt };

    findSystemByKey.mockImplementation(async (key) => {
      if (key === LicenseKey.License) {
        return { value: { jwt: installed.jwt, installedAt } };
      }
      if (key === LicenseKey.LicenseRefreshState) {
        return { value: { lastRefreshedAt, lastAttemptAt: lastRefreshedAt } };
      }
      if (key === LicenseKey.LicenseDeploymentId) {
        return { value: 'deployment_1' };
      }
      return null;
    });

    const request = nock(EnvSet.values.cloudUrlSet.endpoint.origin)
      .post(`/api/self-hosted-licenses/${payload.licenseId}/refresh`)
      .reply(() => {
        // An admin installs another key while the refresh is in flight.
        // eslint-disable-next-line @silverhand/fp/no-mutation -- simulates a concurrent install
        installed.jwt = replacementJwt;
        return [200, { license: refreshedJwt }];
      });

    await reader.read(pool);
    await waitFor(() => request.isDone());
    // Let the refresh settle after the response.
    await new Promise((resolve) => {
      setTimeout(resolve, 50);
    });

    expect(upsertSystem).toHaveBeenCalledTimes(1);
    expect(upsertSystem).not.toHaveBeenCalledWith(LicenseKey.License, expect.anything());
  });

  it('should not cache a failed database read', async () => {
    findSystemByKey.mockRejectedValueOnce(new Error('Connection terminated'));

    await expect(reader.read(pool)).rejects.toThrow('Connection terminated');
    await expect(reader.read(pool)).resolves.toBeUndefined();
    expect(findSystemByKey).toHaveBeenCalledTimes(6);
  });

  it('should grant nothing while the self-hosted plans feature is not launched', async () => {
    install(await signLicenseKey(buildLicensePayload(), keyPair.privateKey));
    Reflect.set(EnvSet.values, 'isDevFeaturesEnabled', false);

    await expect(reader.read(pool)).resolves.toBeUndefined();
    expect(findSystemByKey).not.toHaveBeenCalled();
  });
});

describe('LicenseReader cache expiry', () => {
  const reader = new LicenseReader();
  const startedAt = Date.now();

  /**
   * The cache only reads the clock, so moving `Date.now` is enough — and it leaves the timers
   * alone, which the asynchronous signing and verification below run on.
   */
  const now = jest.spyOn(Date, 'now');

  beforeEach(() => {
    now.mockReturnValue(startedAt);
  });

  afterEach(() => {
    jest.clearAllMocks();
    findSystemByKey.mockReset();
    findSystemByKey.mockResolvedValue(null);
    reader.invalidate();
  });

  // `mockReset()` would leave `Date.now` answering `undefined`; hand the real clock back instead.
  afterAll(() => {
    now.mockRestore();
  });

  it('should expire the cache, so an instance that handled no write still sees a change', async () => {
    install(await signLicenseKey(buildLicensePayload(), keyPair.privateKey));

    await expect(reader.read(pool)).resolves.toBeDefined();
    expect(findSystemByKey).toHaveBeenCalledTimes(3);

    now.mockReturnValue(startedAt + 30_000);
    await expect(reader.read(pool)).resolves.toBeDefined();
    expect(findSystemByKey).toHaveBeenCalledTimes(3);

    // Another instance removed the license; `invalidate()` there never reached this process.
    now.mockReturnValue(startedAt + 60_001);
    findSystemByKey.mockResolvedValue(null);

    await expect(reader.read(pool)).resolves.toBeUndefined();
    expect(findSystemByKey).toHaveBeenCalledTimes(6);
  });
});
