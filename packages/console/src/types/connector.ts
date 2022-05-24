import { ConnectorDTO } from '@logto/schemas';

export type ConnectorGroup = Pick<ConnectorDTO, 'name' | 'logo' | 'target' | 'type'> & {
  enabled: boolean;
  connectors: ConnectorDTO[];
};
