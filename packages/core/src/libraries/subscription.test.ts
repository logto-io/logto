import { ReservedPlanId, ossDefaultQuota, resolveLicenseQuota } from '@logto/schemas';
import { TtlCache } from '@logto/shared';
import { createMockUtils, pickDefault } from '@logto/shared/esm';

import { mockSubscriptionData } from '#src/__mocks__/cloud-connection.js';

const { jest } = import.meta;
const { mockEsmWithActual } = createMockUtils(jest);
const mockGetTenantSubscription = jest.fn();
const mockCountTokenUsage = jest.fn();

const now = new Date();
// Set the current period end to 2 day from now
const currentPeriodEnd = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 2);
const mockSubscription = {
  ...mockSubscriptionData,
  currentPeriodEnd: currentPeriodEnd.toISOString(),
};

// Set the current period end to a past date (1 day ago)
const pastPeriodEnd = new Date(now.getTime() - 1000 * 60 * 60 * 24);
const mockExpiredSubscription = {
  ...mockSubscriptionData,
  currentPeriodEnd: pastPeriodEnd.toISOString(),
};

await mockEsmWithActual('#src/utils/subscription/index.js', () => ({
  getTenantSubscription: mockGetTenantSubscription,
}));

const { MockTenant } = await import('#src/test-utils/tenant.js');
const { EnvSet } = await import('#src/env-set/index.js');
const { buildLicensePayload } = await import('#src/test-utils/license.js');
const { SubscriptionLibrary } = await import('./subscription.js');
const LicenseReader = await pickDefault(import('#src/license/LicenseReader.js'));

const originalIsCloud = EnvSet.values.isCloud;

/**
 * One `MockTenant` serves both entitlement sources, so the flag is flipped per test instead of
 * being read once when the library is constructed.
 */
const setIsCloud = (isCloud: boolean) => {
  Reflect.set(EnvSet.values, 'isCloud', isCloud);
};

/** The reader is the source of the license; stubbing it keeps the database out of these tests. */
const readLicense = jest.spyOn(LicenseReader.shared, 'read');

beforeEach(() => {
  // Every test below the self-hosted describe exercises the Cloud branch unless it says otherwise.
  setIsCloud(true);
  mockGetTenantSubscription.mockClear();
  readLicense.mockReset();
});

afterEach(() => {
  setIsCloud(originalIsCloud);
});

describe('get subscription data', () => {
  const { subscription } = new MockTenant(undefined);

  it('should get subscription data', async () => {
    mockGetTenantSubscription.mockResolvedValueOnce(mockSubscription);
    const subscriptionData = await subscription.getSubscriptionData();
    expect(subscriptionData).toEqual(mockSubscription);
  });

  it('should get subscription data from cache', async () => {
    mockGetTenantSubscription.mockClear();
    const subscriptionDataFromCache = await subscription.getSubscriptionData();
    expect(subscriptionDataFromCache).toEqual(mockSubscription);
    expect(mockGetTenantSubscription).not.toHaveBeenCalled();
  });
});

describe('get subscription data with cache expiration', () => {
  beforeEach(() => {
    jest.setSystemTime(new Date());
    jest.useFakeTimers();
    mockGetTenantSubscription.mockClear();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should get new subscription data if cache is expired', async () => {
    const { subscription } = new MockTenant(undefined);

    mockGetTenantSubscription.mockResolvedValueOnce(mockSubscription);
    const subscriptionData = await subscription.getSubscriptionData();
    expect(subscriptionData).toEqual(mockSubscription);

    // Move the time to 1 hour later
    // In Unit test we use ttlCache instead of redis cache
    // The ttl time unit is in milliseconds instead of seconds, so we do not need to multiply by 1000
    jest.advanceTimersByTime(60 * 60);
    mockGetTenantSubscription.mockClear();

    // Should hit the cache
    const subscriptionDataFromCache = await subscription.getSubscriptionData();
    expect(subscriptionDataFromCache).toEqual(mockSubscription);
    expect(mockGetTenantSubscription).not.toHaveBeenCalled();

    // Move the time to 1 day later
    jest.advanceTimersByTime(60 * 60 * 24);
    mockGetTenantSubscription.mockResolvedValueOnce({
      ...mockSubscription,
      planId: ReservedPlanId.Pro202509,
    });

    // Should get new subscription data
    const refreshedSubscriptionData = await subscription.getSubscriptionData();
    expect(refreshedSubscriptionData).toEqual({
      ...mockSubscription,
      planId: ReservedPlanId.Pro202509,
    });
    expect(mockGetTenantSubscription).toHaveBeenCalled();
  });

  it('should respect the 24 hours max TTL limit', async () => {
    const { subscription } = new MockTenant(undefined);

    // Set the current period end to 30 days from now
    const farFuturePeriodEnd = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 30);
    const mockFarFutureSubscription = {
      ...mockSubscriptionData,
      currentPeriodEnd: farFuturePeriodEnd.toISOString(),
    };

    mockGetTenantSubscription.mockResolvedValueOnce(mockFarFutureSubscription);
    const subscriptionData = await subscription.getSubscriptionData();
    expect(subscriptionData).toEqual(mockFarFutureSubscription);

    // Move the time to 23 hours later
    jest.advanceTimersByTime(23 * 60 * 60);
    mockGetTenantSubscription.mockClear();

    // Should hit the cache
    const subscriptionDataFromCache = await subscription.getSubscriptionData();
    expect(subscriptionDataFromCache).toEqual(mockFarFutureSubscription);
    expect(mockGetTenantSubscription).not.toHaveBeenCalled();

    // Move the time to 25 hours later (past the 24h max TTL)
    jest.advanceTimersByTime(2 * 60 * 60);
    mockGetTenantSubscription.mockResolvedValueOnce({
      ...mockFarFutureSubscription,
      planId: ReservedPlanId.Pro202509,
    });

    // Should get new subscription data due to max TTL
    const refreshedSubscriptionData = await subscription.getSubscriptionData();
    expect(refreshedSubscriptionData).toEqual({
      ...mockFarFutureSubscription,
      planId: ReservedPlanId.Pro202509,
    });
    expect(mockGetTenantSubscription).toHaveBeenCalled();
  });

  it('should get new subscription data if current period end time is past', async () => {
    // Create a new tenant to avoid interference with other tests
    const { subscription } = new MockTenant(undefined);

    mockGetTenantSubscription.mockResolvedValueOnce(mockExpiredSubscription);
    const subscriptionData = await subscription.getSubscriptionData();
    expect(subscriptionData).toEqual(mockExpiredSubscription);

    // Even though the period has ended, the cache should still be valid for a short time
    // (the implementation sets a minimum of 0 seconds, but the cache itself has a TTL)
    mockGetTenantSubscription.mockClear();
    const subscriptionDataFromCache = await subscription.getSubscriptionData();
    expect(subscriptionDataFromCache).toEqual(mockExpiredSubscription);
    expect(mockGetTenantSubscription).not.toHaveBeenCalled();

    // Move the time forward by 1 hour
    jest.advanceTimersByTime(60 * 60);
    mockGetTenantSubscription.mockResolvedValueOnce({
      ...mockExpiredSubscription,
      planId: ReservedPlanId.Pro202509,
    });

    // Should get new subscription data since the cache should be invalidated
    const refreshedSubscriptionData = await subscription.getSubscriptionData();
    expect(refreshedSubscriptionData).toEqual({
      ...mockExpiredSubscription,
      planId: ReservedPlanId.Pro202509,
    });
    expect(mockGetTenantSubscription).toHaveBeenCalled();
  });
});

describe('get self-hosted subscription data', () => {
  const { subscription } = new MockTenant(undefined);

  beforeEach(() => {
    setIsCloud(false);
  });

  it('should derive the subscription from the installed license', async () => {
    const payload = buildLicensePayload({
      plan: ReservedPlanId.SelfHostedPro,
      quota: { hideLogtoBranding: true, samlApplicationsLimit: null },
    });
    readLicense.mockResolvedValueOnce({
      payload,
      installedAt: '2026-09-14T00:00:00.000Z',
      quota: resolveLicenseQuota(payload.quota),
    });

    const subscriptionData = await subscription.getSubscriptionData();

    expect(subscriptionData).toEqual({
      planId: ReservedPlanId.SelfHostedPro,
      currentPeriodStart: new Date(payload.iat * 1000).toISOString(),
      currentPeriodEnd: new Date(payload.exp * 1000).toISOString(),
      isEnterprisePlan: false,
      status: 'active',
      quota: {
        ...ossDefaultQuota,
        hideLogtoBranding: true,
        samlApplicationsLimit: null,
      },
      systemLimit: {},
    });
    // The license belongs to the deployment rather than to a tenant, so it is read through the
    // shared pool, which is the only one that can reach the global `systems` table.
    expect(readLicense).toHaveBeenCalledWith(await EnvSet.sharedPool);
  });

  it('should mark the self-hosted enterprise plan', async () => {
    readLicense.mockResolvedValueOnce({
      payload: buildLicensePayload({ plan: ReservedPlanId.SelfHostedEnterprise }),
      installedAt: '2026-09-14T00:00:00.000Z',
      quota: resolveLicenseQuota(),
    });

    const { planId, isEnterprisePlan } = await subscription.getSubscriptionData();

    expect(planId).toBe(ReservedPlanId.SelfHostedEnterprise);
    expect(isEnterprisePlan).toBe(true);
  });

  it('should fall back to the OSS defaults without a license', async () => {
    // eslint-disable-next-line unicorn/no-useless-undefined -- `undefined` is the reader's answer for a deployment with no license key installed, not a redundant argument.
    readLicense.mockResolvedValueOnce(undefined);

    const subscriptionData = await subscription.getSubscriptionData();

    expect(subscriptionData).toMatchObject({
      planId: ReservedPlanId.Development,
      isEnterprisePlan: false,
      status: 'active',
      quota: ossDefaultQuota,
      systemLimit: {},
    });
  });

  it('should leave the tenant subscription cache alone', async () => {
    const cache = new TtlCache<string, string>(60_000);
    const getFromCache = jest.spyOn(cache, 'get');
    const setToCache = jest.spyOn(cache, 'set');
    const library = new SubscriptionLibrary(
      subscription.tenantId,
      subscription.queries,
      subscription.cloudConnection,
      cache
    );

    // eslint-disable-next-line unicorn/no-useless-undefined -- `undefined` is the reader's answer for a deployment with no license key installed, not a redundant argument.
    readLicense.mockResolvedValue(undefined);
    await library.getSubscriptionData();
    await library.getSubscriptionData();

    expect(getFromCache).not.toHaveBeenCalled();
    expect(setToCache).not.toHaveBeenCalled();
    expect(mockGetTenantSubscription).not.toHaveBeenCalled();
    // Caching outside Cloud is the reader's job; it keeps its own in-memory copy of the key.
    expect(readLicense).toHaveBeenCalledTimes(2);
  });
});

describe('get tenant token usage', () => {
  const { subscription } = new MockTenant(undefined, {
    dailyTokenUsage: {
      countTokenUsage: mockCountTokenUsage,
    },
  });

  const from = new Date();
  const to = new Date(from.valueOf() + 1000 * 60 * 60 * 24);

  it('should get tenant token usage without cache', async () => {
    mockCountTokenUsage.mockResolvedValueOnce({
      totalUsage: 100,
      userTokenUsage: 60,
      m2mTokenUsage: 40,
    });
    const tokenUsage = await subscription.getTenantTokenUsage({
      from,
      to,
    });
    expect(tokenUsage.totalUsage).toBe(100);
  });

  it('should get tenant token usage from cache', async () => {
    mockCountTokenUsage.mockClear();
    const tokenUsageFromCache = await subscription.getTenantTokenUsage({
      from,
      to,
    });
    expect(tokenUsageFromCache.totalUsage).toBe(100);
    expect(mockCountTokenUsage).not.toHaveBeenCalled();
  });

  it('should get new tenant token usage if the period is different', async () => {
    mockCountTokenUsage.mockResolvedValueOnce({
      totalUsage: 200,
      userTokenUsage: 120,
      m2mTokenUsage: 80,
    });
    const tokenUsage = await subscription.getTenantTokenUsage({
      from,
      to: new Date(to.valueOf() + 1000 * 60 * 60 * 24),
    });

    expect(tokenUsage.totalUsage).toBe(200);
    expect(mockCountTokenUsage).toHaveBeenCalled();
  });
});

describe('get tenant token usage with cache expiration', () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });
  afterAll(() => {
    jest.useRealTimers();
  });

  const tokenUsageCacheTtl = 60 * 60 * 1000; // 1 hour
  const from = new Date();
  const to = new Date(from.valueOf() + 1000 * 60 * 60 * 24);

  it('should get new tenant token usage if cache is expired', async () => {
    const { subscription } = new MockTenant(undefined, {
      dailyTokenUsage: {
        countTokenUsage: mockCountTokenUsage,
      },
    });

    mockCountTokenUsage.mockResolvedValueOnce({
      totalUsage: 100,
      userTokenUsage: 60,
      m2mTokenUsage: 40,
    });
    const tokenUsage = await subscription.getTenantTokenUsage({
      from,
      to,
    });
    expect(tokenUsage.totalUsage).toBe(100);

    // Move the time to 30 minutes later
    mockCountTokenUsage.mockClear();
    jest.advanceTimersByTime(tokenUsageCacheTtl / 2);
    const tokenUsageFromCache = await subscription.getTenantTokenUsage({
      from,
      to,
    });
    expect(tokenUsageFromCache.totalUsage).toBe(100);
    expect(mockCountTokenUsage).not.toHaveBeenCalled();

    // Move the time to 1 hour later
    mockCountTokenUsage.mockResolvedValueOnce({
      totalUsage: 200,
      userTokenUsage: 120,
      m2mTokenUsage: 80,
    });
    jest.advanceTimersByTime(tokenUsageCacheTtl / 2 + 1);
    const refreshedTokenUsage = await subscription.getTenantTokenUsage({
      from,
      to,
    });
    expect(refreshedTokenUsage.totalUsage).toBe(200);
    expect(mockCountTokenUsage).toHaveBeenCalled();
  });
});
