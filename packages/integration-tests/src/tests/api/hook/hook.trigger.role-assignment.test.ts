import { OrganizationInvitationStatus, RoleType } from '@logto/schemas';
import { assert } from '@silverhand/essentials';

import { authedAdminApi } from '#src/api/api.js';
import { getWebhookRecentLogs } from '#src/api/logs.js';
import { createRole, deleteRole } from '#src/api/role.js';
import { updateSignInExperience } from '#src/api/sign-in-experience.js';
import { SsoConnectorApi } from '#src/api/sso-connector.js';
import { signInWithEnterpriseSso } from '#src/helpers/experience/index.js';
import { OrganizationApiTest, OrganizationInvitationApiTest } from '#src/helpers/organization.js';
import { UserApiTest } from '#src/helpers/user.js';
import { generateEmail, generateName, randomString, waitFor } from '#src/utils.js';

import { createDataHookFixture } from './webhook-fixtures.js';

const fixture = createDataHookFixture(9999, 'role-assignment-webhook');
const { webHookApi, hookName, webhookResults, getWebhookResult } = fixture;

beforeAll(async () => {
  await fixture.start();
});

afterAll(async () => {
  await fixture.cleanup();
});

type UserRolesPayload = {
  event: 'User.Roles.Updated';
  userId: string;
  addedRoleIds: string[];
  removedRoleIds: string[];
  matchedRoute?: string;
};

type OrganizationUserRolesPayload = {
  event: 'Organization.UserRoles.Updated';
  organizationId: string;
  userId: string;
  addedOrganizationRoleIds: string[];
  removedOrganizationRoleIds: string[];
  matchedRoute?: string;
};

const readHookPayloads = async <T extends { event: string }>(event: T['event']) => {
  const hook = webHookApi.hooks.get(hookName);
  assert(hook, new Error('Webhook not found'));

  const logs = await getWebhookRecentLogs(
    hook.id,
    new URLSearchParams({ logKey: `TriggerHook.${event}`, page_size: '50' })
  );

  return logs
    .map((log) => {
      const payload = log.payload as { hookRequest?: { body?: T } };
      return payload.hookRequest?.body;
    })
    .filter((payload): payload is T => payload !== undefined);
};

const waitForHookPayloads = async <T extends { event: string }>(
  event: T['event'],
  predicate: (payload: T) => boolean,
  expectedCount: number,
  retries = 50
): Promise<T[]> => {
  const payloads = await readHookPayloads<T>(event);
  const filtered = payloads.filter((payload) => predicate(payload));

  if (filtered.length >= expectedCount || retries <= 0) {
    return filtered;
  }

  await waitFor(100);

  return waitForHookPayloads(event, predicate, expectedCount, retries - 1);
};

describe('tenant user role webhooks', () => {
  const userApi = new UserApiTest();
  /* eslint-disable @silverhand/fp/no-let */
  let user: Awaited<ReturnType<UserApiTest['create']>>;
  let roleA: Awaited<ReturnType<typeof createRole>>;
  let roleB: Awaited<ReturnType<typeof createRole>>;
  let roleC: Awaited<ReturnType<typeof createRole>>;
  /* eslint-enable @silverhand/fp/no-let */

  beforeAll(async () => {
    /* eslint-disable @silverhand/fp/no-mutation */
    user = await userApi.create({ name: generateName() });
    roleA = await createRole({ type: RoleType.User });
    roleB = await createRole({ type: RoleType.User });
    roleC = await createRole({ type: RoleType.User });
    /* eslint-enable @silverhand/fp/no-mutation */
  });

  afterAll(async () => {
    await Promise.all([
      userApi.cleanUp(),
      deleteRole(roleA.id),
      deleteRole(roleB.id),
      deleteRole(roleC.id),
    ]);
  });

  it('POST reports only roles that were actually added', async () => {
    await authedAdminApi.post(`users/${user.id}/roles`, { json: { roleIds: [roleA.id] } });
    await getWebhookResult('POST /users/:userId/roles');

    webhookResults.delete('POST /users/:userId/roles');

    await authedAdminApi.post(`users/${user.id}/roles`, {
      json: { roleIds: [roleA.id, roleB.id] },
    });

    const hook = await getWebhookResult('POST /users/:userId/roles');
    expect(hook?.payload).toMatchObject({
      event: 'User.Roles.Updated',
      userId: user.id,
      addedRoleIds: [roleB.id],
      removedRoleIds: [],
      method: 'POST',
      status: 201,
      matchedRoute: '/users/:userId/roles',
    });
  });

  it('PUT reports both added and removed roles', async () => {
    webhookResults.delete('PUT /users/:userId/roles');

    await authedAdminApi.put(`users/${user.id}/roles`, {
      json: { roleIds: [roleA.id, roleC.id] },
    });

    const hook = await getWebhookResult('PUT /users/:userId/roles');
    expect(hook?.payload).toMatchObject({
      event: 'User.Roles.Updated',
      userId: user.id,
      addedRoleIds: [roleC.id],
      removedRoleIds: [roleB.id],
      method: 'PUT',
      status: 200,
      matchedRoute: '/users/:userId/roles',
    });
  });

  it('PUT emits nothing when the role set is unchanged', async () => {
    webhookResults.delete('PUT /users/:userId/roles');

    await authedAdminApi.put(`users/${user.id}/roles`, {
      json: { roleIds: [roleA.id, roleC.id] },
    });

    expect(await getWebhookResult('PUT /users/:userId/roles')).toBeUndefined();
  });

  it('DELETE reports the removed role', async () => {
    webhookResults.delete('DELETE /users/:userId/roles/:roleId');

    await authedAdminApi.delete(`users/${user.id}/roles/${roleA.id}`);

    const hook = await getWebhookResult('DELETE /users/:userId/roles/:roleId');
    expect(hook?.payload).toMatchObject({
      event: 'User.Roles.Updated',
      userId: user.id,
      addedRoleIds: [],
      removedRoleIds: [roleA.id],
      method: 'DELETE',
      status: 204,
      matchedRoute: '/users/:userId/roles/:roleId',
    });
  });

  it('bulk POST emits one event per user', async () => {
    const users = await Promise.all([userApi.create({}), userApi.create({})]);
    const role = await createRole({ type: RoleType.User });

    await authedAdminApi.post(`roles/${role.id}/users`, {
      json: { userIds: users.map(({ id }) => id) },
    });

    const payloads = await waitForHookPayloads<UserRolesPayload>(
      'User.Roles.Updated',
      (payload) =>
        payload.matchedRoute === '/roles/:id/users' &&
        users.some(({ id }) => id === payload.userId),
      users.length
    );

    expect(payloads).toHaveLength(users.length);
    for (const user of users) {
      expect(payloads).toContainEqual(
        expect.objectContaining({
          event: 'User.Roles.Updated',
          userId: user.id,
          addedRoleIds: [role.id],
          removedRoleIds: [],
        })
      );
    }

    await deleteRole(role.id);
  });

  it('emits initial roles after user creation', async () => {
    const defaultRole = await createRole({ type: RoleType.User, isDefault: true });
    const created = await userApi.create({});

    const payloads = await waitForHookPayloads<UserRolesPayload>(
      'User.Roles.Updated',
      (payload) => payload.userId === created.id,
      1
    );

    expect(payloads).toHaveLength(1);
    expect(payloads[0]).toMatchObject({
      userId: created.id,
      removedRoleIds: [],
      matchedRoute: '/users',
    });
    expect(payloads[0]?.addedRoleIds).toEqual(expect.arrayContaining([defaultRole.id]));

    await deleteRole(defaultRole.id);
  });
});

describe('organization user role webhooks', () => {
  const organizationApi = new OrganizationApiTest();
  const userApi = new UserApiTest();
  const invitationApi = new OrganizationInvitationApiTest();

  /* eslint-disable @silverhand/fp/no-let */
  let organization: Awaited<ReturnType<OrganizationApiTest['create']>>;
  let user: Awaited<ReturnType<UserApiTest['create']>>;
  let roleA: Awaited<ReturnType<OrganizationApiTest['roleApi']['create']>>;
  let roleB: Awaited<ReturnType<OrganizationApiTest['roleApi']['create']>>;
  let roleC: Awaited<ReturnType<OrganizationApiTest['roleApi']['create']>>;
  /* eslint-enable @silverhand/fp/no-let */

  beforeAll(async () => {
    /* eslint-disable @silverhand/fp/no-mutation */
    organization = await organizationApi.create({ name: generateName() });
    user = await userApi.create({ name: generateName() });
    roleA = await organizationApi.roleApi.create({ name: generateName() });
    roleB = await organizationApi.roleApi.create({ name: generateName() });
    roleC = await organizationApi.roleApi.create({ name: generateName() });
    /* eslint-enable @silverhand/fp/no-mutation */
    await organizationApi.addUsers(organization.id, [user.id]);
  });

  afterAll(async () => {
    await Promise.all([userApi.cleanUp(), organizationApi.cleanUp(), invitationApi.cleanUp()]);
  });

  it('POST reports only roles that were actually added', async () => {
    await organizationApi.addUserRoles(organization.id, user.id, [roleA.id]);
    await getWebhookResult('POST /organizations/:id/users/:userId/roles');

    webhookResults.delete('POST /organizations/:id/users/:userId/roles');

    await organizationApi.addUserRoles(organization.id, user.id, [roleA.id, roleB.id]);

    const hook = await getWebhookResult('POST /organizations/:id/users/:userId/roles');
    expect(hook?.payload).toMatchObject({
      event: 'Organization.UserRoles.Updated',
      organizationId: organization.id,
      userId: user.id,
      addedOrganizationRoleIds: [roleB.id],
      removedOrganizationRoleIds: [],
      method: 'POST',
      status: 201,
      matchedRoute: '/organizations/:id/users/:userId/roles',
    });
  });

  it('PUT reports both added and removed roles', async () => {
    webhookResults.delete('PUT /organizations/:id/users/:userId/roles');

    await organizationApi.replaceUserRoles(organization.id, user.id, [roleA.id, roleC.id]);

    const hook = await getWebhookResult('PUT /organizations/:id/users/:userId/roles');
    expect(hook?.payload).toMatchObject({
      event: 'Organization.UserRoles.Updated',
      organizationId: organization.id,
      userId: user.id,
      addedOrganizationRoleIds: [roleC.id],
      removedOrganizationRoleIds: [roleB.id],
      method: 'PUT',
      status: 204,
      matchedRoute: '/organizations/:id/users/:userId/roles',
    });
  });

  it('PUT emits nothing when the role set is unchanged', async () => {
    webhookResults.delete('PUT /organizations/:id/users/:userId/roles');

    await organizationApi.replaceUserRoles(organization.id, user.id, [roleA.id, roleC.id]);

    expect(await getWebhookResult('PUT /organizations/:id/users/:userId/roles')).toBeUndefined();
  });

  it('DELETE reports the removed role', async () => {
    webhookResults.delete('DELETE /organizations/:id/users/:userId/roles/:organizationRoleId');

    await organizationApi.deleteUserRole(organization.id, user.id, roleA.id);

    const hook = await getWebhookResult(
      'DELETE /organizations/:id/users/:userId/roles/:organizationRoleId'
    );
    expect(hook?.payload).toMatchObject({
      event: 'Organization.UserRoles.Updated',
      organizationId: organization.id,
      userId: user.id,
      addedOrganizationRoleIds: [],
      removedOrganizationRoleIds: [roleA.id],
      method: 'DELETE',
      status: 204,
      matchedRoute: '/organizations/:id/users/:userId/roles/:organizationRoleId',
    });
  });

  it('bulk POST emits one event per user', async () => {
    const users = await Promise.all([userApi.create({}), userApi.create({})]);
    await organizationApi.addUsers(
      organization.id,
      users.map(({ id }) => id)
    );

    await organizationApi.addUsersRoles(
      organization.id,
      users.map(({ id }) => id),
      [roleA.id, roleB.id]
    );

    const payloads = await waitForHookPayloads<OrganizationUserRolesPayload>(
      'Organization.UserRoles.Updated',
      (payload) =>
        payload.matchedRoute === '/organizations/:id/users/roles' &&
        users.some(({ id }) => id === payload.userId),
      users.length
    );

    expect(payloads).toHaveLength(users.length);
    for (const user of users) {
      const payload = payloads.find(({ userId }) => userId === user.id);
      expect(payload).toMatchObject({
        event: 'Organization.UserRoles.Updated',
        organizationId: organization.id,
        userId: user.id,
        removedOrganizationRoleIds: [],
      });
      expect(payload?.addedOrganizationRoleIds).toEqual(
        expect.arrayContaining([roleA.id, roleB.id])
      );
    }
  });

  it('emits organization roles granted by invitation acceptance', async () => {
    const invitee = generateEmail();
    const invitation = await invitationApi.create({
      organizationId: organization.id,
      invitee,
      expiresAt: Date.now() + 1_000_000,
      organizationRoleIds: [roleA.id],
      messagePayload: false,
    });
    const invitedUser = await userApi.create({ primaryEmail: invitee });

    await invitationApi.updateStatus(
      invitation.id,
      OrganizationInvitationStatus.Accepted,
      invitedUser.id
    );

    const payloads = await waitForHookPayloads<OrganizationUserRolesPayload>(
      'Organization.UserRoles.Updated',
      (payload) => payload.organizationId === organization.id && payload.userId === invitedUser.id,
      1
    );

    expect(payloads).toHaveLength(1);
    expect(payloads[0]).toMatchObject({
      organizationId: organization.id,
      userId: invitedUser.id,
      removedOrganizationRoleIds: [],
    });
    expect(payloads[0]?.addedOrganizationRoleIds).toEqual([roleA.id]);
  });
});

describe('JIT organization role webhooks', () => {
  const organizationApi = new OrganizationApiTest();
  const userApi = new UserApiTest();
  const ssoConnectorApi = new SsoConnectorApi();

  it('emits roles added for an existing member', async () => {
    const organization = await organizationApi.create({ name: generateName() });
    const organizationRole = await organizationApi.roleApi.create({ name: generateName() });
    const domain = `${randomString()}.example.com`;
    const connector = await ssoConnectorApi.createMockOidcConnector([domain]);
    const email = `${randomString()}@${domain}`;

    await organizationApi.jit.roles.add(organization.id, [organizationRole.id]);
    await organizationApi.jit.ssoConnectors.add(organization.id, [connector.id]);
    await updateSignInExperience({ singleSignOnEnabled: true });

    const user = await userApi.create({ primaryEmail: email });
    await organizationApi.addUsers(organization.id, [user.id]);

    const signedInUserId = await signInWithEnterpriseSso(connector.id, {
      sub: randomString(),
      email,
      email_verified: true,
    });
    expect(signedInUserId).toBe(user.id);

    const payloads = await waitForHookPayloads<OrganizationUserRolesPayload>(
      'Organization.UserRoles.Updated',
      (payload) => payload.organizationId === organization.id && payload.userId === user.id,
      1
    );

    expect(payloads).toHaveLength(1);
    expect(payloads[0]).toMatchObject({
      organizationId: organization.id,
      userId: user.id,
      removedOrganizationRoleIds: [],
    });
    expect(payloads[0]?.addedOrganizationRoleIds).toEqual([organizationRole.id]);

    await Promise.all([userApi.cleanUp(), organizationApi.cleanUp(), ssoConnectorApi.cleanUp()]);
  });
});
