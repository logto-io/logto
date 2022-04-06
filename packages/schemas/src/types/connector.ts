import { Languages } from '@logto/phrases';

import { Connector, ConnectorType } from '../db-entries';

export interface ConnectorMetadata {
  id: string;
  type: ConnectorType;
  name: Record<Languages, string>;
  logo: string;
  description: Record<Languages, string>;
  readme: string;
}
export interface ConnectorDTO extends Connector {
  metadata: ConnectorMetadata;
}
