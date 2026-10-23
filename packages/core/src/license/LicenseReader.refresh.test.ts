import { LicenseKey, LicenseUsageMetric, licenseRefreshStateGuard } from '@logto/schemas';
import { noop } from '@silverhand/essentials';
import nock from 'nock';

import { EnvSet } from '#src/env-set/index.js';
import { buildLicensePayload, signLicenseKey } from '#src/test-utils/license.js';

import {
  collectLicenseUsage,
  findRefusal,
  findSystemByKey,
  installedAt,
  keyPair,
  licenseRefreshTimeout,
  pool,
  selfHostedLicenseServiceUrl,
  setUpReader,
  upsertSystem,
  usage,
  waitFor,
} from './LicenseReader.test-utils.js';
import { licenseConsoleLog } from './console.js';

const { jest } = import.meta;

describe('LicenseReader refresh', () => {
  const reader = setUpReader();

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
        (body: { license: string; deploymentId: string; logtoVersion: string; usage?: unknown }) =>
          body.license === jwt &&
          body.deploymentId === 'deployment_1' &&
          body.logtoVersion.length > 0 &&
          JSON.stringify(body.usage) === JSON.stringify(usage)
      )
      .reply(200, {
        license: refreshedJwt,
        notices: [
          { metric: LicenseUsageMetric.ProductionDeployments, limit: 1, value: 2 },
          // A malformed notice is dropped rather than failing the refresh.
          { metric: LicenseUsageMetric.Mau, limit: 'many' },
        ],
      });

    const [firstResult, secondResult] = await Promise.all([reader.read(pool), reader.read(pool)]);

    expect(firstResult?.payload).toEqual(payload);
    expect(secondResult?.payload).toEqual(payload);

    const findRefreshedState = () =>
      upsertSystem.mock.calls.find(
        ([key, value]) =>
          key === LicenseKey.LicenseRefreshState &&
          typeof value === 'object' &&
          value !== null &&
          'cloudNotices' in value
      );

    await waitFor(() => request.isDone());
    await waitFor(() => findRefreshedState() !== undefined);

    expect(request.isDone()).toBe(true);
    const parsedRefreshState = licenseRefreshStateGuard.parse(findRefreshedState()?.[1]);
    expect(typeof parsedRefreshState.lastAttemptAt).toBe('string');
    expect(parsedRefreshState.cloudNotices).toEqual([
      { metric: LicenseUsageMetric.ProductionDeployments, limit: 1, value: 2 },
    ]);
    expect(upsertSystem).toHaveBeenCalledWith(LicenseKey.License, {
      jwt: refreshedJwt,
      installedAt,
    });
  });

  it.each([
    { isIntegrationTest: false, serviceUrl: () => selfHostedLicenseServiceUrl },
    { isIntegrationTest: true, serviceUrl: () => EnvSet.values.cloudUrlSet.endpoint },
  ])(
    'should refresh against the right service in production (integration test: $isIntegrationTest)',
    async ({ isIntegrationTest, serviceUrl }) => {
      const payload = buildLicensePayload();
      const jwt = await signLicenseKey(payload, keyPair.privateKey);

      findSystemByKey.mockImplementation(async (key) => {
        if (key === LicenseKey.License) {
          return { value: { jwt, installedAt } };
        }
        if (key === LicenseKey.LicenseDeploymentId) {
          return { value: 'deployment_1' };
        }
        return null;
      });
      Reflect.set(EnvSet.values, 'isProduction', true);
      Reflect.set(EnvSet.values, 'isIntegrationTest', isIntegrationTest);

      const request = nock(serviceUrl().origin)
        .post(`/api/self-hosted-licenses/${payload.licenseId}/refresh`)
        .reply(403, { reason: 'expired' });

      await reader.read(pool);
      await waitFor(() => request.isDone());
      // Let the refresh record the refusal and release the reader's refresh slot, which the next
      // test's reader would otherwise find taken and skip its refresh.
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
    }
  );

  it('should keep the last successful refresh when the service refuses a refresh', async () => {
    const issuedAt = Math.floor(Date.now() / 1000) - 8 * 24 * 60 * 60;
    const payload = buildLicensePayload({ iat: issuedAt, exp: issuedAt - 1 });
    const jwt = await signLicenseKey(payload, keyPair.privateKey);
    const lastRefreshedAt = new Date(issuedAt * 1000).toISOString();
    const cloudNotices = [{ metric: LicenseUsageMetric.ProductionDeployments, limit: 1, value: 2 }];

    findSystemByKey.mockImplementation(async (key) => {
      if (key === LicenseKey.License) {
        return { value: { jwt, installedAt } };
      }
      if (key === LicenseKey.LicenseRefreshState) {
        return { value: { lastRefreshedAt, lastAttemptAt: lastRefreshedAt, cloudNotices } };
      }
      if (key === LicenseKey.LicenseDeploymentId) {
        return { value: 'deployment_1' };
      }
      return null;
    });

    // A refusal carries no notices, so the ones of the last refresh are kept.
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
    expect(parsedRefreshState).toMatchObject({
      lastRefreshedAt,
      refusalReason: 'canceled',
      cloudNotices,
    });
    expect(typeof parsedRefreshState.lastAttemptAt).toBe('string');
    expect(upsertSystem).not.toHaveBeenCalledWith(LicenseKey.License, expect.anything());
  });

  it('should store the notices a refusal carries', async () => {
    const issuedAt = Math.floor(Date.now() / 1000) - 8 * 24 * 60 * 60;
    const payload = buildLicensePayload({ iat: issuedAt });
    const jwt = await signLicenseKey(payload, keyPair.privateKey);
    const lastRefreshedAt = new Date(issuedAt * 1000).toISOString();
    const notices = [{ metric: LicenseUsageMetric.Mau, limit: 50_000, value: 60_000 }];

    findSystemByKey.mockImplementation(async (key) => {
      if (key === LicenseKey.License) {
        return { value: { jwt, installedAt } };
      }
      if (key === LicenseKey.LicenseRefreshState) {
        return {
          value: {
            lastRefreshedAt,
            lastAttemptAt: lastRefreshedAt,
            cloudNotices: [
              { metric: LicenseUsageMetric.ProductionDeployments, limit: 1, value: 2 },
            ],
          },
        };
      }
      if (key === LicenseKey.LicenseDeploymentId) {
        return { value: 'deployment_1' };
      }
      return null;
    });

    const request = nock(EnvSet.values.cloudUrlSet.endpoint.origin)
      .post(`/api/self-hosted-licenses/${payload.licenseId}/refresh`)
      .reply(403, { reason: 'canceled', notices });

    await reader.read(pool);
    await waitFor(() => request.isDone());
    await waitFor(() => findRefusal() !== undefined);

    expect(licenseRefreshStateGuard.parse(findRefusal()?.[1])).toMatchObject({
      refusalReason: 'canceled',
      cloudNotices: notices,
    });
  });

  it('should refresh without usage when reporting is disabled', async () => {
    const issuedAt = Math.floor(Date.now() / 1000) - 8 * 24 * 60 * 60;
    const payload = buildLicensePayload({ iat: issuedAt });
    const jwt = await signLicenseKey(payload, keyPair.privateKey);
    const refreshedJwt = await signLicenseKey(buildLicensePayload(), keyPair.privateKey);
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
    Reflect.set(EnvSet.values, 'isLicenseUsageReportingDisabled', true);

    const request = nock(EnvSet.values.cloudUrlSet.endpoint.origin)
      .post(
        `/api/self-hosted-licenses/${payload.licenseId}/refresh`,
        (body: Record<string, unknown>) => body.license === jwt && !('usage' in body)
      )
      .reply(200, { license: refreshedJwt, notices: [] });

    await reader.read(pool);
    await waitFor(() => request.isDone());
    await waitFor(() => upsertSystem.mock.calls.some(([key]) => key === LicenseKey.License));

    expect(collectLicenseUsage).not.toHaveBeenCalled();
  });

  it('should read the notices of the last refresh', async () => {
    const payload = buildLicensePayload();
    const jwt = await signLicenseKey(payload, keyPair.privateKey);
    const lastRefreshedAt = new Date(payload.iat * 1000).toISOString();
    const cloudNotices = [{ metric: LicenseUsageMetric.ProductionDeployments, limit: 1, value: 2 }];

    findSystemByKey.mockImplementation(async (key) => {
      if (key === LicenseKey.License) {
        return { value: { jwt, installedAt } };
      }
      if (key === LicenseKey.LicenseRefreshState) {
        return { value: { lastRefreshedAt, lastAttemptAt: lastRefreshedAt, cloudNotices } };
      }
      return null;
    });

    await expect(reader.read(pool)).resolves.toMatchObject({ cloudNotices });
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

  it('should skip a refresh another instance has already claimed', async () => {
    const issuedAt = Math.floor(Date.now() / 1000) - 8 * 24 * 60 * 60;
    const payload = buildLicensePayload({ iat: issuedAt });
    const jwt = await signLicenseKey(payload, keyPair.privateKey);
    const lastRefreshedAt = new Date(issuedAt * 1000).toISOString();
    const refreshStateReads = { count: 0 };

    findSystemByKey.mockImplementation(async (key) => {
      if (key === LicenseKey.License) {
        return { value: { jwt, installedAt } };
      }
      if (key === LicenseKey.LicenseRefreshState) {
        // Another instance records its attempt after this instance cached the refresh state.
        // eslint-disable-next-line @silverhand/fp/no-mutation -- counts reads to simulate it
        const isCachedRead = refreshStateReads.count++ === 0;
        return {
          value: {
            lastRefreshedAt,
            lastAttemptAt: isCachedRead ? lastRefreshedAt : new Date().toISOString(),
          },
        };
      }
      if (key === LicenseKey.LicenseDeploymentId) {
        return { value: 'deployment_1' };
      }
      return null;
    });

    const request = nock(EnvSet.values.cloudUrlSet.endpoint.origin)
      .post(`/api/self-hosted-licenses/${payload.licenseId}/refresh`)
      .reply(200, {});

    await reader.read(pool);
    await waitFor(() => refreshStateReads.count > 1);
    await new Promise((resolve) => {
      setTimeout(resolve, 50);
    });

    expect(request.isDone()).toBe(false);
    expect(upsertSystem).not.toHaveBeenCalled();
  });

  it('should time out a hung refresh so a later read can try again', async () => {
    const issuedAt = Math.floor(Date.now() / 1000) - 8 * 24 * 60 * 60;
    const payload = buildLicensePayload({ iat: issuedAt });
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

    const warn = jest.spyOn(licenseConsoleLog, 'warn').mockImplementation(noop);
    const path = `/api/self-hosted-licenses/${payload.licenseId}/refresh`;
    const { origin } = EnvSet.values.cloudUrlSet.endpoint;
    const hung = nock(origin)
      .post(path)
      .delay(licenseRefreshTimeout * 2)
      .reply(200, {});

    jest.useFakeTimers({ doNotFake: ['nextTick', 'setImmediate'] });

    try {
      await reader.read(pool);
      // Step the clock while letting the request's I/O callbacks run in between.
      for (const _ of Array.from({ length: (licenseRefreshTimeout + 1000) / 500 })) {
        jest.advanceTimersByTime(500);
        // eslint-disable-next-line no-await-in-loop -- each step must settle before the next
        await new Promise((resolve) => {
          setImmediate(resolve);
        });
      }
      expect(hung.isDone()).toBe(true);
      expect(warn).toHaveBeenCalled();
    } finally {
      jest.useRealTimers();
      // Drop nock's delayed reply timer for the hung request.
      nock.abortPendingRequests();
    }

    const retried = nock(origin).post(path).reply(200, {});
    reader.invalidate();
    await reader.read(pool);
    await waitFor(() => retried.isDone());
  });
});
