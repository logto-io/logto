import {
  ApplicationType,
  RoleType,
  hookEventGuard,
  hookEvents,
  jsonGuard,
  managementApiHooksRegistration,
  type Role,
} from '@logto/schemas';
import { assert } from '@silverhand/essentials';
import { z } from 'zod';

import { authedAdminApi } from '#src/api/api.js';
import { createApplication, deleteApplication } from '#src/api/application.js';
import { createResource } from '#src/api/resource.js';
import { createScope } from '#src/api/scope.js';
import { isDevFeaturesEnabled } from '#src/constants.js';
import { WebHookApiTest } from '#src/helpers/hook.js';
import {
  OrganizationApiTest,
  OrganizationRoleApiTest,
  OrganizationScopeApiTest,
} from '#src/helpers/organization.js';
import { UserApiTest, generateNewUser } from '#src/helpers/user.js';
import { generateName, waitFor } from '#src/utils.js';

import WebhookMockServer, { verifySignature } from './WebhookMockServer.js';
import {
  organizationDataHookTestCases,
  organizationRoleDataHookTestCases,
  organizationScopeDataHookTestCases,
  roleDataHookTestCases,
  scopesDataHookTestCases,
  userDataHookTestCases,
} from './test-cases.js';

const mockHookResponseGuard = z.object({
  signature: z.string(),
  payload: z
    .object({
      event: hookEventGuard,
      createdAt: z.string(),
      hookId: z.string(),
      data: jsonGuard.optional(),
      method: z
        .string()
        .optional()
        .transform((value) => value?.toUpperCase()),
      matchedRoute: z.string().optional(),
      status: z.number().optional(),
    })
    .catchall(z.any()),
  // Keep the raw payload for signature verification
  rawPayload: z.string(),
});

type MockHookResponse = z.infer<typeof mockHookResponseGuard>;

const hookName = 'management-api-hook';
const webhookResults = new Map<string, MockHookResponse>();
const webHookApi = new WebHookApiTest();

// Record the hook response to the webhookResults map.
// Compare the webhookResults map with the managementApiHooksRegistration to verify all hook is triggered.
const webhookResponseHandler = (response: string) => {
  const result = mockHookResponseGuard.parse(JSON.parse(response));
  const { payload } = result;

  // Use matchedRoute as the key
  if (payload.matchedRoute) {
    webhookResults.set(`${payload.method} ${payload.matchedRoute}`, result);
  }
};

/**
 * Get the webhook result by the key.
 *
 * @remark Since the webhook request is async, we need to wait for a while
 * to ensure the webhook response is received.
 */
const getWebhookResult = async (key: string) => {
  await waitFor(100);

  return webhookResults.get(key);
};

const webhookServer = new WebhookMockServer(9999, webhookResponseHandler);

beforeAll(async () => {
  await webhookServer.listen();

  await webHookApi.create({
    name: hookName,
    events: [...hookEvents],
    config: {
      url: webhookServer.endpoint,
    },
  });
});

afterAll(async () => {
  await webHookApi.cleanUp();
  await webhookServer.close();
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

describe('organization data hook events', () => {
  /* eslint-disable @silverhand/fp/no-let */
  let organizationId: string;
  let userId: string;
  let applicationId: string;
  /* eslint-enable @silverhand/fp/no-let */

  const organizationApi = new OrganizationApiTest();
  const userApi = new UserApiTest();

  beforeAll(async () => {
    const organization = await organizationApi.create({
      name: generateName(),
      description: 'organization data hook test organization.',
    });

    const user = await userApi.create({ name: generateName() });
    const application = await createApplication(generateName(), ApplicationType.MachineToMachine);

    /* eslint-disable @silverhand/fp/no-mutation */
    organizationId = organization.id;
    userId = user.id;
    applicationId = application.id;
    /* eslint-enable @silverhand/fp/no-mutation */

    const organizationCreateHook = await getWebhookResult('POST /organizations');
    expect(organizationCreateHook?.payload.event).toBe('Organization.Created');
  });

  afterAll(async () => {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    await Promise.all([userApi.cleanUp(), deleteApplication(applicationId).catch(() => {})]);
  });

  it.each(organizationDataHookTestCases)(
    'test case %#: %p',
    async ({ route, event, method, endpoint, payload, hookPayload }) => {
      // TODO: Remove this check
      if (route.includes('applications') && !isDevFeaturesEnabled) {
        return;
      }

      await authedAdminApi[method](
        endpoint
          .replace('{organizationId}', organizationId)
          .replace('{userId}', userId)
          .replace('{applicationId}', applicationId),
        {
          json: JSON.parse(
            JSON.stringify(payload)
              .replace('{userId}', userId)
              .replace('{applicationId}', applicationId)
          ),
        }
      );
      const hook = await getWebhookResult(route);
      expect(hook?.payload.event).toBe(event);
      if (hookPayload) {
        expect(hook?.payload).toMatchObject(hookPayload);
      }
    }
  );
});

describe('organization scope data hook events', () => {
  /* eslint-disable @silverhand/fp/no-let */
  let scopeId: string;
  /* eslint-enable @silverhand/fp/no-let */

  const organizationScopeApi = new OrganizationScopeApiTest();

  beforeAll(async () => {
    const scope = await organizationScopeApi.create({
      name: generateName(),
      description: 'organization scope data hook test scope.',
    });

    /* eslint-disable @silverhand/fp/no-mutation */
    scopeId = scope.id;
    /* eslint-enable @silverhand/fp/no-mutation */

    const organizationScopeCreateHook = await getWebhookResult('POST /organization-scopes');
    expect(organizationScopeCreateHook?.payload.event).toBe('OrganizationScope.Created');
  });

  it.each(organizationScopeDataHookTestCases)(
    'test case %#: %p',
    async ({ route, event, method, endpoint, payload }) => {
      await authedAdminApi[method](endpoint.replace('{organizationScopeId}', scopeId), {
        json: payload,
      });
      const hook = await getWebhookResult(route);
      expect(hook?.payload.event).toBe(event);
    }
  );
});

describe('organization role data hook events', () => {
  /* eslint-disable @silverhand/fp/no-let */
  let roleId: string;
  let scopeId: string;
  /* eslint-enable @silverhand/fp/no-let */

  const organizationScopeApi = new OrganizationScopeApiTest();
  const roleApi = new OrganizationRoleApiTest();

  beforeAll(async () => {
    const role = await roleApi.create({
      name: generateName(),
      description: 'organization role data hook test role.',
    });

    const scope = await organizationScopeApi.create({
      name: generateName(),
      description: 'organization role data hook test scope.',
    });

    /* eslint-disable @silverhand/fp/no-mutation */
    roleId = role.id;
    scopeId = scope.id;
    /* eslint-enable @silverhand/fp/no-mutation */

    const organizationRoleCreateHook = await getWebhookResult('POST /organization-roles');
    expect(organizationRoleCreateHook?.payload.event).toBe('OrganizationRole.Created');
  });

  afterAll(async () => {
    await Promise.all([organizationScopeApi.cleanUp(), roleApi.cleanUp()]);
  });

  it.each(organizationRoleDataHookTestCases)(
    'test case %#: %p',
    async ({ route, event, method, endpoint, payload }) => {
      await authedAdminApi[method](
        endpoint.replace('{organizationRoleId}', roleId).replace('{scopeId}', scopeId),
        { json: JSON.parse(JSON.stringify(payload).replace('{scopeId}', scopeId)) }
      );
      const hook = await getWebhookResult(route);
      expect(hook?.payload.event).toBe(event);
    }
  );
});

describe('data hook events coverage and signature verification', () => {
  const keys = Object.keys(managementApiHooksRegistration);

  it.each(keys)('should have test case for %s', async (key) => {
    const webhook = webHookApi.hooks.get(hookName)!;

    const webhookResult = await getWebhookResult(key);
    expect(webhookResult).toBeDefined();
    expect(webhookResult?.payload.status).not.toBe(404);
    assert(webhookResult, new Error('webhookResult is undefined'));

    const { signature, rawPayload } = webhookResult;
    expect(verifySignature(rawPayload, webhook.signingKey, signature)).toBeTruthy();
  });
});
