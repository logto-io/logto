import { mockConnectorList } from '@/__mocks__';
import type { LogtoConnector, LoadConnector } from '@/connectors/types';

import { getLogtoConnectors } from '.';
import {
  mockLoadConnectorList,
  mockConnector0,
  mockConnector1,
  mockConnector2,
  mockConnector3,
  mockConnector4,
  mockConnector5,
  mockConnector6,
  mockLoadConnector0,
  mockLoadConnector1,
  mockLoadConnector2,
  mockLoadConnector3,
  mockMetadata0,
  mockMetadata1,
  mockMetadata2,
  mockMetadata3,
} from './mock';

const findAllConnectors = jest.fn(async () => mockConnectorList);

jest.mock('@/queries/connector', () => ({
  ...jest.requireActual('@/queries/connector'),
  findAllConnectors: async () => findAllConnectors(),
}));

const loadConnectorsPlaceHolder = jest.fn() as jest.MockedFunction<() => Promise<LoadConnector[]>>;
jest.mock('.', () => ({
  ...jest.requireActual('.'),
  loadConnectors: async () => loadConnectorsPlaceHolder(),
}));

it('getLogtoConnectors() should return all logtoConnectors', async () => {
  loadConnectorsPlaceHolder.mockResolvedValueOnce(mockLoadConnectorList);
  const logtoConnectors: LogtoConnector[] = await getLogtoConnectors();
  expect(logtoConnectors).toMatchObject([
    { ...mockLoadConnector0, metadata: mockMetadata0, dbEntry: mockConnector0 },
    { ...mockLoadConnector1, metadata: mockMetadata1, dbEntry: mockConnector1 },
    { ...mockLoadConnector2, metadata: mockMetadata2, dbEntry: mockConnector2 },
    { ...mockLoadConnector3, metadata: mockMetadata3, dbEntry: mockConnector3 },
    {
      ...mockLoadConnector2,
      metadata: { ...mockMetadata2, target: 'target4', logo: 'logo4', logoDark: 'logoDark4' },
      dbEntry: mockConnector4,
    },
    { ...mockLoadConnector3, metadata: mockMetadata3, dbEntry: mockConnector5 },
    { ...mockLoadConnector3, metadata: mockMetadata3, dbEntry: mockConnector6 },
  ]);
});
