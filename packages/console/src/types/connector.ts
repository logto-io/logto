import { ConnectorDTO } from '@logto/schemas';

export type ConnectorGroup = Pick<
  ConnectorDTO,
  'name' | 'logo' | 'target' | 'type' | 'description'
> & {
  id: string;
  enabled: boolean;
  connectors: ConnectorDTO[];
};
