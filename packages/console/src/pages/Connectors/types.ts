export type ConnectorFormType = {
  config: string;
  name: string;
  logo: string;
  logoDark: string;
  target: string;
  syncProfile: SyncProfileMode;
};

export enum SyncProfileMode {
  OnlyAtRegister = 'OnlyAtRegister',
  EachSignIn = 'EachSignIn',
}
