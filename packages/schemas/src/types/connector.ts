import type { BaseConnector, ConnectorMetadata, ConnectorType } from '@logto/connector-kit';

import type { Connector } from '../db-entries/index.js';

export type { ConnectorMetadata } from '@logto/connector-kit';
export { ConnectorType, ConnectorPlatform } from '@logto/connector-kit';

export type ConnectorResponse = Omit<Connector, 'metadata'> &
  Omit<BaseConnector<ConnectorType>, 'configGuard' | 'metadata'> &
  ConnectorMetadata;
