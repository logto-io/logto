import type { ConnectorResponse } from '@logto/schemas';
import { type Nullable } from '@silverhand/essentials';

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
  name?: string;
  logo?: string;
  logoDark?: Nullable<string>;
  target?: string;
  syncProfile: SyncProfileMode;
  jsonConfig: string; // Support editing configs by the code editor
  formConfig: Record<string, unknown>; // Support custom connector config form
};
