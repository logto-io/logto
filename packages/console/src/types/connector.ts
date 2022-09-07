import { ConnectorResponse } from '@logto/schemas';

export type ConnectorGroup = Pick<
  ConnectorResponse,
  'name' | 'logo' | 'logoDark' | 'target' | 'type' | 'description'
> & {
  id: string;
  enabled: boolean;
  connectors: ConnectorResponse[];
};
