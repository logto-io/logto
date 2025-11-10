/* eslint-disable max-lines */
import { ConnectorType, ReservedPlanId } from '@logto/schemas';
import { createMockUtils } from '@logto/shared/esm';

import { mockSubscriptionData } from '#src/__mocks__/cloud-connection.js';

const { jest } = import.meta;
const { mockEsmWithActual } = createMockUtils(jest);

const mockGetTenantSubscription = jest.fn();
const mockReportSubscriptionUpdates = jest.fn();

await mockEsmWithActual('#src/utils/subscription/index.js', () => ({
  getTenantSubscription: mockGetTenantSubscription,
  reportSubscriptionUpdates: mockReportSubscriptionUpdates,
}));

const { EnvSet } = await import('#src/env-set/index.js');
const { MockTenant } = await import('#src/test-utils/tenant.js');
const { QuotaLibrary } = await import('./quota.js');

const originalIsCloud = EnvSet.values.isCloud;
const originalIsIntegrationTest = EnvSet.values.isIntegrationTest;

/**
 * These tests spin up a full MockTenant, which instantiates the real EnvSet and runs its load sequence.
 * If we fully mocked `#src/env-set/index.js` (like social-verification tests do), that constructor would
 * lose the class implementation and crash. At the same time the compiled QuotaLibrary already holds a
 * reference to the original EnvSet singleton. Mutating the live flags keeps both MockTenant and
 * QuotaLibrary aligned with the test scenarios without breaking their dependency chain.
 */
const setEnvFlag = (key: 'isCloud' | 'isIntegrationTest', value: boolean) => {
  Reflect.set(EnvSet.values, key, value);
};

const createQuotaLibrary = ({
  queriesOverride,
  connectorsOverride,
}: {
  queriesOverride?: ConstructorParameters<typeof MockTenant>[1];
  connectorsOverride?: ConstructorParameters<typeof MockTenant>[2];
} = {}) => {
  const tenant = new MockTenant(undefined, queriesOverride, connectorsOverride);
  const quotaLibrary = new QuotaLibrary(
    tenant.id,
    tenant.queries,
    tenant.connectors,
    tenant.cloudConnection,
    tenant.subscription
  );

  return { tenant, quotaLibrary };
};

beforeEach(() => {
  jest.clearAllMocks();
  setEnvFlag('isCloud', true);
  setEnvFlag('isIntegrationTest', false);

  mockGetTenantSubscription.mockResolvedValue(mockSubscriptionData);
});

afterEach(() => {
  setEnvFlag('isCloud', originalIsCloud);
  setEnvFlag('isIntegrationTest', originalIsIntegrationTest);
});

describe('guardTenantUsageByKey', () => {
  it('skips guard in non-cloud environment', async () => {
    setEnvFlag('isCloud', false);

    const getSelfComputedUsageByKey = jest.fn();
    const { quotaLibrary } = createQuotaLibrary({
      queriesOverride: {
        tenantUsage: { getSelfComputedUsageByKey },
      },
    });

    await expect(quotaLibrary.guardTenantUsageByKey('applicationsLimit')).resolves.not.toThrow();

    expect(mockGetTenantSubscription).not.toHaveBeenCalled();
    expect(getSelfComputedUsageByKey).not.toHaveBeenCalled();
  });

  it('skips guard when both quota and system limits are null/undefined', async () => {
    mockGetTenantSubscription.mockResolvedValueOnce({
      ...mockSubscriptionData,
      quota: {
        ...mockSubscriptionData.quota,
        applicationsLimit: null,
      },
      systemLimit: {
        ...mockSubscriptionData.systemLimit,
        applicationsLimit: undefined,
      },
    });

    const getSelfComputedUsageByKey = jest.fn();
    const { quotaLibrary } = createQuotaLibrary({
      queriesOverride: {
        tenantUsage: { getSelfComputedUsageByKey },
      },
    });

    await quotaLibrary.guardTenantUsageByKey('applicationsLimit');

    expect(getSelfComputedUsageByKey).not.toHaveBeenCalled();
  });

  it('throws when usage reaches system limit', async () => {
    mockGetTenantSubscription.mockResolvedValueOnce({
      ...mockSubscriptionData,
      quota: {
        ...mockSubscriptionData.quota,
        applicationsLimit: null,
      },
      systemLimit: {
        ...mockSubscriptionData.systemLimit,
        applicationsLimit: 2,
      },
    });

    const getSelfComputedUsageByKey = jest.fn().mockResolvedValue(2);
    const { quotaLibrary } = createQuotaLibrary({
      queriesOverride: {
        tenantUsage: { getSelfComputedUsageByKey },
      },
    });

    await expect(quotaLibrary.guardTenantUsageByKey('applicationsLimit')).rejects.toMatchObject({
      code: 'system_limit.limit_exceeded',
      status: 403,
    });

    expect(getSelfComputedUsageByKey).toHaveBeenCalledTimes(1);
  });

  it('throws when boolean quota limit is disabled', async () => {
    const { quotaLibrary } = createQuotaLibrary();

    await expect(quotaLibrary.guardTenantUsageByKey('mfaEnabled')).rejects.toMatchObject({
      code: 'subscription.limit_exceeded',
      status: 403,
    });
  });

  it('throws when boolean quota limit is not boolean type', async () => {
    mockGetTenantSubscription.mockResolvedValueOnce({
      ...mockSubscriptionData,
      quota: {
        ...mockSubscriptionData.quota,
        mfaEnabled: 'true' as unknown as boolean,
      },
    });

    const { quotaLibrary } = createQuotaLibrary();

    await expect(quotaLibrary.guardTenantUsageByKey('mfaEnabled')).rejects.toThrow(
      'Feature availability settings must be boolean type.'
    );
  });

  it('allows boolean quota when enabled', async () => {
    mockGetTenantSubscription.mockResolvedValueOnce({
      ...mockSubscriptionData,
      quota: {
        ...mockSubscriptionData.quota,
        mfaEnabled: true,
      },
    });

    const { quotaLibrary } = createQuotaLibrary();

    await expect(quotaLibrary.guardTenantUsageByKey('mfaEnabled')).resolves.not.toThrow();
  });

  it('passes when usage is below quota limit', async () => {
    const getSelfComputedUsageByKey = jest.fn().mockResolvedValue(2);

    const { tenant, quotaLibrary } = createQuotaLibrary({
      queriesOverride: {
        tenantUsage: { getSelfComputedUsageByKey },
      },
    });

    await quotaLibrary.guardTenantUsageByKey('applicationsLimit');

    expect(getSelfComputedUsageByKey).toHaveBeenCalledWith(
      tenant.id,
      'applicationsLimit',
      undefined
    );
  });

  it('throws when numeric quota limit is not number type', async () => {
    mockGetTenantSubscription.mockResolvedValueOnce({
      ...mockSubscriptionData,
      quota: {
        ...mockSubscriptionData.quota,
        applicationsLimit: '3' as unknown as number,
      },
      systemLimit: {
        ...mockSubscriptionData.systemLimit,
        applicationsLimit: undefined,
      },
    });

    const getSelfComputedUsageByKey = jest.fn();

    const { quotaLibrary } = createQuotaLibrary({
      queriesOverride: {
        tenantUsage: { getSelfComputedUsageByKey },
      },
    });

    await expect(quotaLibrary.guardTenantUsageByKey('applicationsLimit')).rejects.toThrow(
      'Usage limit must be number type for numeric limits.'
    );

    expect(getSelfComputedUsageByKey).not.toHaveBeenCalled();
  });

  it('throws when usage exceeds quota limit', async () => {
    const getSelfComputedUsageByKey = jest.fn().mockResolvedValue(5);

    const { quotaLibrary } = createQuotaLibrary({
      queriesOverride: {
        tenantUsage: { getSelfComputedUsageByKey },
      },
    });

    await expect(quotaLibrary.guardTenantUsageByKey('applicationsLimit')).rejects.toMatchObject({
      code: 'subscription.limit_exceeded',
      status: 403,
    });
  });

  it('uses connector library for socialConnectorsLimit', async () => {
    mockGetTenantSubscription.mockResolvedValueOnce({
      ...mockSubscriptionData,
      quota: {
        ...mockSubscriptionData.quota,
        socialConnectorsLimit: 3,
      },
    });

    const getLogtoConnectors = jest.fn().mockResolvedValue([
      { type: ConnectorType.Social, metadata: { target: 'google' } },
      { type: ConnectorType.Email, metadata: { target: 'email' } },
    ]);

    const { quotaLibrary } = createQuotaLibrary({
      connectorsOverride: { getLogtoConnectors },
      queriesOverride: {
        tenantUsage: { getSelfComputedUsageByKey: jest.fn() },
      },
    });

    await quotaLibrary.guardTenantUsageByKey('socialConnectorsLimit');

    expect(getLogtoConnectors).toHaveBeenCalled();
  });

  it('passes entity context to tenant usage query', async () => {
    mockGetTenantSubscription.mockResolvedValueOnce({
      ...mockSubscriptionData,
      quota: {
        ...mockSubscriptionData.quota,
        scopesPerResourceLimit: 10,
      },
    });

    const getSelfComputedUsageByKey = jest.fn().mockResolvedValue(4);

    const { tenant, quotaLibrary } = createQuotaLibrary({
      queriesOverride: {
        tenantUsage: { getSelfComputedUsageByKey },
      },
    });

    await quotaLibrary.guardTenantUsageByKey('scopesPerResourceLimit', { entityId: 'resource_1' });

    expect(getSelfComputedUsageByKey).toHaveBeenCalledWith(
      tenant.id,
      'scopesPerResourceLimit',
      'resource_1'
    );
  });

  it('throws when entity usage exceeds limit', async () => {
    mockGetTenantSubscription.mockResolvedValueOnce({
      ...mockSubscriptionData,
      quota: {
        ...mockSubscriptionData.quota,
        scopesPerRoleLimit: 3,
      },
    });

    const getSelfComputedUsageByKey = jest.fn().mockResolvedValue(3);

    const { quotaLibrary } = createQuotaLibrary({
      queriesOverride: {
        tenantUsage: { getSelfComputedUsageByKey },
      },
    });

    await expect(
      quotaLibrary.guardTenantUsageByKey('scopesPerRoleLimit', { entityId: 'role_1' })
    ).rejects.toMatchObject({
      code: 'subscription.limit_exceeded',
      status: 403,
    });
  });

  it('skips guard for add-on usage keys on paid plans', async () => {
    mockGetTenantSubscription.mockResolvedValueOnce({
      ...mockSubscriptionData,
      planId: ReservedPlanId.Pro202509,
      quota: {
        ...mockSubscriptionData.quota,
        machineToMachineLimit: 1,
      },
      systemLimit: {
        ...mockSubscriptionData.systemLimit,
        machineToMachineLimit: undefined,
      },
    });

    const getSelfComputedUsageByKey = jest.fn().mockResolvedValue(0);

    const { quotaLibrary } = createQuotaLibrary({
      queriesOverride: {
        tenantUsage: { getSelfComputedUsageByKey },
      },
    });

    await quotaLibrary.guardTenantUsageByKey('machineToMachineLimit');

    expect(getSelfComputedUsageByKey).not.toHaveBeenCalled();
  });

  it('calls getTenantUsageByKey only once when both system limit and quota limit checks are needed', async () => {
    mockGetTenantSubscription.mockResolvedValueOnce({
      ...mockSubscriptionData,
      quota: {
        ...mockSubscriptionData.quota,
        applicationsLimit: 10, // Quota limit set
      },
      systemLimit: {
        ...mockSubscriptionData.systemLimit,
        applicationsLimit: 5, // System limit set (lower than quota)
      },
    });

    const getSelfComputedUsageByKey = jest.fn().mockResolvedValue(2);

    const { quotaLibrary } = createQuotaLibrary({
      queriesOverride: {
        tenantUsage: { getSelfComputedUsageByKey },
      },
    });

    // Should pass both checks: 2 < 5 (system limit) and 2 < 10 (quota limit)
    await expect(quotaLibrary.guardTenantUsageByKey('applicationsLimit')).resolves.not.toThrow();

    // The key point: usage should be fetched only once, not twice
    expect(getSelfComputedUsageByKey).toHaveBeenCalledTimes(1);
  });

  it('allows usage when usage + consumeUsageCount equals limit', async () => {
    mockGetTenantSubscription.mockResolvedValueOnce({
      ...mockSubscriptionData,
      quota: {
        ...mockSubscriptionData.quota,
        applicationsLimit: 10,
      },
    });

    const getSelfComputedUsageByKey = jest.fn().mockResolvedValue(7);

    const { quotaLibrary } = createQuotaLibrary({
      queriesOverride: {
        tenantUsage: { getSelfComputedUsageByKey },
      },
    });

    // 7 + 3 = 10, should be allowed (<=)
    await expect(
      quotaLibrary.guardTenantUsageByKey('applicationsLimit', { consumeUsageCount: 3 })
    ).resolves.not.toThrow();
  });

  it('throws when usage + consumeUsageCount exceeds limit', async () => {
    mockGetTenantSubscription.mockResolvedValueOnce({
      ...mockSubscriptionData,
      quota: {
        ...mockSubscriptionData.quota,
        applicationsLimit: 10,
      },
    });

    const getSelfComputedUsageByKey = jest.fn().mockResolvedValue(7);

    const { quotaLibrary } = createQuotaLibrary({
      queriesOverride: {
        tenantUsage: { getSelfComputedUsageByKey },
      },
    });

    // 7 + 4 = 11 > 10, should throw
    await expect(
      quotaLibrary.guardTenantUsageByKey('applicationsLimit', { consumeUsageCount: 4 })
    ).rejects.toMatchObject({
      code: 'subscription.limit_exceeded',
      status: 403,
    });
  });

  it('allows batch operation when total usage equals limit for entity-based quota', async () => {
    mockGetTenantSubscription.mockResolvedValueOnce({
      ...mockSubscriptionData,
      quota: {
        ...mockSubscriptionData.quota,
        scopesPerRoleLimit: 10,
      },
    });

    const getSelfComputedUsageByKey = jest.fn().mockResolvedValue(5);

    const { quotaLibrary } = createQuotaLibrary({
      queriesOverride: {
        tenantUsage: { getSelfComputedUsageByKey },
      },
    });

    // Simulating adding 5 scopes at once: 5 + 5 = 10, should be allowed
    await expect(
      quotaLibrary.guardTenantUsageByKey('scopesPerRoleLimit', {
        entityId: 'role_1',
        consumeUsageCount: 5,
      })
    ).resolves.not.toThrow();
  });

  it('blocks batch operation that would exceed entity-based quota limit', async () => {
    mockGetTenantSubscription.mockResolvedValueOnce({
      ...mockSubscriptionData,
      quota: {
        ...mockSubscriptionData.quota,
        scopesPerRoleLimit: 10,
      },
    });

    const getSelfComputedUsageByKey = jest.fn().mockResolvedValue(5);

    const { quotaLibrary } = createQuotaLibrary({
      queriesOverride: {
        tenantUsage: { getSelfComputedUsageByKey },
      },
    });

    // Simulating adding 100 scopes at once: 5 + 100 = 105 > 10, should throw
    await expect(
      quotaLibrary.guardTenantUsageByKey('scopesPerRoleLimit', {
        entityId: 'role_1',
        consumeUsageCount: 100,
      })
    ).rejects.toMatchObject({
      code: 'subscription.limit_exceeded',
      status: 403,
    });
  });

  it('respects system limit with batch consumption', async () => {
    mockGetTenantSubscription.mockResolvedValueOnce({
      ...mockSubscriptionData,
      quota: {
        ...mockSubscriptionData.quota,
        applicationsLimit: null,
      },
      systemLimit: {
        ...mockSubscriptionData.systemLimit,
        applicationsLimit: 10,
      },
    });

    const getSelfComputedUsageByKey = jest.fn().mockResolvedValue(8);

    const { quotaLibrary } = createQuotaLibrary({
      queriesOverride: {
        tenantUsage: { getSelfComputedUsageByKey },
      },
    });

    // 8 + 3 = 11 > 10, should throw system limit error
    await expect(
      quotaLibrary.guardTenantUsageByKey('applicationsLimit', { consumeUsageCount: 3 })
    ).rejects.toMatchObject({
      code: 'system_limit.limit_exceeded',
      status: 403,
    });
  });
});

describe('reportSubscriptionUpdatesUsage', () => {
  it('skips in non-cloud environment', async () => {
    setEnvFlag('isCloud', false);

    const { quotaLibrary } = createQuotaLibrary();

    await quotaLibrary.reportSubscriptionUpdatesUsage('machineToMachineLimit');

    expect(mockReportSubscriptionUpdates).not.toHaveBeenCalled();
    expect(mockGetTenantSubscription).not.toHaveBeenCalled();
  });

  it('skips in integration test environment', async () => {
    setEnvFlag('isIntegrationTest', true);

    const { quotaLibrary } = createQuotaLibrary();

    await quotaLibrary.reportSubscriptionUpdatesUsage('machineToMachineLimit');

    expect(mockReportSubscriptionUpdates).not.toHaveBeenCalled();
  });

  it('reports usage updates for Pro plan add-on keys', async () => {
    mockGetTenantSubscription.mockResolvedValueOnce({
      ...mockSubscriptionData,
      planId: ReservedPlanId.Pro,
      isEnterprisePlan: false,
    });

    const { quotaLibrary, tenant } = createQuotaLibrary();

    await quotaLibrary.reportSubscriptionUpdatesUsage('machineToMachineLimit');

    expect(mockReportSubscriptionUpdates).toHaveBeenCalledWith(
      tenant.cloudConnection,
      'machineToMachineLimit'
    );
  });

  it('reports usage updates for enterprise plans', async () => {
    mockGetTenantSubscription.mockResolvedValueOnce({
      ...mockSubscriptionData,
      planId: 'enterprise-plan',
      isEnterprisePlan: true,
    });

    const { quotaLibrary, tenant } = createQuotaLibrary();

    await quotaLibrary.reportSubscriptionUpdatesUsage('resourcesLimit');

    expect(mockReportSubscriptionUpdates).toHaveBeenCalledWith(
      tenant.cloudConnection,
      'resourcesLimit'
    );
  });

  it('does not report for Free plan', async () => {
    mockGetTenantSubscription.mockResolvedValueOnce({
      ...mockSubscriptionData,
      planId: ReservedPlanId.Free,
      isEnterprisePlan: false,
    });

    const { quotaLibrary } = createQuotaLibrary();

    await quotaLibrary.reportSubscriptionUpdatesUsage('machineToMachineLimit');

    expect(mockReportSubscriptionUpdates).not.toHaveBeenCalled();
  });

  it('does not report for non add-on usage keys', async () => {
    mockGetTenantSubscription.mockResolvedValueOnce({
      ...mockSubscriptionData,
      planId: ReservedPlanId.Pro,
      isEnterprisePlan: false,
    });

    const { quotaLibrary } = createQuotaLibrary();

    await quotaLibrary.reportSubscriptionUpdatesUsage('applicationsLimit');

    expect(mockReportSubscriptionUpdates).not.toHaveBeenCalled();
  });
});
/* eslint-enable max-lines */
