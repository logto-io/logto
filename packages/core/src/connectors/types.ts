import { Languages } from '@logto/phrases';
import { ConnectorType } from '@logto/schemas';

export interface ConnectorMetadata {
  id: string;
  type: ConnectorType;
  name: Record<Languages, string>;
  logo: string;
  description: Record<Languages, string>;
}

// The name `Connector` is used for database, use `ConnectorInstance` to avoid confusing.
export interface ConnectorInstance {
  metadata: ConnectorMetadata;
}
