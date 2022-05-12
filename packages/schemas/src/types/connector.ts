import { ConnectorMetadata } from '@logto/connector-types';

import { Connector } from '../db-entries';

export type { ConnectorMetadata } from '@logto/connector-types';
export { ConnectorType, ConnectorPlatform } from '@logto/connector-types';

export interface ConnectorDTO extends Connector {
  metadata: ConnectorMetadata;
}
