import { BaseConnector, ConnectorMetadata, ConnectorType } from '@logto/connector-kit';

import { Connector } from '../db-entries';

export type { ConnectorMetadata } from '@logto/connector-kit';
export { ConnectorType, ConnectorPlatform } from '@logto/connector-kit';

export type ConnectorResponse = Connector &
  Omit<BaseConnector<ConnectorType>, 'configGuard' | 'metadata'> &
  ConnectorMetadata;
