import { ConnectorDto } from '@logto/schemas';

export type ConnectorGroup = Pick<
  ConnectorDto,
  'name' | 'logo' | 'logoDark' | 'target' | 'type' | 'description'
> & {
  id: string;
  enabled: boolean;
  connectors: ConnectorDto[];
};
