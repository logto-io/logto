import {
  Application,
  ApplicationType,
  Passcode,
  PasscodeType,
  Resource,
  Role,
  Setting,
  UserLog,
  UserLogResult,
  UserLogType,
} from '@logto/schemas';

export * from './connector';
export * from './sign-in-experience';
export * from './user';

export const mockApplication: Application = {
  id: 'foo',
  name: 'foo',
  type: ApplicationType.SPA,
  description: null,
  oidcClientMetadata: {
    redirectUris: [],
    postLogoutRedirectUris: [],
  },
  customClientMetadata: {},
  createdAt: 1_645_334_775_356,
};

export const mockResource: Resource = {
  id: 'logto_api',
  name: 'management api',
  indicator: 'logto.dev/api',
  accessTokenTtl: 3600,
};

export const mockRole: Role = {
  name: 'admin',
  description: 'admin',
};

export const mockSetting: Setting = {
  id: 'foo setting',
  customDomain: 'mock-logto.dev',
  adminConsole: {},
};

export const mockPasscode: Passcode = {
  id: 'foo',
  interactionJti: 'jti',
  phone: '888 888 8888',
  email: 'foo@logto.io',
  type: PasscodeType.SignIn,
  code: 'asdfghjkl',
  consumed: false,
  tryCount: 2,
  createdAt: 10,
};

export const mockUserLog: UserLog = {
  id: 'foo',
  userId: 'foo',
  type: UserLogType.RegisterEmail,
  result: UserLogResult.Success,
  payload: {},
  createdAt: 10,
};
