import type { Connector } from '@logto/schemas';
import { createMockUtils } from '@logto/shared/esm';

import RequestError from '#src/errors/RequestError/index.js';

const { jest } = import.meta;
const { mockEsmWithActual } = createMockUtils(jest);

const connectors: Connector[] = [
  {
    id: 'id',
    config: { foo: 'bar' },
    createdAt: 0,
    syncProfile: false,
    connectorId: 'id',
    metadata: {},
  },
];

await mockEsmWithActual('#src/queries/connector.js', () => ({
  findAllConnectors: jest.fn(async () => connectors),
}));

const { getConnectorConfig } = await import('./connector.js');

it('getConnectorConfig() should return right config', async () => {
  const config = await getConnectorConfig('id');
  expect(config).toMatchObject({ foo: 'bar' });
});

it('getConnectorConfig() should throw error if connector not found', async () => {
  await expect(getConnectorConfig('not-found')).rejects.toMatchError(
    new RequestError({ code: 'entity.not_found', id: 'not-found', status: 404 })
  );
});
