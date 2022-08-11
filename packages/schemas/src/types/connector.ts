import { ConnectorMetadata } from '@logto/connector-schemas';

import { Connector } from '../db-entries';

export type { ConnectorMetadata } from '@logto/connector-schemas';
export { ConnectorType, ConnectorPlatform } from '@logto/connector-schemas';

export type ConnectorDto = Connector & ConnectorMetadata;
