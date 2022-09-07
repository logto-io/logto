import { BaseConnector, ConnectorMetadata, ConnectorType } from '@logto/connector-core';

import { Connector } from '../db-entries';

export type { ConnectorMetadata } from '@logto/connector-core';
export { ConnectorType, ConnectorPlatform } from '@logto/connector-core';

export type ConnectorResponse = Connector &
  Omit<BaseConnector<ConnectorType>, 'configGuard' | 'metadata'> &
  ConnectorMetadata;
