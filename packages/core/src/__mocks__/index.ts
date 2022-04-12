import {
  Application,
  ApplicationDTO,
  ApplicationType,
  Passcode,
  PasscodeType,
  Resource,
  Role,
  Setting,
  SnakeCaseOidcConfig,
  UserLog,
  UserLogResult,
  UserLogType,
} from '@logto/schemas';
import camelcaseKeys from 'camelcase-keys';

export * from './connector';
export * from './sign-in-experience';
export * from './user';

export const mockOidcConfig: SnakeCaseOidcConfig = {
  authorization_endpoint: 'https://logto.dev/oidc/auth',
  userinfo_endpoint: 'https://logto.dev/oidc/userinfo',
  token_endpoint: 'https://logto.dev/oidc/token',
};

export const mockApplication: Application = {
  id: 'foo',
  name: 'foo',
  type: ApplicationType.SPA,
  description: null,
  oidcClientMetadata: {
    redirectUris: [],
    postLogoutRedirectUris: [],
  },
  customClientMetadata: {
    corsAllowedOrigins: ['http://localhost:3000', 'http://localhost:3001', 'https://logto.dev'],
    idTokenTtl: 5000,
    refreshTokenTtl: 6_000_000,
  },
  createdAt: 1_645_334_775_356,
};

export const mockApplicationDTO: ApplicationDTO = {
  ...mockApplication,
  oidcConfig: camelcaseKeys(mockOidcConfig),
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
