import { type QuotaLibrary } from '#src/libraries/quota.js';

const { jest } = import.meta;

export const createMockQuotaLibrary = (): QuotaLibrary => {
  return {
    guardKey: jest.fn(),
    guardTenantUsageByKey: jest.fn(),
    guardEntityScopesUsage: jest.fn(),
  };
};
