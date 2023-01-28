import type { Connector } from '@logto/schemas';

import RequestError from '#src/errors/RequestError/index.js';
import { MockQueries } from '#src/test-utils/tenant.js';

const connectors: Connector[] = [
  {
    tenantId: 'fake_tenant',
    id: 'id',
    config: { foo: 'bar' },
    createdAt: 0,
    syncProfile: false,
    connectorId: 'id',
    metadata: {},
  },
];

const { createConnectorLibrary } = await import('./connector.js');
const { getConnectorConfig } = createConnectorLibrary(
  new MockQueries({ connectors: { findAllConnectors: async () => connectors } })
);

it('getConnectorConfig() should return right config', async () => {
  const config = await getConnectorConfig('id');
  expect(config).toMatchObject({ foo: 'bar' });
});

it('getConnectorConfig() should throw error if connector not found', async () => {
  await expect(getConnectorConfig('not-found')).rejects.toMatchError(
    new RequestError({ code: 'entity.not_found', id: 'not-found', status: 404 })
  );
});
