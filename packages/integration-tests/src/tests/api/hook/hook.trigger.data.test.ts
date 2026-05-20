import { RoleType, type Role } from '@logto/schemas';
import { assert } from '@silverhand/essentials';

import { authedAdminApi } from '#src/api/api.js';
import { createResource } from '#src/api/resource.js';
import { createScope } from '#src/api/scope.js';
import { generateNewUser } from '#src/helpers/user.js';
import { generateName } from '#src/utils.js';

import { verifySignature } from './WebhookMockServer.js';
import {
  roleDataHookTestCases,
  scopesDataHookTestCases,
  userDataHookTestCases,
} from './test-cases.js';
import { createDataHookFixture, partitionManagementApiHookKeys } from './webhook-fixtures.js';

const fixture = createDataHookFixture(9999, 'management-api-hook');
const { webHookApi, hookName, getWebhookResult } = fixture;

beforeAll(async () => {
  await fixture.start();
});

afterAll(async () => {
  await fixture.cleanup();
});

describe('user data hook events', () => {
  // eslint-disable-next-line @silverhand/fp/no-let
  let userId: string;

  beforeAll(async () => {
    // Create a user to trigger the User.Created event.
    const { user } = await generateNewUser({ username: true, password: true });
    // eslint-disable-next-line @silverhand/fp/no-mutation
    userId = user.id;
    const userCreateHook = await getWebhookResult('POST /users');
    expect(userCreateHook?.payload.event).toBe('User.Created');
  });

  it.each(userDataHookTestCases)(
    'test case %#: %p',
    async ({ route, event, method, endpoint, payload }) => {
      await authedAdminApi[method](endpoint.replace('{userId}', userId), { json: payload });
      const hook = await getWebhookResult(route);
      expect(hook?.payload.event).toBe(event);
    }
  );

  // Clean up
  afterAll(async () => {
    await authedAdminApi.delete(`users/${userId}`);
  });
});

describe('role data hook events', () => {
  /* eslint-disable @silverhand/fp/no-let */
  let roleId: string;
  let scopeId: string;
  let resourceId: string;
  /* eslint-enable @silverhand/fp/no-let */

  beforeAll(async () => {
    // Create a role to trigger the Role.Created event.
    const role = await authedAdminApi
      .post('roles', {
        json: { name: generateName(), description: 'data-hook-role', type: RoleType.User },
      })
      .json<Role>();

    const roleCreateHook = await getWebhookResult('POST /roles');
    expect(roleCreateHook?.payload.event).toBe('Role.Created');

    // Prepare the role and scope id for the Role.Scopes.Updated event.
    /* eslint-disable @silverhand/fp/no-mutation */
    roleId = role.id;
    const resource = await createResource();
    const scope = await createScope(resource.id);

    scopeId = scope.id;
    resourceId = resource.id;
    /* eslint-enable @silverhand/fp/no-mutation */
  });

  afterAll(async () => {
    await authedAdminApi.delete(`resources/${resourceId}`);
  });

  it.each(roleDataHookTestCases)(
    'test case %#: %p',
    async ({ route, event, method, endpoint, payload }) => {
      await authedAdminApi[method](
        endpoint.replace('{roleId}', roleId).replace('{scopeId}', scopeId),
        // Replace all the scopeId placeholder in the payload
        { json: JSON.parse(JSON.stringify(payload).replace('{scopeId}', scopeId)) }
      );
      const hook = await getWebhookResult(route);
      expect(hook?.payload.event).toBe(event);
    }
  );
});

describe('scope data hook events', () => {
  /* eslint-disable @silverhand/fp/no-let */
  let resourceId: string;
  let scopeId: string;
  /* eslint-enable @silverhand/fp/no-let */

  beforeAll(async () => {
    const resource = await createResource();
    const scope = await createScope(resource.id);

    /* eslint-disable @silverhand/fp/no-mutation */
    resourceId = resource.id;
    scopeId = scope.id;
    /* eslint-enable @silverhand/fp/no-mutation */

    const scopesCreateHook = await getWebhookResult('POST /resources/:resourceId/scopes');
    expect(scopesCreateHook?.payload.event).toBe('Scope.Created');
  });

  afterAll(async () => {
    await authedAdminApi.delete(`resources/${resourceId}`);
  });

  it.each(scopesDataHookTestCases)(
    'test case %#: %p',
    async ({ route, event, method, endpoint, payload }) => {
      await authedAdminApi[method](
        endpoint.replace('{resourceId}', resourceId).replace('{scopeId}', scopeId),
        { json: payload }
      );
      const hook = await getWebhookResult(route);
      expect(hook?.payload.event).toBe(event);
    }
  );
});

describe('non-organization data hook events coverage and signature verification', () => {
  const { nonOrganizationKeys } = partitionManagementApiHookKeys();

  it.each(nonOrganizationKeys)('should have test case for %s', async (key) => {
    const webhook = webHookApi.hooks.get(hookName)!;

    const webhookResult = await getWebhookResult(key);
    expect(webhookResult).toBeDefined();
    expect(webhookResult?.payload.status).not.toBe(404);
    assert(webhookResult, new Error('webhookResult is undefined'));

    const { signature, rawPayload } = webhookResult;
    expect(verifySignature(rawPayload, webhook.signingKey, signature)).toBeTruthy();
  });
});
