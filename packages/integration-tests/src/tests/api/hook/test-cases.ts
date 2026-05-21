/* eslint-disable max-lines -- flat fixture file; splitting by domain would fragment related cases across imports for no readability benefit */
import { trySafe } from '@silverhand/essentials';

import { type OrganizationApiTest } from '#src/helpers/organization.js';
import { generateName } from '#src/utils.js';

type PlaceholderIds = {
  userId?: string;
  applicationId?: string;
  /** Second application fixture; used by cases that exercise a two-sided PUT delta. */
  applicationIdB?: string;
  organizationId?: string;
  organizationRoleId?: string;
};

type HookPayloadArgs = PlaceholderIds & {
  isDevFeaturesEnabled: boolean;
};

type SetupContext = {
  organizationApi?: OrganizationApiTest;
  organizationId?: string;
  userId?: string;
  applicationId?: string;
  applicationIdB?: string;
  organizationRoleId?: string;
};

type TestCase = {
  route: string;
  event: string;
  method: 'patch' | 'post' | 'delete' | 'put';
  endpoint: string;
  payload: Record<string, unknown>;
  hookPayload?: Record<string, unknown> | ((args: HookPayloadArgs) => Record<string, unknown>);
  /** Idempotent precondition; runs before the route is hit. */
  setup?: (ctx: SetupContext) => Promise<void>;
};

export type { PlaceholderIds, HookPayloadArgs, SetupContext, TestCase };

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
    setup: async ({ organizationApi, organizationId, userId }) => {
      if (!organizationApi || !organizationId || !userId) {
        return;
      }
      await trySafe(organizationApi.deleteUser(organizationId, userId));
    },
    hookPayload: ({ userId, isDevFeaturesEnabled }) => ({
      organizationId: expect.any(String),
      ...(isDevFeaturesEnabled && {
        addedUserIds: [userId],
      }),
    }),
  },
  {
    route: 'PUT /organizations/:id/users',
    event: 'Organization.Membership.Updated',
    method: 'put',
    endpoint: `organizations/{organizationId}/users`,
    payload: { userIds: ['{userId}'] },
    setup: async ({ organizationApi, organizationId, userId }) => {
      if (!organizationApi || !organizationId || !userId) {
        return;
      }
      await trySafe(organizationApi.addUsers(organizationId, [userId]));
    },
    // No-op delta: helper omits both empty arrays, payload matches legacy shape.
    hookPayload: { organizationId: expect.any(String) },
  },
  {
    route: 'DELETE /organizations/:id/users/:userId',
    event: 'Organization.Membership.Updated',
    method: 'delete',
    endpoint: `organizations/{organizationId}/users/{userId}`,
    payload: {},
    setup: async ({ organizationApi, organizationId, userId }) => {
      if (!organizationApi || !organizationId || !userId) {
        return;
      }
      await trySafe(organizationApi.addUsers(organizationId, [userId]));
    },
    hookPayload: ({ userId, isDevFeaturesEnabled }) => ({
      organizationId: expect.any(String),
      ...(isDevFeaturesEnabled && {
        removedUserIds: [userId],
      }),
    }),
  },
  {
    route: 'POST /organizations/:id/applications',
    event: 'Organization.Membership.Updated',
    method: 'post',
    endpoint: `organizations/{organizationId}/applications`,
    payload: { applicationIds: ['{applicationId}'] },
    setup: async ({ organizationApi, organizationId, applicationId }) => {
      if (!organizationApi || !organizationId || !applicationId) {
        return;
      }
      await trySafe(organizationApi.applications.delete(organizationId, applicationId));
    },
    hookPayload: ({ applicationId, isDevFeaturesEnabled }) => ({
      organizationId: expect.any(String),
      ...(isDevFeaturesEnabled && {
        addedApplicationIds: [applicationId],
      }),
    }),
  },
  {
    // Re-POST of an already-member exercises the `getExistingApplicationIds` filter:
    // the request body is a known-member, so `newApplicationIds` is empty and the
    // helper omits `addedApplicationIds` from the payload. The setup uses `replace`
    // (PUT route) rather than `add` (POST route) so the precondition does not
    // overwrite the shared `POST /organizations/:id/applications` entry in the
    // webhook-results map between the previous POST case and this one.
    route: 'POST /organizations/:id/applications',
    event: 'Organization.Membership.Updated',
    method: 'post',
    endpoint: `organizations/{organizationId}/applications`,
    payload: { applicationIds: ['{applicationId}'] },
    setup: async ({ organizationApi, organizationId, applicationId }) => {
      if (!organizationApi || !organizationId || !applicationId) {
        return;
      }
      await trySafe(organizationApi.applications.replace(organizationId, [applicationId]));
    },
    hookPayload: { organizationId: expect.any(String) },
  },
  {
    route: 'PUT /organizations/:id/applications',
    event: 'Organization.Membership.Updated',
    method: 'put',
    endpoint: `organizations/{organizationId}/applications`,
    payload: { applicationIds: ['{applicationId}'] },
    setup: async ({ organizationApi, organizationId, applicationId }) => {
      if (!organizationApi || !organizationId || !applicationId) {
        return;
      }
      await trySafe(organizationApi.applications.add(organizationId, [applicationId]));
    },
    // No-op delta: helper omits both empty arrays, payload matches legacy shape.
    hookPayload: { organizationId: expect.any(String) },
  },
  {
    // Replace A with B exercises the `replaceWithDelta` plumbing end-to-end:
    // both `added` and `removed` are non-empty, so both delta fields must be
    // present in the payload (under the dev gate).
    route: 'PUT /organizations/:id/applications',
    event: 'Organization.Membership.Updated',
    method: 'put',
    endpoint: `organizations/{organizationId}/applications`,
    payload: { applicationIds: ['{applicationIdB}'] },
    setup: async ({ organizationApi, organizationId, applicationId, applicationIdB }) => {
      if (!organizationApi || !organizationId || !applicationId || !applicationIdB) {
        return;
      }
      // Ensure A is the sole pre-existing member; B is absent.
      await trySafe(organizationApi.applications.add(organizationId, [applicationId]));
      await trySafe(organizationApi.applications.delete(organizationId, applicationIdB));
    },
    hookPayload: ({ applicationId, applicationIdB, isDevFeaturesEnabled }) => ({
      organizationId: expect.any(String),
      ...(isDevFeaturesEnabled && {
        addedApplicationIds: [applicationIdB],
        removedApplicationIds: [applicationId],
      }),
    }),
  },
  {
    route: 'DELETE /organizations/:id/applications/:applicationId',
    event: 'Organization.Membership.Updated',
    method: 'delete',
    endpoint: `organizations/{organizationId}/applications/{applicationId}`,
    payload: {},
    setup: async ({ organizationApi, organizationId, applicationId }) => {
      if (!organizationApi || !organizationId || !applicationId) {
        return;
      }
      await trySafe(organizationApi.applications.add(organizationId, [applicationId]));
    },
    hookPayload: ({ applicationId, isDevFeaturesEnabled }) => ({
      organizationId: expect.any(String),
      ...(isDevFeaturesEnabled && {
        removedApplicationIds: [applicationId],
      }),
    }),
  },
  {
    route: 'DELETE /organizations/:id',
    event: 'Organization.Deleted',
    method: 'delete',
    endpoint: `organizations/{organizationId}`,
    payload: {},
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
/* eslint-enable max-lines */
