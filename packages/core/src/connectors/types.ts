import { ConnectorType } from '@logto/schemas';

export interface ConnectorMetadata {
  id: string;
  type: ConnectorType;
  name: Record<string, string>;
  logo: string;
  description: Record<string, string>;
}

// The name `Connector` is used for database, use `ConnectorInstance` to avoid confusing.
export interface ConnectorInstance {
  metadata: ConnectorMetadata;
}
