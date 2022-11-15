import type { Connector } from '@logto/schemas';

import RequestError from '@/errors/RequestError';

import { getConnectorConfig } from '.';

const connectors: Connector[] = [
  {
    id: 'id',
    enabled: true,
    config: { foo: 'bar' },
    createdAt: 0,
    syncProfile: false,
    connectorId: 'id',
    metadata: {},
  },
];

const findAllConnectors = jest.fn(async () => connectors);

jest.mock('@/queries/connector', () => ({
  ...jest.requireActual('@/queries/connector'),
  findAllConnectors: async () => findAllConnectors(),
}));

it('getConnectorConfig() should return right config', async () => {
  const config = await getConnectorConfig('id');
  expect(config).toMatchObject({ foo: 'bar' });
});

it('getConnectorConfig() should throw error if connector not found', async () => {
  await expect(getConnectorConfig('not-found')).rejects.toMatchError(
    new RequestError({ code: 'entity.not_found', id: 'not-found', status: 404 })
  );
});
