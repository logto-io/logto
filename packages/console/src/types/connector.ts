import { ConnectorDTO } from '@logto/schemas';

export type ConnectorGroup = Pick<
  ConnectorDTO,
  'name' | 'logo' | 'logoDark' | 'target' | 'type' | 'description'
> & {
  id: string;
  enabled: boolean;
  connectors: ConnectorDTO[];
};
