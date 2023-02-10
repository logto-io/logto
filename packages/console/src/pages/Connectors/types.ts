export type ConnectorFormType = {
  config: string;
  name: string;
  logo: string;
  logoDark: string;
  target: string;
  syncProfile: SyncProfileMode;
} & Record<string, unknown>; // Extend custom connector config form

export enum SyncProfileMode {
  OnlyAtRegister = 'OnlyAtRegister',
  EachSignIn = 'EachSignIn',
}
