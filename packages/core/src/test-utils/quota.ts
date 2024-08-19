import { type QuotaLibrary } from '#src/libraries/quota.js';

const { jest } = import.meta;

export const createMockQuotaLibrary = (): QuotaLibrary => {
  return {
    guardTenantUsageByKey: jest.fn(),
    guardEntityScopesUsage: jest.fn(),
    reportSubscriptionUpdatesUsage: jest.fn(),
  };
};
