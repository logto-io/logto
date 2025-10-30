import type { CloudConnectionLibrary } from '#src/libraries/cloud-connection.js';
import type { ConnectorLibrary } from '#src/libraries/connector.js';
import { QuotaLibrary } from '#src/libraries/quota.js';
import type { SubscriptionLibrary } from '#src/libraries/subscription.js';

import { MockQueries } from './tenant.js';

const { jest } = import.meta;

class MockQuotaLibrary extends QuotaLibrary {
  constructor() {
    super(
      'mock-tenant-id',
      new MockQueries(),
      // eslint-disable-next-line no-restricted-syntax
      {} as ConnectorLibrary,
      // eslint-disable-next-line no-restricted-syntax
      {} as CloudConnectionLibrary,
      // eslint-disable-next-line no-restricted-syntax
      {} as SubscriptionLibrary
    );
  }

  // Override the methods with jest mock functions
  // eslint-disable-next-line @typescript-eslint/member-ordering
  guardTenantUsageByKey = jest.fn();
  // eslint-disable-next-line @typescript-eslint/member-ordering
  reportSubscriptionUpdatesUsage = jest.fn();
}

export const createMockQuotaLibrary = (): QuotaLibrary => {
  return new MockQuotaLibrary();
};
