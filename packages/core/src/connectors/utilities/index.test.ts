import { ConnectorPlatform } from '@logto/connector-types';
import { ConnectorType } from '@logto/schemas';

import { mockMetadata } from '@/__mocks__';
import { findConnectorById, updateConnector } from '@/queries/connector';

import { getConnectorConfig, updateConnectorConfig } from '.';

jest.mock('@/queries/connector');

it('getConnectorConfig()', async () => {
  (findConnectorById as jest.MockedFunction<typeof findConnectorById>).mockResolvedValueOnce({
    id: 'id',
    name: 'name',
    platform: ConnectorPlatform.NA,
    type: ConnectorType.Social,
    enabled: true,
    config: { foo: 'bar' },
    metadata: mockMetadata,
    createdAt: 0,
  });
  const config = await getConnectorConfig('connectorId');
  expect(config).toMatchObject({ foo: 'bar' });
});

it('updateConnectorConfig() should call updateConnector()', async () => {
  await updateConnectorConfig('connectorId', { foo: 'bar' });
  expect(updateConnector).toHaveBeenCalled();
});
