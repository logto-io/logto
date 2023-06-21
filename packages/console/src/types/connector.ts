import type { ConnectorResponse } from '@logto/schemas';

export type ConnectorGroup<T = ConnectorResponse> = Pick<
  ConnectorResponse,
  'name' | 'logo' | 'logoDark' | 'target' | 'type' | 'description' | 'isStandard' | 'isDemo'
> & {
  id: string;
  connectors: T[];
};

export enum SyncProfileMode {
  OnlyAtRegister = 'OnlyAtRegister',
  EachSignIn = 'EachSignIn',
}

export type ConnectorFormType = {
  config: string;
  name: string;
  logo: string;
  logoDark: string;
  target: string;
  syncProfile: SyncProfileMode;
} & Record<string, unknown>; // Extend custom connector config form
