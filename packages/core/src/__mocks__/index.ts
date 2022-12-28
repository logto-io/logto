import { VerificationCodeType } from '@logto/connector-kit';
import type { Application, Passcode, Resource, Role, Setting } from '@logto/schemas';
import { ApplicationType } from '@logto/schemas';

export * from './connector.js';
export * from './sign-in-experience.js';
export * from './user.js';

export const mockApplication: Application = {
  id: 'foo',
  secret: 'randomId',
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
  roleNames: [],
  createdAt: 1_645_334_775_356,
};

export const mockResource: Resource = {
  id: 'logto_api',
  name: 'management api',
  indicator: 'logto.dev/api',
  accessTokenTtl: 3600,
};

export const mockRole: Role = {
  id: 'role_id',
  name: 'admin',
  description: 'admin',
};

export const mockSetting: Setting = {
  id: 'foo setting',
  adminConsole: {
    demoChecked: false,
    applicationCreated: false,
    signInExperienceCustomized: false,
    passwordlessConfigured: false,
    socialSignInConfigured: false,
    furtherReadingsChecked: false,
  },
};

export const mockPasscode: Passcode = {
  id: 'foo',
  interactionJti: 'jti',
  phone: '888 888 8888',
  email: 'foo@logto.io',
  type: VerificationCodeType.SignIn,
  code: 'asdfghjkl',
  consumed: false,
  tryCount: 2,
  createdAt: 10,
};
