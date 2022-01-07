import { ConnectorType } from '@logto/schemas';

export interface ConnectorMetadata {
  id: string;
  type: ConnectorType;
  name: string;
  logo: string;
  description: string;
}

// The name `Connector` is used for database, use `ConnectorInstance` to avoid confusing.
export interface ConnectorInstance {
  metadata: ConnectorMetadata;
}
