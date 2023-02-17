import type { BaseConnector, ConnectorMetadata, ConnectorType } from '@logto/connector-kit';

import type { Connector } from '../db-entries/index.js';

export type { ConnectorMetadata } from '@logto/connector-kit';
export { ConnectorType, ConnectorPlatform } from '@logto/connector-kit';

// Omit `storage` column since it was not used in AC and will cause AC type error (because it's a nested type).
export type ConnectorResponse = Omit<Connector, 'storage'> &
  Omit<BaseConnector<ConnectorType>, 'configGuard' | 'metadata'> &
  ConnectorMetadata;

export type ConnectorFactoryResponse = Omit<
  BaseConnector<ConnectorType>,
  'configGuard' | 'metadata'
> &
  ConnectorMetadata;
