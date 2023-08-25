import { VerificationCodeType } from '@logto/connector-kit';
import type {
  AdminConsoleData,
  Application,
  Passcode,
  Resource,
  Role,
  Scope,
  UsersRole,
} from '@logto/schemas';
import { RoleType, ApplicationType } from '@logto/schemas';

export * from './connector.js';
export * from './sign-in-experience.js';
export * from './cloud-connection.js';
export * from './user.js';
export * from './domain.js';

export const mockApplication: Application = {
  tenantId: 'fake_tenant',
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
  createdAt: 1_645_334_775_356,
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
};

export const mockAdminUserRole: Role = {
  tenantId: 'fake_tenant',
  id: 'role_id',
  name: 'admin',
  description: 'admin',
  type: RoleType.User,
};

export const mockAdminUserRole2: Role = {
  tenantId: 'fake_tenant',
  id: 'role_id2',
  name: 'admin2',
  description: 'admin2',
  type: RoleType.User,
};

export const mockAdminUserRole3: Role = {
  tenantId: 'fake_tenant',
  id: 'role_id3',
  name: 'admin3',
  description: 'admin3',
  type: RoleType.MachineToMachine,
};

export const mockAdminConsoleData: AdminConsoleData = {
  livePreviewChecked: false,
  applicationCreated: false,
  signInExperienceCustomized: false,
  passwordlessConfigured: false,
  furtherReadingsChecked: false,
  roleCreated: false,
  communityChecked: false,
  m2mApplicationCreated: false,
};

export const mockPasscode: Passcode = {
  tenantId: 'fake_tenant',
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

export const mockUserRole: UsersRole = {
  tenantId: 'fake_tenant',
  id: 'user_role_id',
  userId: 'foo',
  roleId: 'role_id',
};
