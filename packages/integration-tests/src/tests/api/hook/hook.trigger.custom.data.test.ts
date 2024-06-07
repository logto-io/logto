import { hookEvents } from '@logto/schemas';

import { OrganizationRoleApi } from '#src/api/organization-role.js';
import { OrganizationScopeApi } from '#src/api/organization-scope.js';
import { createResource, deleteResource } from '#src/api/resource.js';
import { createRole } from '#src/api/role.js';
import { createScope } from '#src/api/scope.js';
import { WebHookApiTest } from '#src/helpers/hook.js';
import { generateName, generateRoleName } from '#src/utils.js';

import WebhookMockServer from './WebhookMockServer.js';
import { assertHookLogResult } from './utils.js';

describe('trigger custom data hook events', () => {
  const webbHookMockServer = new WebhookMockServer(9999);
  const webHookApi = new WebHookApiTest();
  const hookName = 'customDataHookEventListener';

  beforeAll(async () => {
    await webbHookMockServer.listen();
  });

  afterAll(async () => {
    await webbHookMockServer.close();
  });

  beforeEach(async () => {
    await webHookApi.create({
      name: hookName,
      events: [...hookEvents],
      config: { url: webbHookMockServer.endpoint },
    });
  });

  afterEach(async () => {
    await webHookApi.cleanUp();
  });

  it('create roles with scopeIds should trigger Roles.Scopes.Updated event', async () => {
    const resource = await createResource();
    const scope = await createScope(resource.id);
    const hook = webHookApi.hooks.get(hookName)!;

    const role = await createRole({ scopeIds: [scope.id] });

    await assertHookLogResult(hook, 'Role.Created', {
      hookPayload: {
        event: 'Role.Created',
        path: '/roles',
        data: role,
      },
    });

    await assertHookLogResult(hook, 'Role.Scopes.Updated', {
      hookPayload: {
        event: 'Role.Scopes.Updated',
        path: '/roles',
        roleId: role.id,
        data: [scope],
      },
    });

    // Clean up
    await deleteResource(resource.id);
  });

  it('create organizationRoles with organizationScopeIds should trigger OrganizationRole.Scopes.Updated event', async () => {
    const roleApi = new OrganizationRoleApi();
    const organizationScopeApi = new OrganizationScopeApi();
    const scope = await organizationScopeApi.create({ name: generateName() });
    const hook = webHookApi.hooks.get(hookName)!;

    const organizationRole = await roleApi.create({
      name: generateRoleName(),
      organizationScopeIds: [scope.id],
    });

    await assertHookLogResult(hook, 'OrganizationRole.Created', {
      hookPayload: {
        event: 'OrganizationRole.Created',
        path: '/organization-roles',
        data: organizationRole,
      },
    });

    await assertHookLogResult(hook, 'OrganizationRole.Scopes.Updated', {
      hookPayload: {
        event: 'OrganizationRole.Scopes.Updated',
        path: '/organization-roles',
        organizationRoleId: organizationRole.id,
      },
    });

    await roleApi.delete(organizationRole.id);
    await organizationScopeApi.delete(scope.id);
  });
});
