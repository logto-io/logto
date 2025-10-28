/* eslint-disable max-lines */
import { ReservedPlanId, ConnectorType } from '@logto/schemas';
import { createMockUtils } from '@logto/shared/esm';

import { mockSubscriptionData } from '#src/__mocks__/cloud-connection.js';

const { jest } = import.meta;
const { mockEsmWithActual } = createMockUtils(jest);

// Mock functions
const mockGetTenantSubscription = jest.fn();
const mockGetTenantUsageData = jest.fn();
const mockReportSubscriptionUpdates = jest.fn();

// Mock subscription/index.js
await mockEsmWithActual('#src/utils/subscription/index.js', () => ({
  getTenantSubscription: mockGetTenantSubscription,
  getTenantUsageData: mockGetTenantUsageData,
  reportSubscriptionUpdates: mockReportSubscriptionUpdates,
}));

const { EnvSet } = await import('#src/env-set/index.js');

const { MockTenant } = await import('#src/test-utils/tenant.js');
const { QuotaLibrary } = await import('./quota.js');

const tenantId = 'test_tenant';

const defaultRawUsage = {
  applicationsLimit: 0,
  thirdPartyApplicationsLimit: 0,
  scopesPerResourceLimit: 0,
  userRolesLimit: 0,
  machineToMachineRolesLimit: 0,
  scopesPerRoleLimit: 0,
  hooksLimit: 0,
  customJwtEnabled: false,
  bringYourUiEnabled: false,
  collectUserProfileEnabled: false,
  machineToMachineLimit: 0,
  resourcesLimit: 0,
  enterpriseSsoLimit: 0,
  mfaEnabled: false,
  securityFeaturesEnabled: false,
  idpInitiatedSsoEnabled: false,
  samlApplicationsLimit: 0,
  organizationsLimit: 0,
};

// Store original values to restore after each test
const originalIsCloud = EnvSet.values.isCloud;
const originalIsDevFeaturesEnabled = EnvSet.values.isDevFeaturesEnabled;
const originalIsIntegrationTest = EnvSet.values.isIntegrationTest;

/**
 * These tests spin up a full MockTenant, which instantiates the real EnvSet and runs its load sequence.
 * If we fully mocked `#src/env-set/index.js` (like social-verification tests do), that constructor would
 * lose the class implementation and crash. At the same time the compiled QuotaLibrary already holds a
 * reference to the original EnvSet singleton. Mutating the live flags keeps both MockTenant and
 * QuotaLibrary aligned with the test scenarios without breaking their dependency chain.
 */
const setEnvFlag = (
  key: 'isCloud' | 'isDevFeaturesEnabled' | 'isIntegrationTest',
  value: boolean
) => {
  Reflect.set(EnvSet.values, key, value);
};

describe('guardTenantUsageByKey', () => {
  beforeEach(() => {
    setEnvFlag('isCloud', true);
    setEnvFlag('isDevFeaturesEnabled', true);
    jest.clearAllMocks();
    mockGetTenantSubscription.mockResolvedValue(mockSubscriptionData);
  });

  afterEach(() => {
    setEnvFlag('isCloud', originalIsCloud);
    setEnvFlag('isDevFeaturesEnabled', originalIsDevFeaturesEnabled);
  });

  it('should skip guard in non-cloud environment', async () => {
    setEnvFlag('isCloud', false);
    const { queries, cloudConnection, connectors, subscription } = new MockTenant();
    const quotaLibrary = new QuotaLibrary(
      tenantId,
      queries,
      connectors,
      cloudConnection,
      subscription
    );

    // Should not throw any error
    await expect(quotaLibrary.guardTenantUsageByKey('applicationsLimit')).resolves.not.toThrow();
  });

  it('should pass when system limit is not exceeded', async () => {
    const { queries, cloudConnection, connectors, subscription } = new MockTenant();

    const mockRawUsage = {
      ...defaultRawUsage,
      applicationsLimit: 2, // Below both system limit (100) and quota limit (3)
    };

    // eslint-disable-next-line @silverhand/fp/no-mutation
    queries.tenantUsage.getRawTenantUsage = jest.fn().mockResolvedValue(mockRawUsage);
    // eslint-disable-next-line @silverhand/fp/no-mutation
    connectors.getLogtoConnectors = jest.fn().mockResolvedValue([]);

    const quotaLibrary = new QuotaLibrary(
      tenantId,
      queries,
      connectors,
      cloudConnection,
      subscription
    );

    await quotaLibrary.guardTenantUsageByKey('applicationsLimit');

    expect(queries.tenantUsage.getRawTenantUsage).toHaveBeenCalledWith(tenantId);
  });

  it('should throw system limit error when system limit is exceeded', async () => {
    const { queries, cloudConnection, connectors, subscription } = new MockTenant();

    const mockRawUsage = {
      ...defaultRawUsage,
      applicationsLimit: 100, // At or above system limit of 100
    };

    // eslint-disable-next-line @silverhand/fp/no-mutation
    queries.tenantUsage.getRawTenantUsage = jest.fn().mockResolvedValue(mockRawUsage);
    // eslint-disable-next-line @silverhand/fp/no-mutation
    connectors.getLogtoConnectors = jest.fn().mockResolvedValue([]);

    const quotaLibrary = new QuotaLibrary(
      tenantId,
      queries,
      connectors,
      cloudConnection,
      subscription
    );

    await expect(quotaLibrary.guardTenantUsageByKey('applicationsLimit')).rejects.toMatchObject({
      code: 'system_limit.limit_exceeded',
      status: 403,
    });
  });

  it('should throw quota limit error when quota limit is exceeded', async () => {
    // Disable system limit check to test quota limit independently
    setEnvFlag('isDevFeaturesEnabled', false);

    const { queries, cloudConnection, connectors, subscription } = new MockTenant();

    const mockRawUsage = {
      ...defaultRawUsage,
      applicationsLimit: 5, // Above quota limit of 3 (from mockQuota)
    };

    // eslint-disable-next-line @silverhand/fp/no-mutation
    queries.tenantUsage.getRawTenantUsage = jest.fn().mockResolvedValue(mockRawUsage);
    // eslint-disable-next-line @silverhand/fp/no-mutation
    connectors.getLogtoConnectors = jest.fn().mockResolvedValue([]);

    const quotaLibrary = new QuotaLibrary(
      tenantId,
      queries,
      connectors,
      cloudConnection,
      subscription
    );

    await expect(quotaLibrary.guardTenantUsageByKey('applicationsLimit')).rejects.toMatchObject({
      code: 'subscription.limit_exceeded',
      status: 403,
    });
  });

  it('should check system limit first, then quota limit', async () => {
    const { queries, cloudConnection, connectors, subscription } = new MockTenant();

    // Set usage that exceeds both limits
    const mockRawUsage = {
      ...defaultRawUsage,
      applicationsLimit: 150, // Exceeds both system limit (100) and quota (3)
    };

    // eslint-disable-next-line @silverhand/fp/no-mutation
    queries.tenantUsage.getRawTenantUsage = jest.fn().mockResolvedValue(mockRawUsage);
    // eslint-disable-next-line @silverhand/fp/no-mutation
    connectors.getLogtoConnectors = jest.fn().mockResolvedValue([]);

    const quotaLibrary = new QuotaLibrary(
      tenantId,
      queries,
      connectors,
      cloudConnection,
      subscription
    );

    // Should throw system limit error first
    await expect(quotaLibrary.guardTenantUsageByKey('applicationsLimit')).rejects.toMatchObject({
      code: 'system_limit.limit_exceeded',
      status: 403,
    });
  });

  it('should skip checks when neither system limit nor quota limit is defined', async () => {
    setEnvFlag('isDevFeaturesEnabled', false);

    mockGetTenantSubscription.mockResolvedValueOnce({
      ...mockSubscriptionData,
      quota: {
        ...mockSubscriptionData.quota,
        applicationsLimit: null, // Unlimited
      },
      systemLimit: {
        ...mockSubscriptionData.systemLimit,
        applicationsLimit: undefined, // No system limit
      },
    });

    const { queries, cloudConnection, connectors, subscription } = new MockTenant();

    // Spy on the method to check if it's called
    const getRawTenantUsageSpy = jest.spyOn(queries.tenantUsage, 'getRawTenantUsage');

    const quotaLibrary = new QuotaLibrary(
      tenantId,
      queries,
      connectors,
      cloudConnection,
      subscription
    );

    await quotaLibrary.guardTenantUsageByKey('applicationsLimit');

    // Should not fetch usage if no checks are needed
    expect(getRawTenantUsageSpy).not.toHaveBeenCalled();
  });

  it('should handle boolean quota limits', async () => {
    setEnvFlag('isDevFeaturesEnabled', false);

    mockGetTenantSubscription.mockResolvedValueOnce({
      ...mockSubscriptionData,
      quota: {
        ...mockSubscriptionData.quota,
        mfaEnabled: false, // Boolean limit disabled
      },
    });

    const { queries, cloudConnection, connectors, subscription } = new MockTenant();

    const mockRawUsage = {
      ...defaultRawUsage,
      mfaEnabled: true, // Usage says enabled
    };

    // eslint-disable-next-line @silverhand/fp/no-mutation
    queries.tenantUsage.getRawTenantUsage = jest.fn().mockResolvedValue(mockRawUsage);
    // eslint-disable-next-line @silverhand/fp/no-mutation
    connectors.getLogtoConnectors = jest.fn().mockResolvedValue([]);

    const quotaLibrary = new QuotaLibrary(
      tenantId,
      queries,
      connectors,
      cloudConnection,
      subscription
    );

    await expect(quotaLibrary.guardTenantUsageByKey('mfaEnabled')).rejects.toMatchObject({
      code: 'subscription.limit_exceeded',
      status: 403,
    });
  });

  it('should use getTenantUsageData for tenantMembersLimit', async () => {
    setEnvFlag('isDevFeaturesEnabled', false);

    mockGetTenantUsageData.mockResolvedValue({
      quota: mockSubscriptionData.quota,
      usage: { tenantMembersLimit: 5 },
      resources: {},
      roles: {},
    });

    mockGetTenantSubscription.mockResolvedValueOnce({
      ...mockSubscriptionData,
      quota: {
        ...mockSubscriptionData.quota,
        tenantMembersLimit: 10,
      },
    });

    const { queries, cloudConnection, connectors, subscription } = new MockTenant();

    const quotaLibrary = new QuotaLibrary(
      tenantId,
      queries,
      connectors,
      cloudConnection,
      subscription
    );

    await quotaLibrary.guardTenantUsageByKey('tenantMembersLimit');

    expect(mockGetTenantUsageData).toHaveBeenCalledWith(cloudConnection);
  });
});

describe('guardEntityScopesUsage', () => {
  beforeEach(() => {
    setEnvFlag('isCloud', true);
    jest.clearAllMocks();
    mockGetTenantSubscription.mockResolvedValue(mockSubscriptionData);
  });

  afterEach(() => {
    setEnvFlag('isCloud', originalIsCloud);
  });

  it('should skip guard in non-cloud environment', async () => {
    setEnvFlag('isCloud', false);
    const { queries, cloudConnection, connectors, subscription } = new MockTenant();
    const quotaLibrary = new QuotaLibrary(
      tenantId,
      queries,
      connectors,
      cloudConnection,
      subscription
    );

    // Should not throw any error
    await expect(
      quotaLibrary.guardEntityScopesUsage('resources', 'resource_id')
    ).resolves.not.toThrow();
  });

  it('should pass when resource scopes limit is not exceeded', async () => {
    mockGetTenantSubscription.mockResolvedValueOnce({
      ...mockSubscriptionData,
      quota: {
        ...mockSubscriptionData.quota,
        scopesPerResourceLimit: 10,
      },
    });

    const { queries, cloudConnection, connectors, subscription } = new MockTenant();

    // eslint-disable-next-line @silverhand/fp/no-mutation
    queries.tenantUsage.getScopesForResourcesTenantUsage = jest
      .fn()
      .mockResolvedValue({ resource_id: 5 });

    const quotaLibrary = new QuotaLibrary(
      tenantId,
      queries,
      connectors,
      cloudConnection,
      subscription
    );

    await quotaLibrary.guardEntityScopesUsage('resources', 'resource_id');

    expect(queries.tenantUsage.getScopesForResourcesTenantUsage).toHaveBeenCalledWith(tenantId);
  });

  it('should throw error when resource scopes limit is exceeded', async () => {
    mockGetTenantSubscription.mockResolvedValueOnce({
      ...mockSubscriptionData,
      quota: {
        ...mockSubscriptionData.quota,
        scopesPerResourceLimit: 5,
      },
    });

    const { queries, cloudConnection, connectors, subscription } = new MockTenant();

    // eslint-disable-next-line @silverhand/fp/no-mutation
    queries.tenantUsage.getScopesForResourcesTenantUsage = jest
      .fn()
      .mockResolvedValue({ resource_id: 10 });

    const quotaLibrary = new QuotaLibrary(
      tenantId,
      queries,
      connectors,
      cloudConnection,
      subscription
    );

    await expect(
      quotaLibrary.guardEntityScopesUsage('resources', 'resource_id')
    ).rejects.toMatchObject({
      code: 'subscription.limit_exceeded',
      status: 403,
    });
  });

  it('should pass when role scopes limit is not exceeded', async () => {
    mockGetTenantSubscription.mockResolvedValueOnce({
      ...mockSubscriptionData,
      quota: {
        ...mockSubscriptionData.quota,
        scopesPerRoleLimit: 10,
      },
    });

    const { queries, cloudConnection, connectors, subscription } = new MockTenant();

    // eslint-disable-next-line @silverhand/fp/no-mutation
    queries.tenantUsage.getScopesForRolesTenantUsage = jest.fn().mockResolvedValue({ role_id: 3 });

    const quotaLibrary = new QuotaLibrary(
      tenantId,
      queries,
      connectors,
      cloudConnection,
      subscription
    );

    await quotaLibrary.guardEntityScopesUsage('roles', 'role_id');

    expect(queries.tenantUsage.getScopesForRolesTenantUsage).toHaveBeenCalled();
  });

  it('should throw error when role scopes limit is exceeded', async () => {
    mockGetTenantSubscription.mockResolvedValueOnce({
      ...mockSubscriptionData,
      quota: {
        ...mockSubscriptionData.quota,
        scopesPerRoleLimit: 5,
      },
    });

    const { queries, cloudConnection, connectors, subscription } = new MockTenant();

    // eslint-disable-next-line @silverhand/fp/no-mutation
    queries.tenantUsage.getScopesForRolesTenantUsage = jest.fn().mockResolvedValue({ role_id: 10 });

    const quotaLibrary = new QuotaLibrary(
      tenantId,
      queries,
      connectors,
      cloudConnection,
      subscription
    );

    await expect(quotaLibrary.guardEntityScopesUsage('roles', 'role_id')).rejects.toMatchObject({
      code: 'subscription.limit_exceeded',
      status: 403,
    });
  });

  it('should allow unlimited scopes when limit is null', async () => {
    mockGetTenantSubscription.mockResolvedValueOnce({
      ...mockSubscriptionData,
      quota: {
        ...mockSubscriptionData.quota,
        scopesPerResourceLimit: null, // Unlimited
      },
    });

    const { queries, cloudConnection, connectors, subscription } = new MockTenant();

    // eslint-disable-next-line @silverhand/fp/no-mutation
    queries.tenantUsage.getScopesForResourcesTenantUsage = jest
      .fn()
      .mockResolvedValue({ resource_id: 1000 });

    const quotaLibrary = new QuotaLibrary(
      tenantId,
      queries,
      connectors,
      cloudConnection,
      subscription
    );

    await quotaLibrary.guardEntityScopesUsage('resources', 'resource_id');

    expect(queries.tenantUsage.getScopesForResourcesTenantUsage).toHaveBeenCalledWith(tenantId);
  });
});

describe('reportSubscriptionUpdatesUsage', () => {
  beforeEach(() => {
    setEnvFlag('isCloud', true);
    setEnvFlag('isIntegrationTest', false);
    jest.clearAllMocks();
    mockGetTenantSubscription.mockResolvedValue(mockSubscriptionData);
  });

  afterEach(() => {
    setEnvFlag('isCloud', originalIsCloud);
    setEnvFlag('isIntegrationTest', originalIsIntegrationTest);
  });

  it('should skip in non-cloud environment', async () => {
    setEnvFlag('isCloud', false);
    const { queries, cloudConnection, connectors, subscription } = new MockTenant();
    const quotaLibrary = new QuotaLibrary(
      tenantId,
      queries,
      connectors,
      cloudConnection,
      subscription
    );

    await quotaLibrary.reportSubscriptionUpdatesUsage('machineToMachineLimit');

    expect(mockReportSubscriptionUpdates).not.toHaveBeenCalled();
  });

  it('should skip in integration test', async () => {
    setEnvFlag('isIntegrationTest', true);
    const { queries, cloudConnection, connectors, subscription } = new MockTenant();
    const quotaLibrary = new QuotaLibrary(
      tenantId,
      queries,
      connectors,
      cloudConnection,
      subscription
    );

    await quotaLibrary.reportSubscriptionUpdatesUsage('machineToMachineLimit');

    expect(mockReportSubscriptionUpdates).not.toHaveBeenCalled();
  });

  it('should report for Pro plan with add-on usage key', async () => {
    mockGetTenantSubscription.mockResolvedValueOnce({
      ...mockSubscriptionData,
      planId: ReservedPlanId.Pro,
      isEnterprisePlan: false,
    });

    const { queries, cloudConnection, connectors, subscription } = new MockTenant();

    const quotaLibrary = new QuotaLibrary(
      tenantId,
      queries,
      connectors,
      cloudConnection,
      subscription
    );

    await quotaLibrary.reportSubscriptionUpdatesUsage('machineToMachineLimit');

    expect(mockReportSubscriptionUpdates).toHaveBeenCalledWith(
      cloudConnection,
      'machineToMachineLimit'
    );
  });

  it('should report for Enterprise plan with add-on usage key', async () => {
    mockGetTenantSubscription.mockResolvedValueOnce({
      ...mockSubscriptionData,
      planId: 'enterprise-plan',
      isEnterprisePlan: true,
    });

    const { queries, cloudConnection, connectors, subscription } = new MockTenant();

    const quotaLibrary = new QuotaLibrary(
      tenantId,
      queries,
      connectors,
      cloudConnection,
      subscription
    );

    await quotaLibrary.reportSubscriptionUpdatesUsage('resourcesLimit');

    expect(mockReportSubscriptionUpdates).toHaveBeenCalledWith(cloudConnection, 'resourcesLimit');
  });

  it('should not report for Free plan', async () => {
    mockGetTenantSubscription.mockResolvedValueOnce({
      ...mockSubscriptionData,
      planId: ReservedPlanId.Free,
      isEnterprisePlan: false,
    });

    const { queries, cloudConnection, connectors, subscription } = new MockTenant();

    const quotaLibrary = new QuotaLibrary(
      tenantId,
      queries,
      connectors,
      cloudConnection,
      subscription
    );

    await quotaLibrary.reportSubscriptionUpdatesUsage('machineToMachineLimit');

    expect(mockReportSubscriptionUpdates).not.toHaveBeenCalled();
  });

  it('should not report for non-add-on usage key', async () => {
    mockGetTenantSubscription.mockResolvedValueOnce({
      ...mockSubscriptionData,
      planId: ReservedPlanId.Pro,
      isEnterprisePlan: false,
    });

    const { queries, cloudConnection, connectors, subscription } = new MockTenant();

    const quotaLibrary = new QuotaLibrary(
      tenantId,
      queries,
      connectors,
      cloudConnection,
      subscription
    );

    await quotaLibrary.reportSubscriptionUpdatesUsage('applicationsLimit');

    expect(mockReportSubscriptionUpdates).not.toHaveBeenCalled();
  });
});

describe('getTenantUsage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return tenant usage with social connectors count', async () => {
    const { queries, cloudConnection, connectors, subscription } = new MockTenant();

    const usageOverrides = {
      applicationsLimit: 5,
      customJwtEnabled: true,
      collectUserProfileEnabled: true,
      machineToMachineLimit: 4,
      enterpriseSsoLimit: 2,
      mfaEnabled: true,
    };

    const mockRawUsage = { ...defaultRawUsage, ...usageOverrides };

    const mockSocialConnectors = [
      { type: ConnectorType.Social, metadata: { target: 'google' } },
      { type: ConnectorType.Social, metadata: { target: 'facebook' } },
      { type: ConnectorType.Email, metadata: { target: 'email' } },
    ];

    // eslint-disable-next-line @silverhand/fp/no-mutation
    queries.tenantUsage.getRawTenantUsage = jest.fn().mockResolvedValue(mockRawUsage);
    // eslint-disable-next-line @silverhand/fp/no-mutation
    connectors.getLogtoConnectors = jest.fn().mockResolvedValue(mockSocialConnectors);

    const quotaLibrary = new QuotaLibrary(
      tenantId,
      queries,
      connectors,
      cloudConnection,
      subscription
    );

    const result = await quotaLibrary.getTenantUsage();

    expect(result.usage).toMatchObject({
      ...usageOverrides,
      socialConnectorsLimit: 2, // Only social connectors
      subjectTokenEnabled: false, // Always false as per implementation
    });
    expect(queries.tenantUsage.getRawTenantUsage).toHaveBeenCalledWith(tenantId);
    expect(connectors.getLogtoConnectors).toHaveBeenCalled();
  });

  it('should handle empty connectors list', async () => {
    const { queries, cloudConnection, connectors, subscription } = new MockTenant();

    const usageOverrides = {
      applicationsLimit: 3,
      hooksLimit: 2,
      customJwtEnabled: true,
    };

    const mockRawUsage = { ...defaultRawUsage, ...usageOverrides };

    // eslint-disable-next-line @silverhand/fp/no-mutation
    queries.tenantUsage.getRawTenantUsage = jest.fn().mockResolvedValue(mockRawUsage);
    // eslint-disable-next-line @silverhand/fp/no-mutation
    connectors.getLogtoConnectors = jest.fn().mockResolvedValue([]);

    const quotaLibrary = new QuotaLibrary(
      tenantId,
      queries,
      connectors,
      cloudConnection,
      subscription
    );

    const result = await quotaLibrary.getTenantUsage();

    expect(result.usage).toMatchObject({
      ...usageOverrides,
      socialConnectorsLimit: 0,
      subjectTokenEnabled: false,
    });
  });
});
/* eslint-enable max-lines */
