import { trySafe } from '@silverhand/essentials';

import { generateName } from '#src/utils.js';

import type { TestCase } from './test-cases.js';

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
    hookPayload: ({ userId }) => ({
      organizationId: expect.any(String),
      addedUserIds: [userId],
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
    hookPayload: ({ userId }) => ({
      organizationId: expect.any(String),
      removedUserIds: [userId],
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
    hookPayload: ({ applicationId }) => ({
      organizationId: expect.any(String),
      addedApplicationIds: [applicationId],
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
    // both `added` and `removed` are non-empty, so both delta fields appear
    // in the payload.
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
    hookPayload: ({ applicationId, applicationIdB }) => ({
      organizationId: expect.any(String),
      addedApplicationIds: [applicationIdB],
      removedApplicationIds: [applicationId],
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
    hookPayload: ({ applicationId }) => ({
      organizationId: expect.any(String),
      removedApplicationIds: [applicationId],
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
