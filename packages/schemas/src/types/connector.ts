import { Languages } from '@logto/phrases';

import { Connector } from '../db-entries';

export enum ConnectorType {
  SMS = 'SMS',
  Email = 'Email',
  Social = 'Social',
}
export interface ConnectorMetadata {
  id: string;
  type: ConnectorType;
  name: Record<Languages, string>;
  logo: string;
  description: Record<Languages, string>;
}
export interface ConnectorDTO extends Connector {
  metadata: ConnectorMetadata;
}
