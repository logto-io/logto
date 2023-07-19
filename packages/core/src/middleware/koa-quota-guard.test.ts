import { GlobalValues } from '@logto/shared';
import { createMockUtils } from '@logto/shared/esm';
import { type Context } from 'koa';

import { mockFreePlan } from '#src/__mocks__/subscription.js';
import { createMockCloudConnectionLibrary } from '#src/test-utils/cloud-connection.js';
import createMockContext from '#src/test-utils/jest-koa-mocks/create-mock-context.js';
import { MockQueries } from '#src/test-utils/tenant.js';

const { jest } = import.meta;

const { mockEsmWithActual } = createMockUtils(jest);

const getValues = jest.fn(() => ({
  ...new GlobalValues(),
  isCloud: true,
}));

await mockEsmWithActual('#src/env-set/index.js', () => ({
  EnvSet: {
    get values() {
      return getValues();
    },
  },
}));

const { getTenantSubscriptionPlan } = await mockEsmWithActual(
  '#src/utils/subscription/index.js',
  () => ({
    getTenantSubscriptionPlan: jest.fn().mockResolvedValue(mockFreePlan),
  })
);

const { default: koaQuotaGuard } = await import('./koa-quota-guard.js');

const createContext = (): Context => {
  return createMockContext();
};

const countNonM2MApplications = jest.fn();
const queries = new MockQueries({
  applications: { countNonM2MApplications },
});

const cloudConnection = createMockCloudConnectionLibrary();

describe('koaQuotaGuard() middleware', () => {
  afterEach(() => {
    getTenantSubscriptionPlan.mockClear();
    getValues.mockReturnValue({
      ...new GlobalValues(),
      isCloud: true,
    });
  });

  it('should skip on non-cloud', async () => {
    getValues.mockReturnValueOnce({
      ...new GlobalValues(),
      isCloud: false,
    });

    const ctx = createContext();
    await koaQuotaGuard({
      key: 'applicationsLimit',
      queries,
      cloudConnection,
    })(ctx, jest.fn());

    expect(getTenantSubscriptionPlan).not.toHaveBeenCalled();
  });

  it('should pass when limit is not exeeded', async () => {
    countNonM2MApplications.mockResolvedValueOnce(0);

    const ctx = createContext();
    await expect(
      koaQuotaGuard({
        key: 'applicationsLimit',
        queries,
        cloudConnection,
      })(ctx, jest.fn())
    ).resolves.not.toThrow();
  });

  it('should throw when limit is exeeded', async () => {
    countNonM2MApplications.mockResolvedValueOnce(mockFreePlan.quota.applicationsLimit);

    const ctx = createContext();
    await expect(
      koaQuotaGuard({
        key: 'applicationsLimit',
        queries,
        cloudConnection,
      })(ctx, jest.fn())
    ).rejects.toThrow();
  });
});
