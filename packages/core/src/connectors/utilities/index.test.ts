import { ConnectorPlatform } from '@logto/connector-types';

import { findConnectorByTargetAndPlatform, updateConnector } from '@/queries/connector';

import { buildIndexWithTargetAndPlatform, getConnectorConfig, updateConnectorConfig } from '.';

jest.mock('@/queries/connector');

it('buildIndexWithTargetAndPlatform() with not-null `platform`', async () => {
  expect(buildIndexWithTargetAndPlatform('target', ConnectorPlatform.Web)).toEqual('target_Web');
});

it('buildIndexWithTargetAndPlatform() with null `platform`', async () => {
  expect(buildIndexWithTargetAndPlatform('target', null)).toEqual('target_null');
});

it('getConnectorConfig()', async () => {
  (
    findConnectorByTargetAndPlatform as jest.MockedFunction<typeof findConnectorByTargetAndPlatform>
  ).mockResolvedValueOnce({
    id: 'id',
    target: 'target',
    platform: null,
    enabled: true,
    config: { foo: 'bar' },
    createdAt: 0,
  });
  const config = await getConnectorConfig('target', null);
  expect(config).toMatchObject({ foo: 'bar' });
});

it('updateConnectorConfig() should call updateConnector()', async () => {
  await updateConnectorConfig({ target: 'connectorId', platform: null }, { foo: 'bar' });
  expect(updateConnector).toHaveBeenCalledWith({
    where: { target: 'connectorId', platform: null },
    set: { config: { foo: 'bar' } },
  });
});
