import { ConnectorDTO } from '@logto/schemas';

export type ConnectorGroup = Pick<ConnectorDTO['metadata'], 'name' | 'logo' | 'target' | 'type'> & {
  enabled: boolean;
  connectors: ConnectorDTO[];
};
