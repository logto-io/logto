import type { BaseConnector, ConnectorMetadata, ConnectorType } from '@logto/connector-kit';

import type { Connector } from '../db-entries/index.js';

export type { ConnectorMetadata } from '@logto/connector-kit';
export { ConnectorType, ConnectorPlatform } from '@logto/connector-kit';

// `storage` is used for BE only and should not be exposed to FE.
export type ConnectorResponse = Pick<
  Connector,
  'id' | 'syncProfile' | 'config' | 'metadata' | 'connectorId'
> &
  Omit<BaseConnector<ConnectorType>, 'configGuard' | 'metadata'> &
  ConnectorMetadata;

export type ConnectorFactoryResponse = Omit<
  BaseConnector<ConnectorType>,
  'configGuard' | 'metadata'
> &
  ConnectorMetadata;
