import { SignInIdentifier, hookEvents, userInfoSelectFields } from '@logto/schemas';
import { pick } from '@silverhand/essentials';

import { deleteUser } from '#src/api/admin-user.js';
import { createResource, deleteResource } from '#src/api/resource.js';
import { createRole } from '#src/api/role.js';
import { createScope } from '#src/api/scope.js';
import { updateSignInExperience } from '#src/api/sign-in-experience.js';
import { SsoConnectorApi } from '#src/api/sso-connector.js';
import { setEmailConnector, setSmsConnector } from '#src/helpers/connector.js';
import { WebHookApiTest } from '#src/helpers/hook.js';
import { registerWithEmail } from '#src/helpers/interactions.js';
import { OrganizationApiTest } from '#src/helpers/organization.js';
import { enableAllVerificationCodeSignInMethods } from '#src/helpers/sign-in-experience.js';
import { registerNewUserWithSso } from '#src/helpers/single-sign-on.js';
import { UserApiTest } from '#src/helpers/user.js';
import { generateEmail, generateName, generateRoleName, randomString } from '#src/utils.js';

import WebhookMockServer from './WebhookMockServer.js';
import { assertHookLogResult } from './utils.js';

describe('manual data hook tests', () => {
  const webbHookMockServer = new WebhookMockServer(9999);
  const webHookApi = new WebHookApiTest();
  const userApi = new UserApiTest();
  const organizationApi = new OrganizationApiTest();
  const hookName = 'customDataHookEventListener';
  const ssoConnectorApi = new SsoConnectorApi();

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
    await Promise.all([
      webHookApi.cleanUp(),
      userApi.cleanUp(),
      organizationApi.cleanUp(),
      ssoConnectorApi.cleanUp(),
    ]);
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
    const scope = await organizationApi.scopeApi.create({ name: generateName() });
    const hook = webHookApi.hooks.get(hookName)!;

    const organizationRole = await organizationApi.roleApi.create({
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
  });

  it('delete user should trigger User.Deleted event with selected user info', async () => {
    const user = await userApi.create({});
    const hook = webHookApi.hooks.get(hookName)!;

    await deleteUser(user.id);

    await assertHookLogResult(hook, 'User.Deleted', {
      hookPayload: {
        event: 'User.Deleted',
        data: pick(user, ...userInfoSelectFields),
      },
    });
  });

  const assertOrganizationMembershipUpdated = async (organizationId: string) =>
    assertHookLogResult(webHookApi.hooks.get(hookName)!, 'Organization.Membership.Updated', {
      hookPayload: {
        event: 'Organization.Membership.Updated',
        organizationId,
      },
    });

  describe('organization membership update by just-in-time organization provisioning', () => {
    // TODO: Add user deletion test case

    it('should trigger `Organization.Membership.Updated` event when user is provisioned by experience', async () => {
      await setEmailConnector();
      await setSmsConnector();
      await enableAllVerificationCodeSignInMethods({
        identifiers: [SignInIdentifier.Email],
        password: false,
        verify: true,
      });

      const organization = await organizationApi.create({ name: 'foo' });
      const domain = 'example.com';
      await organizationApi.jit.addEmailDomain(organization.id, domain);

      await registerWithEmail(`${randomString()}@${domain}`);
      await assertOrganizationMembershipUpdated(organization.id);
    });

    it('should trigger `Organization.Membership.Updated` event when user is provisioned by SSO', async () => {
      const organization = await organizationApi.create({ name: 'bar' });
      const domain = 'sso_example.com';
      const connector = await ssoConnectorApi.createMockOidcConnector([domain]);
      await organizationApi.jit.ssoConnectors.add(organization.id, [connector.id]);

      await updateSignInExperience({
        singleSignOnEnabled: true,
      });

      await registerNewUserWithSso(connector.id, {
        authData: {
          sub: randomString(),
          email: generateEmail(domain),
          email_verified: true,
        },
      });

      await assertOrganizationMembershipUpdated(organization.id);
    });
  });
});
