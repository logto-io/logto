import { createMockUtils } from '@logto/shared/esm';

import { mockFreePlan } from '#src/__mocks__/subscription.js';
import { createMockCloudConnectionLibrary } from '#src/test-utils/cloud-connection.js';
import { createMockConnectorLibrary } from '#src/test-utils/connectors.js';

const { jest } = import.meta;
const { mockEsmWithActual } = createMockUtils(jest);

const { getTenantSubscriptionPlan } = await mockEsmWithActual(
  '#src/utils/subscription/index.js',
  () => ({
    getTenantSubscriptionPlan: jest.fn().mockResolvedValue(mockFreePlan),
  })
);

const cloudConnection = createMockCloudConnectionLibrary();
const connectors = createMockConnectorLibrary();

const { MockQueries } = await import('#src/test-utils/tenant.js');
const { createQuotaLibrary } = await import('./quota.js');

const countNonM2mApplications = jest.fn();
const queries = new MockQueries({
  applications: { countNonM2mApplications },
});

describe('guardKey()', () => {
  afterEach(() => {
    getTenantSubscriptionPlan.mockClear();
  });

  const { guardKey } = createQuotaLibrary(queries, cloudConnection, connectors);

  it('should pass when limit is not exeeded', async () => {
    countNonM2mApplications.mockResolvedValueOnce({ count: 0 });

    await expect(guardKey('applicationsLimit')).resolves.not.toThrow();
  });

  it('should throw when limit is exeeded', async () => {
    countNonM2mApplications.mockResolvedValueOnce({ count: mockFreePlan.quota.applicationsLimit });

    await expect(guardKey('applicationsLimit')).rejects.toThrow();
  });
});
