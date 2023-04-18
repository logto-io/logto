import type { ConnectorResponse as RawConnectorResponse } from '@logto/schemas';

// To avoid "Error TS2589: Type instantiation is excessively deep and possibly infinite." error since JsonObject is a recursive type.
export type ConnectorResponse = Omit<RawConnectorResponse, 'config'> & {
  config: Record<string, unknown>;
};

export type ConnectorGroup<T = ConnectorResponse> = Pick<
  ConnectorResponse,
  'name' | 'logo' | 'logoDark' | 'target' | 'type' | 'description' | 'isStandard' | 'isDemo'
> & {
  id: string;
  connectors: T[];
};
