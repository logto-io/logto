import { ConnectorDTO } from '@logto/schemas';

export type ConnectorGroup = Pick<ConnectorDTO, 'name' | 'logo' | 'target' | 'type'> & {
  id: string;
  enabled: boolean;
  connectors: ConnectorDTO[];
};
