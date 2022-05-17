import { ConnectorDTO } from '@logto/schemas';

export type ConnectorGroup = Pick<ConnectorDTO['metadata'], 'name' | 'logo' | 'target'> & {
  enabled: boolean;
  connectors: ConnectorDTO[];
};
