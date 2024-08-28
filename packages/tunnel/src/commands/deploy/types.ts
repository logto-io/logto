export type DeployCommandArgs = {
  endpoint?: string;
  'experience-path'?: string;
  'config-path'?: string;
  'app-id'?: string;
  'app-secret'?: string;
  verbose: boolean;
};

export type StorageKey = 'accessToken' | 'expiresAt';

export type Config = {
  [key in StorageKey]?: string;
};
