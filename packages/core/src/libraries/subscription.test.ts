import { ReservedPlanId } from '@logto/schemas';
import { createMockUtils } from '@logto/shared/esm';

import { mockSubscriptionData } from '#src/__mocks__/cloud-connection.js';

const { jest } = import.meta;
const { mockEsmWithActual } = createMockUtils(jest);
const mockGetTenantSubscription = jest.fn();
const mockCountTokenUsage = jest.fn();

const now = new Date();
// Set the current period end to 1 day from now
const currentPeriodEnd = new Date(now.getTime() + 1000 * 60 * 60 * 24);
const mockSubscription = {
  ...mockSubscriptionData,
  currentPeriodEnd: currentPeriodEnd.toISOString(),
};

await mockEsmWithActual('#src/utils/subscription/index.js', () => ({
  getTenantSubscription: mockGetTenantSubscription,
}));

const { MockTenant } = await import('#src/test-utils/tenant.js');

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
  const { subscription } = new MockTenant(undefined);

  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it('should get new subscription data if cache is expired', async () => {
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

    // Move the time to 1 day later
    jest.advanceTimersByTime(60 * 60 * 24);
    mockGetTenantSubscription.mockResolvedValueOnce({
      ...mockSubscriptionData,
      planId: ReservedPlanId.Pro202411,
    });

    // Should get new subscription data
    const refreshedSubscriptionData = await subscription.getSubscriptionData();
    expect(refreshedSubscriptionData).toEqual({
      ...mockSubscriptionData,
      planId: ReservedPlanId.Pro202411,
    });
    expect(mockGetTenantSubscription).toHaveBeenCalled();
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
    mockCountTokenUsage.mockResolvedValueOnce({ tokenUsage: 100 });
    const tokenUsage = await subscription.getTenantTokenUsage({
      from,
      to,
    });
    expect(tokenUsage).toBe(100);
  });

  it('should get tenant token usage from cache', async () => {
    mockCountTokenUsage.mockClear();
    const tokenUsageFromCache = await subscription.getTenantTokenUsage({
      from,
      to,
    });
    expect(tokenUsageFromCache).toBe(100);
    expect(mockCountTokenUsage).not.toHaveBeenCalled();
  });

  it('should get new tenant token usage if the period is different', async () => {
    mockCountTokenUsage.mockResolvedValueOnce({ tokenUsage: 200 });
    const tokenUsage = await subscription.getTenantTokenUsage({
      from,
      to: new Date(to.valueOf() + 1000 * 60 * 60 * 24),
    });

    expect(tokenUsage).toBe(200);
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

    mockCountTokenUsage.mockResolvedValueOnce({ tokenUsage: 100 });
    const tokenUsage = await subscription.getTenantTokenUsage({
      from,
      to,
    });
    expect(tokenUsage).toBe(100);

    // Move the time to 30 minutes later
    mockCountTokenUsage.mockClear();
    jest.advanceTimersByTime(tokenUsageCacheTtl / 2);
    const tokenUsageFromCache = await subscription.getTenantTokenUsage({
      from,
      to,
    });
    expect(tokenUsageFromCache).toBe(100);
    expect(mockCountTokenUsage).not.toHaveBeenCalled();

    // Move the time to 1 hour later
    mockCountTokenUsage.mockResolvedValueOnce({ tokenUsage: 200 });
    jest.advanceTimersByTime(tokenUsageCacheTtl / 2 + 1);
    const refreshedTokenUsage = await subscription.getTenantTokenUsage({
      from,
      to,
    });
    expect(refreshedTokenUsage).toBe(200);
    expect(mockCountTokenUsage).toHaveBeenCalled();
  });
});
