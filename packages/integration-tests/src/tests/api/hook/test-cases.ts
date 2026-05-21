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
