import { generateName } from '#src/utils.js';

type TestCase = {
  route: string;
  event: string;
  method: 'patch' | 'post' | 'delete' | 'put';
  endpoint: string;
  /** The payload that should be sent to the route. */
  payload: Record<string, unknown>;
  /** The payload that should be sent to the webhook. */
  hookPayload?: Record<string, unknown>;
};

export const userDataHookTestCases: TestCase[] = [
  {
    route: 'PATCH /users/:userId',
    event: 'User.Data.Updated',
    method: 'patch',
    endpoint: `users/{userId}`,
    payload: { name: 'new name' },
  },
  {
    route: 'PATCH /users/:userId/custom-data',
    event: 'User.Data.Updated',
    method: 'patch',
    endpoint: `users/{userId}/custom-data`,
    payload: { customData: { foo: 'bar' } },
  },
  {
    route: 'PATCH /users/:userId/profile',
    event: 'User.Data.Updated',
    method: 'patch',
    endpoint: `users/{userId}/profile`,
    payload: { profile: { nickname: 'darcy' } },
  },
  {
    route: 'PATCH /users/:userId/password',
    event: 'User.Data.Updated',
    method: 'patch',
    endpoint: `users/{userId}/password`,
    payload: { password: 'new-password' },
  },
  {
    route: 'PATCH /users/:userId/is-suspended',
    event: 'User.SuspensionStatus.Updated',
    method: 'patch',
    endpoint: `users/{userId}/is-suspended`,
    payload: { isSuspended: true },
  },
];

export const userRoleDataHookTestCases: TestCase[] = [
  {
    route: 'POST /users/:userId/roles',
    event: 'User.Roles.Updated',
    method: 'post',
    endpoint: `users/{userId}/roles`,
    payload: { roleIds: ['{roleId}'] },
    hookPayload: {
      data: expect.objectContaining({ id: expect.any(String) }),
      roles: expect.arrayContaining([expect.objectContaining({ id: expect.any(String) })]),
      addedRoleIds: expect.arrayContaining([expect.any(String)]),
    },
  },
  {
    route: 'PUT /users/:userId/roles',
    event: 'User.Roles.Updated',
    method: 'put',
    endpoint: `users/{userId}/roles`,
    payload: { roleIds: ['{roleId}'] },
    hookPayload: {
      data: expect.objectContaining({ id: expect.any(String) }),
      roles: expect.any(Array),
    },
  },
  {
    route: 'DELETE /users/:userId/roles/:roleId',
    event: 'User.Roles.Updated',
    method: 'delete',
    endpoint: `users/{userId}/roles/{roleId}`,
    payload: {},
    hookPayload: {
      data: expect.objectContaining({ id: expect.any(String) }),
      removedRoleIds: expect.arrayContaining([expect.any(String)]),
    },
  },
  {
    route: 'POST /roles/:id/users',
    event: 'User.Roles.Updated',
    method: 'post',
    endpoint: `roles/{roleId}/users`,
    payload: { userIds: ['{userId}'] },
    hookPayload: {
      data: expect.objectContaining({ id: expect.any(String) }),
      roles: expect.any(Array),
      addedRoleIds: expect.arrayContaining([expect.any(String)]),
    },
  },
  {
    route: 'DELETE /roles/:id/users/:userId',
    event: 'User.Roles.Updated',
    method: 'delete',
    endpoint: `roles/{roleId}/users/{userId}`,
    payload: {},
    hookPayload: {
      data: expect.objectContaining({ id: expect.any(String) }),
      removedRoleIds: expect.arrayContaining([expect.any(String)]),
    },
  },
];

export const roleDataHookTestCases: TestCase[] = [
  {
    route: 'PATCH /roles/:id',
    event: 'Role.Data.Updated',
    method: 'patch',
    endpoint: `roles/{roleId}`,
    payload: { name: 'new name' },
  },
  {
    route: 'POST /roles/:id/scopes',
    event: 'Role.Scopes.Updated',
    method: 'post',
    endpoint: `roles/{roleId}/scopes`,
    payload: { scopeIds: ['{scopeId}'] },
  },
  {
    route: 'DELETE /roles/:id/scopes/:scopeId',
    event: 'Role.Scopes.Updated',
    method: 'delete',
    endpoint: `roles/{roleId}/scopes/{scopeId}`,
    payload: {},
  },
  {
    route: 'DELETE /roles/:id',
    event: 'Role.Deleted',
    method: 'delete',
    endpoint: `roles/{roleId}`,
    payload: {},
  },
];

export const scopesDataHookTestCases: TestCase[] = [
  {
    route: 'PATCH /resources/:resourceId/scopes/:scopeId',
    event: 'Scope.Data.Updated',
    method: 'patch',
    endpoint: `resources/{resourceId}/scopes/{scopeId}`,
    payload: { name: generateName() },
  },
  {
    route: 'DELETE /resources/:resourceId/scopes/:scopeId',
    event: 'Scope.Deleted',
    method: 'delete',
    endpoint: `resources/{resourceId}/scopes/{scopeId}`,
    payload: {},
  },
];

export const organizationDataHookTestCases: TestCase[] = [
  {
    route: 'PATCH /organizations/:id',
    event: 'Organization.Data.Updated',
    method: 'patch',
    endpoint: `organizations/{organizationId}`,
    payload: { description: 'new org description' },
  },
  {
    route: 'POST /organizations/:id/users',
    event: 'Organization.Membership.Updated',
    method: 'post',
    endpoint: `organizations/{organizationId}/users`,
    payload: { userIds: ['{userId}'] },
    hookPayload: { organizationId: expect.any(String) },
  },
  {
    route: 'PUT /organizations/:id/users',
    event: 'Organization.Membership.Updated',
    method: 'put',
    endpoint: `organizations/{organizationId}/users`,
    payload: { userIds: ['{userId}'] },
    hookPayload: { organizationId: expect.any(String) },
  },
  {
    route: 'DELETE /organizations/:id/users/:userId',
    event: 'Organization.Membership.Updated',
    method: 'delete',
    endpoint: `organizations/{organizationId}/users/{userId}`,
    payload: {},
    hookPayload: { organizationId: expect.any(String) },
  },
  {
    route: 'POST /organizations/:id/applications',
    event: 'Organization.Membership.Updated',
    method: 'post',
    endpoint: `organizations/{organizationId}/applications`,
    payload: { applicationIds: ['{applicationId}'] },
    hookPayload: { organizationId: expect.any(String) },
  },
  {
    route: 'PUT /organizations/:id/applications',
    event: 'Organization.Membership.Updated',
    method: 'put',
    endpoint: `organizations/{organizationId}/applications`,
    payload: { applicationIds: ['{applicationId}'] },
    hookPayload: { organizationId: expect.any(String) },
  },
  {
    route: 'DELETE /organizations/:id/applications/:applicationId',
    event: 'Organization.Membership.Updated',
    method: 'delete',
    endpoint: `organizations/{organizationId}/applications/{applicationId}`,
    payload: {},
    hookPayload: { organizationId: expect.any(String) },
  },
  {
    route: 'DELETE /organizations/:id',
    event: 'Organization.Deleted',
    method: 'delete',
    endpoint: `organizations/{organizationId}`,
    payload: {},
  },
];

export const organizationUserRoleDataHookTestCases: TestCase[] = [
  {
    route: 'POST /organizations/:id/users/:userId/roles',
    event: 'Organization.UserRoles.Updated',
    method: 'post',
    endpoint: `organizations/{organizationId}/users/{userId}/roles`,
    payload: { organizationRoleIds: ['{organizationRoleId}'] },
    hookPayload: {
      organizationId: expect.any(String),
      data: expect.objectContaining({ id: expect.any(String) }),
      organizationRoles: expect.arrayContaining([
        expect.objectContaining({ id: expect.any(String) }),
      ]),
      addedOrganizationRoleIds: expect.arrayContaining([expect.any(String)]),
    },
  },
  {
    route: 'PUT /organizations/:id/users/:userId/roles',
    event: 'Organization.UserRoles.Updated',
    method: 'put',
    endpoint: `organizations/{organizationId}/users/{userId}/roles`,
    payload: { organizationRoleIds: ['{organizationRoleId}'] },
    hookPayload: {
      organizationId: expect.any(String),
      data: expect.objectContaining({ id: expect.any(String) }),
      organizationRoles: expect.any(Array),
    },
  },
  {
    route: 'DELETE /organizations/:id/users/:userId/roles/:organizationRoleId',
    event: 'Organization.UserRoles.Updated',
    method: 'delete',
    endpoint: `organizations/{organizationId}/users/{userId}/roles/{organizationRoleId}`,
    payload: {},
    hookPayload: {
      organizationId: expect.any(String),
      data: expect.objectContaining({ id: expect.any(String) }),
      removedOrganizationRoleIds: expect.arrayContaining([expect.any(String)]),
    },
  },
  {
    route: 'POST /organizations/:id/users/roles',
    event: 'Organization.UserRoles.Updated',
    method: 'post',
    endpoint: `organizations/{organizationId}/users/roles`,
    payload: {
      userIds: ['{userId}'],
      organizationRoleIds: ['{organizationRoleId}'],
    },
    hookPayload: {
      organizationId: expect.any(String),
      data: expect.objectContaining({ id: expect.any(String) }),
      organizationRoles: expect.arrayContaining([
        expect.objectContaining({ id: expect.any(String) }),
      ]),
      addedOrganizationRoleIds: expect.arrayContaining([expect.any(String)]),
    },
  },
];

export const organizationScopeDataHookTestCases: TestCase[] = [
  {
    route: 'PATCH /organization-scopes/:id',
    event: 'OrganizationScope.Data.Updated',
    method: 'patch',
    endpoint: `organization-scopes/{organizationScopeId}`,
    payload: { description: 'new org scope description' },
  },
  {
    route: 'DELETE /organization-scopes/:id',
    event: 'OrganizationScope.Deleted',
    method: 'delete',
    endpoint: `organization-scopes/{organizationScopeId}`,
    payload: {},
  },
];

export const organizationRoleDataHookTestCases: TestCase[] = [
  {
    route: 'PATCH /organization-roles/:id',
    event: 'OrganizationRole.Data.Updated',
    method: 'patch',
    endpoint: `organization-roles/{organizationRoleId}`,
    payload: { name: generateName() },
  },
  {
    route: 'POST /organization-roles/:id/scopes',
    event: 'OrganizationRole.Scopes.Updated',
    method: 'post',
    endpoint: `organization-roles/{organizationRoleId}/scopes`,
    payload: { organizationScopeIds: ['{scopeId}'] },
  },
  {
    route: 'PUT /organization-roles/:id/scopes',
    event: 'OrganizationRole.Scopes.Updated',
    method: 'put',
    endpoint: `organization-roles/{organizationRoleId}/scopes`,
    payload: { organizationScopeIds: ['{scopeId}'] },
  },
  {
    route: 'DELETE /organization-roles/:id/scopes/:organizationScopeId',
    event: 'OrganizationRole.Scopes.Updated',
    method: 'delete',
    endpoint: `organization-roles/{organizationRoleId}/scopes/{scopeId}`,
    payload: {},
  },
  {
    route: 'DELETE /organization-roles/:id',
    event: 'OrganizationRole.Deleted',
    method: 'delete',
    endpoint: `organization-roles/{organizationRoleId}`,
    payload: {},
  },
];
