import { ConnectorPlatform } from '@logto/connector-types';
import { Connector } from '@logto/schemas';

import { buildIndexWithTargetAndPlatform, getConnectorConfig } from '.';

const connectors: Connector[] = [
  {
    id: 'id',
    target: 'target',
    platform: null,
    enabled: true,
    config: { foo: 'bar' },
    createdAt: 0,
  },
];

const findAllConnectors = jest.fn(async () => connectors);

jest.mock('@/queries/connector', () => ({
  ...jest.requireActual('@/queries/connector'),
  findAllConnectors: async () => findAllConnectors(),
}));

it('buildIndexWithTargetAndPlatform() with not-null `platform`', async () => {
  expect(buildIndexWithTargetAndPlatform('target', ConnectorPlatform.Web)).toEqual('target_Web');
});

it('buildIndexWithTargetAndPlatform() with null `platform`', async () => {
  expect(buildIndexWithTargetAndPlatform('target', null)).toEqual('target_null');
});

it('getConnectorConfig()', async () => {
  const config = await getConnectorConfig('target', null);
  expect(config).toMatchObject({ foo: 'bar' });
});
