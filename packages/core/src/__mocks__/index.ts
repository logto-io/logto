import { TemplateType } from '@logto/connector-kit';
import type {
  AdminConsoleData,
  Application,
  ApplicationsRole,
  LogtoConfig,
  OidcConfigKey,
  Passcode,
  Resource,
  Role,
  Scope,
  UsersRole,
} from '@logto/schemas';
import {
  ApplicationType,
  DomainStatus,
  internalPrefix,
  LogtoJwtTokenKey,
  LogtoOidcConfigKey,
  RoleType,
} from '@logto/schemas';

import { protectedAppSignInCallbackUrl } from '#src/constants/index.js';
import { mockId } from '#src/test-utils/nanoid.js';

export * from './cloud-connection.js';
export * from './connector.js';
export * from './domain.js';
export * from './protected-app.js';
export * from './sign-in-experience.js';
export * from './sso.js';
export * from './user.js';

export const mockApplication: Application = {
  tenantId: 'fake_tenant',
  id: 'foo',
  secret: internalPrefix + mockId,
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
  protectedAppMetadata: null,
  isThirdParty: false,
  createdAt: 1_645_334_775_356,
  customData: {},
};

export const mockProtectedApplication: Omit<Application, 'protectedAppMetadata'> & {
  protectedAppMetadata: NonNullable<Application['protectedAppMetadata']>;
} = {
  tenantId: 'fake_tenant',
  id: 'mock-protected-app',
  secret: mockId,
  name: 'mock-protected-app',
  type: ApplicationType.Protected,
  description: null,
  oidcClientMetadata: {
    redirectUris: [`https://mock.protected.dev/${protectedAppSignInCallbackUrl}`],
    postLogoutRedirectUris: ['https://mock.protected.dev'],
  },
  customClientMetadata: {
    corsAllowedOrigins: ['http://localhost:3000', 'http://localhost:3001', 'https://logto.dev'],
    idTokenTtl: 5000,
    refreshTokenTtl: 6_000_000,
  },
  protectedAppMetadata: {
    host: 'mock.protected.dev',
    origin: 'https://my-blog.com',
    sessionDuration: 1_209_600,
    pageRules: [],
  },
  isThirdParty: false,
  createdAt: 1_645_334_775_356,
  customData: {},
};

export const mockCustomDomain = {
  domain: 'mock.blog.com',
  status: DomainStatus.PendingVerification,
  errorMessage: null,
  dnsRecords: [],
  cloudflareData: {
    id: 'cloudflare-id',
    status: 'active',
    ssl: {
      status: 'active',
    },
  },
};

export const mockResource: Resource = {
  tenantId: 'fake_tenant',
  id: 'logto_api',
  name: 'management api',
  indicator: 'logto.dev/api',
  accessTokenTtl: 3600,
  isDefault: false,
};

export const mockScope: Scope = {
  tenantId: 'fake_tenant',
  id: 'scope_id',
  name: 'read:users',
  description: 'read users',
  resourceId: mockResource.id,
  createdAt: 1_645_334_775_356,
};

export const mockScopeWithResource = {
  ...mockScope,
  resource: mockResource,
};

export const mockAdminApplicationRole: Role = {
  tenantId: 'fake_tenant',
  id: 'role_id',
  name: 'admin',
  description: 'admin application',
  type: RoleType.MachineToMachine,
  isDefault: false,
};

export const mockAdminUserRole: Role = {
  tenantId: 'fake_tenant',
  id: 'role_id',
  name: 'admin',
  description: 'admin',
  type: RoleType.User,
  isDefault: false,
};

export const mockAdminUserRole2: Role = {
  tenantId: 'fake_tenant',
  id: 'role_id2',
  name: 'admin2',
  description: 'admin2',
  type: RoleType.User,
  isDefault: false,
};

export const mockAdminUserRole3: Role = {
  tenantId: 'fake_tenant',
  id: 'role_id3',
  name: 'admin3',
  description: 'admin3',
  type: RoleType.MachineToMachine,
  isDefault: false,
};

export const mockAdminConsoleData: AdminConsoleData = {
  signInExperienceCustomized: false,
  organizationCreated: false,
};

export const mockPrivateKeys: OidcConfigKey[] = [
  {
    id: 'private',
    value: '-----BEGIN PRIVATE KEY-----\nxxxxx\nyyyyy\nzzzzz\n-----END PRIVATE KEY-----\n',
    createdAt: 123_456_789,
  },
];

export const mockCookieKeys: OidcConfigKey[] = [
  { id: 'cookie', value: 'bar', createdAt: 987_654_321 },
];

const mockLogtoConfigs: LogtoConfig[] = [
  {
    tenantId: 'fake_tenant',
    key: LogtoOidcConfigKey.PrivateKeys,
    value: mockPrivateKeys,
  },
  {
    tenantId: 'fake_tenant',
    key: LogtoOidcConfigKey.CookieKeys,
    value: mockCookieKeys,
  },
];

export const mockLogtoConfigRows = {
  rows: mockLogtoConfigs,
  rowCount: mockLogtoConfigs.length,
  command: 'SELECT' as const,
  fields: [],
  notices: [],
};

export const mockPasscode: Passcode = {
  tenantId: 'fake_tenant',
  id: 'foo',
  interactionJti: 'jti',
  phone: '888 888 8888',
  email: 'foo@logto.io',
  type: TemplateType.SignIn,
  code: 'asdfghjkl',
  consumed: false,
  tryCount: 2,
  createdAt: 10,
};

export const mockUserRole: UsersRole = {
  tenantId: 'fake_tenant',
  id: 'user_role_id',
  userId: 'foo',
  roleId: 'role_id',
};

export const mockApplicationRole: ApplicationsRole = {
  tenantId: 'fake_tenant',
  id: 'application_role_id',
  applicationId: 'application_id',
  roleId: 'role_id',
};

export const mockJwtCustomizerConfigForAccessToken = {
  tenantId: 'fake_tenant',
  key: LogtoJwtTokenKey.AccessToken,
  value: {
    script: 'console.log("hello world");',
    environmentVariables: {
      API_KEY: '<api-key>',
    },
    contextSample: {
      user: {
        username: 'user',
      },
    },
  },
};

export const mockJwtCustomizerConfigForClientCredentials = {
  tenantId: 'fake_tenant',
  key: LogtoJwtTokenKey.ClientCredentials,
  value: {
    script: 'console.log("hello world");',
    environmentVariables: {
      API_KEY: '<api-key>',
    },
  },
};
