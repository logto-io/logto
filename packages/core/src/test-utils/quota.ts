import type { CloudConnectionLibrary } from '#src/libraries/cloud-connection.js';
import type { ConnectorLibrary } from '#src/libraries/connector.js';
import { QuotaLibrary } from '#src/libraries/quota.js';
import type { SubscriptionLibrary } from '#src/libraries/subscription.js';

import { MockQueries } from './tenant.js';

const { jest } = import.meta;

// eslint-disable-next-line @typescript-eslint/consistent-type-assertions, no-restricted-syntax
const mockConnectorLibrary = {
  getConnectorConfig: jest.fn(),
  getLogtoConnectors: jest.fn(),
  getLogtoConnectorsWellKnown: jest.fn(),
  getLogtoConnectorById: jest.fn(),
  getLogtoConnectorByTargetAndPlatform: jest.fn(),
  getMessageConnector: jest.fn(),
  getI18nEmailTemplate: jest.fn(),
} as ConnectorLibrary;

// eslint-disable-next-line no-restricted-syntax
const mockCloudConnectionLibrary = {
  getCloudConnectionData: jest.fn(),
  getAccessToken: jest.fn(),
  getClient: jest.fn(),
} as unknown as CloudConnectionLibrary;

// eslint-disable-next-line no-restricted-syntax
const mockSubscriptionLibrary = {
  getSubscriptionData: jest.fn(),
  getTenantTokenUsage: jest.fn(),
} as unknown as SubscriptionLibrary;

class MockQuotaLibrary extends QuotaLibrary {
  constructor() {
    super({
      tenantId: 'mock-tenant-id',
      queries: new MockQueries(),
      connectorLibrary: mockConnectorLibrary,
      cloudConnection: mockCloudConnectionLibrary,
      subscription: mockSubscriptionLibrary,
    });
  }

  // Override the methods with jest mock functions
  // eslint-disable-next-line @typescript-eslint/member-ordering
  guardTenantUsageByKey = jest.fn();
  // eslint-disable-next-line @typescript-eslint/member-ordering
  guardEntityScopesUsage = jest.fn();
  // eslint-disable-next-line @typescript-eslint/member-ordering
  reportSubscriptionUpdatesUsage = jest.fn();
}

export const createMockQuotaLibrary = (): QuotaLibrary => {
  return new MockQuotaLibrary();
};
