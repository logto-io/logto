import type { Connector } from '@logto/schemas';
import { ConnectorType } from '@logto/schemas';
import { any } from 'zod';

import {
  mockConnector0,
  mockConnector1,
  mockConnector2,
  mockConnector3,
  mockConnector4,
  mockConnector5,
  mockConnector6,
  mockMetadata0,
  mockMetadata1,
  mockMetadata2,
  mockMetadata3,
} from '@/__mocks__';

import type { LoadConnector } from './types';

export {
  mockConnector0,
  mockConnector1,
  mockConnector2,
  mockConnector3,
  mockConnector4,
  mockConnector5,
  mockConnector6,
  mockMetadata0,
  mockMetadata1,
  mockMetadata2,
  mockMetadata3,
} from '@/__mocks__';

export const mockConnectorList: Connector[] = [
  mockConnector0,
  mockConnector1,
  mockConnector2,
  mockConnector3,
  {
    ...mockConnector4,
    connectorId: mockMetadata2.id,
    metadata: { target: 'target4', logo: 'logo4', logoDark: 'logoDark4' },
  },
  { ...mockConnector5, connectorId: mockMetadata3.id },
  { ...mockConnector6, connectorId: mockMetadata3.id },
];

export const mockDefaultLoadConnector = {
  getAuthorizationUri: jest.fn(),
  getUserInfo: jest.fn(),
  sendMessage: jest.fn(),
  validateConfig: jest.fn(),
  configGuard: any(),
  type: ConnectorType.Social,
};

export const mockLoadConnector0: LoadConnector = {
  ...mockDefaultLoadConnector,
  metadata: mockMetadata0,
};

export const mockLoadConnector1: LoadConnector = {
  ...mockDefaultLoadConnector,
  metadata: mockMetadata1,
};

export const mockLoadConnector2: LoadConnector = {
  ...mockDefaultLoadConnector,
  metadata: mockMetadata2,
};

export const mockLoadConnector3: LoadConnector = {
  ...mockDefaultLoadConnector,
  metadata: mockMetadata3,
};

export const mockLoadConnectorList: LoadConnector[] = [
  mockLoadConnector0,
  mockLoadConnector1,
  mockLoadConnector2,
  mockLoadConnector3,
];
