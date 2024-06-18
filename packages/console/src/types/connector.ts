import type { ConnectorResponse, JsonObject } from '@logto/schemas';
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
  /** The raw config data in JSON string. Used for code editor. */
  jsonConfig: string;
  /** The form config data. Used for form rendering. */
  formConfig: Record<string, unknown>;
  /** The raw config data. */
  rawConfig: JsonObject;
};
