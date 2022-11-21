import type { Connector } from '@logto/schemas';

import RequestError from '#src/errors/RequestError/index.js';

import { getConnectorConfig } from './index.js';

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

jest.mock('#src/queries/connector.js', () => ({
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
