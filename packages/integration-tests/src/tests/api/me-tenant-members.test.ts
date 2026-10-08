import { ConnectorType } from '@logto/connector-kit';
import {
  AdminTenantRole,
  InteractionEvent,
  OrganizationInvitationStatus,
  PredefinedScope,
  type Role,
  SignInIdentifier,
  TenantRole,
  adminConsoleApplicationId,
  defaultManagementApiAdminName,
  defaultTenantId,
  getTenantOrganizationId,
  getTenantRole,
} from '@logto/schemas';
import { assert } from '@silverhand/essentials';
import ky from 'ky';

import { authedAdminTenantApi, adminTenantApi } from '#src/api/api.js';
import { putSystemLicense } from '#src/api/system.js';
import { adminConsoleRedirectUri, logtoConsoleUrl } from '#src/constants.js';
import {
  createUserWithPassword,
  deleteUser,
  initClientAndSignIn,
  resourceDefault,
  resourceMe,
} from '#src/helpers/admin-tenant.js';
import { initExperienceClient, processSession } from '#src/helpers/client.js';
import { clearConnectorsByTypes, setEmailConnector } from '#src/helpers/connector.js';
import { expectRejects, readConnectorMessage } from '#src/helpers/index.js';
import { buildTestLicensePayload, signTestLicenseKey } from '#src/helpers/license.js';
import { devFeatureTest, generatePassword, generateUsername } from '#src/utils.js';

const tenantOrganizationId = getTenantOrganizationId(defaultTenantId);
const meUrl = (path: string) => new URL(`/me/${path}`, logtoConsoleUrl).href;

type Member = { id: string; organizationRoles: Array<{ id: string }> };

/** Create an admin tenant user who is a member of the tenant organization with the given role. */
const createTenantMember = async (role: TenantRole) => {
  const { user, username, password } = await createUserWithPassword();

  // Every Console user holds the admin tenant's `user` role, which grants the `me` API.
  const roles = await authedAdminTenantApi.get('roles').json<Role[]>();
  const userRole = roles.find(({ name }) => name === AdminTenantRole.User);
  assert(userRole, new Error('The admin tenant `user` role is missing.'));
  await authedAdminTenantApi.post(`roles/${userRole.id}/users`, { json: { userIds: [user.id] } });

  await authedAdminTenantApi.post(`organizations/${tenantOrganizationId}/users`, {
    json: { userIds: [user.id] },
  });
  await authedAdminTenantApi.post(`organizations/${tenantOrganizationId}/users/roles`, {
    json: { userIds: [user.id], organizationRoleIds: [getTenantRole(role).id] },
  });

  const client = await initClientAndSignIn(username, password, {
    resources: [resourceMe],
    scopes: [PredefinedScope.All],
  });
  const headers = { authorization: `Bearer ${await client.getAccessToken(resourceMe)}` };

  return { user, headers };
};

const installLicense = async (consoleCollaboration: boolean) => {
  const response = await putSystemLicense(
    await signTestLicenseKey(buildTestLicensePayload({ quota: { consoleCollaboration } }))
  );
  expect(response.status).toBe(204);
};

/**
 * Follow the invitation link as a new user would: sign up on the admin tenant with the one-time
 * token it carries, which works although the admin tenant only allows sign-in.
 */
const signUpWithInvitationLink = async (link: string, email: string) => {
  const token = new URL(link).searchParams.get('one_time_token');
  assert(token, new Error('The invitation link carries no one-time token.'));

  const client = await initExperienceClient({
    interactionEvent: InteractionEvent.SignIn,
    config: {
      endpoint: logtoConsoleUrl,
      appId: adminConsoleApplicationId,
      resources: [resourceMe, resourceDefault],
      scopes: [PredefinedScope.All],
    },
    redirectUri: adminConsoleRedirectUri,
    api: adminTenantApi,
  });
  const { verificationId } = await client.verifyOneTimeToken({
    token,
    identifier: { type: SignInIdentifier.Email, value: email },
  });
  await expectRejects(client.identifyUser({ verificationId }), {
    code: 'user.user_not_exist',
    status: 404,
  });
  await client.updateInteractionEvent({ interactionEvent: InteractionEvent.Register });
  // The admin tenant signs up with a username and a password, which the experience asks for.
  await client.updateProfile({ type: SignInIdentifier.Username, value: generateUsername() });
  await client.updateProfile({ type: 'password', value: generatePassword() });
  await client.identifyUser({ verificationId });

  const { redirectTo } = await client.submitInteraction();
  const userId = await processSession(client, redirectTo);

  return { client, userId };
};

// The tenant routes and the license are behind the self-hosted plans feature, which the instance
// under test only enables with `DEV_FEATURES_ENABLED`.
devFeatureTest.describe('me tenant members and invitations', () => {
  const inviteeEmail = `${generateUsername()}@example.com`;
  const createdUserIds: string[] = [];
  const members: Partial<Record<TenantRole, Awaited<ReturnType<typeof createTenantMember>>>> = {};

  const getMember = (role: TenantRole) => {
    const member = members[role];
    assert(member, new Error(`The ${role} member is not created.`));

    return member;
  };

  beforeAll(async () => {
    // The admin tenant has no email connector; invitations go through the default tenant's.
    await clearConnectorsByTypes([ConnectorType.Email]);
    await setEmailConnector();

    for (const role of [TenantRole.Admin, TenantRole.Collaborator]) {
      // eslint-disable-next-line no-await-in-loop
      const member = await createTenantMember(role);
      // eslint-disable-next-line @silverhand/fp/no-mutation
      members[role] = member;
      // eslint-disable-next-line @silverhand/fp/no-mutating-methods
      createdUserIds.push(member.user.id);
    }
  });

  afterAll(async () => {
    // Leave a license that grants nothing, as the license tests do.
    await installLicense(false);
    await Promise.all(createdUserIds.map(async (id) => deleteUser(id)));
  });

  it('should reject a collaborator inviting and managing members', async () => {
    await installLicense(true);
    const { headers } = getMember(TenantRole.Collaborator);
    const admin = getMember(TenantRole.Admin);

    await expectRejects(
      ky.post(meUrl('tenant/invitations'), {
        headers,
        json: { invitee: inviteeEmail, roleName: TenantRole.Admin },
      }),
      { code: 'auth.expected_role_not_found', status: 403 }
    );
    await expectRejects(ky.get(meUrl('tenant/invitations'), { headers }), {
      code: 'auth.expected_role_not_found',
      status: 403,
    });
    await expectRejects(
      ky.put(meUrl(`tenant/members/${admin.user.id}/roles`), {
        headers,
        json: { roleName: TenantRole.Admin },
      }),
      { code: 'auth.expected_role_not_found', status: 403 }
    );
    await expectRejects(ky.delete(meUrl(`tenant/members/${admin.user.id}`), { headers }), {
      code: 'auth.expected_role_not_found',
      status: 403,
    });

    // Collaborators still see who they work with.
    const listed = await ky.get(meUrl('tenant/members'), { headers }).json<Member[]>();
    expect(listed.map(({ id }) => id)).toEqual(expect.arrayContaining([admin.user.id]));
  });

  it('should refuse to invite without the license entitlement', async () => {
    await installLicense(false);

    await expectRejects(
      ky.post(meUrl('tenant/invitations'), {
        headers: getMember(TenantRole.Admin).headers,
        json: { invitee: inviteeEmail, roleName: TenantRole.Admin },
      }),
      { code: 'subscription.limit_exceeded', status: 403 }
    );
  });

  it('should invite an admin by default, let them sign up and accept, and remove their access', async () => {
    await installLicense(true);
    const { headers } = getMember(TenantRole.Admin);

    // Invite: the email goes through the default tenant's email connector.
    const [invitation] = await ky
      .post(meUrl('tenant/invitations'), {
        headers,
        json: { invitee: inviteeEmail },
      })
      .json<Array<{ id: string }>>();
    assert(invitation, new Error('No invitation is created.'));

    const invitations = await ky
      .get(meUrl('tenant/invitations'), { headers })
      .json<Array<{ id: string; status: string; inviterName?: string }>>();
    expect(invitations.find(({ id }) => id === invitation.id)).toMatchObject({
      status: OrganizationInvitationStatus.Pending,
    });

    const { address, type, payload } = await readConnectorMessage('Email');
    expect(address).toBe(inviteeEmail);
    expect(type).toBe('OrganizationInvitation');
    assert(typeof payload.link === 'string', new Error('The invitation email has no link.'));
    expect(new URL(payload.link).pathname).toBe(`/console/accept/${invitation.id}`);

    // Accept: the invitee signs up with the link, then accepts as themselves.
    const { client, userId } = await signUpWithInvitationLink(payload.link, inviteeEmail);
    // eslint-disable-next-line @silverhand/fp/no-mutating-methods
    createdUserIds.push(userId);
    const inviteeHeaders = {
      authorization: `Bearer ${await client.getAccessToken(resourceMe)}`,
    };

    await expectRejects(
      ky.get(meUrl(`invitations/${invitation.id}`), {
        headers: getMember(TenantRole.Collaborator).headers,
      }),
      { code: 'auth.expected_role_not_found', status: 403 }
    );
    await ky.patch(meUrl(`invitations/${invitation.id}/status`), {
      headers: inviteeHeaders,
      json: { status: OrganizationInvitationStatus.Accepted },
    });

    // Listed with the invited role, and with Console access to the default tenant.
    const listed = await ky.get(meUrl('tenant/members'), { headers }).json<Member[]>();
    expect(listed.find(({ id }) => id === userId)?.organizationRoles).toEqual([
      expect.objectContaining({ id: TenantRole.Admin }),
    ]);
    const userRoles = await authedAdminTenantApi.get(`users/${userId}/roles`).json<Role[]>();
    expect(userRoles.map(({ name }) => name)).toContain(defaultManagementApiAdminName);

    // Invited admins can manage invitations, just like the original admin.
    await expect(
      ky.get(meUrl('tenant/invitations'), { headers: inviteeHeaders })
    ).resolves.toHaveProperty('status', 200);

    // Remove: the member leaves the tenant, and loses Console access with it.
    await ky.delete(meUrl(`tenant/members/${userId}`), { headers });

    const remaining = await ky.get(meUrl('tenant/members'), { headers }).json<Member[]>();
    expect(remaining.map(({ id }) => id)).not.toContain(userId);
    const rolesAfter = await authedAdminTenantApi.get(`users/${userId}/roles`).json<Role[]>();
    expect(rolesAfter.map(({ name }) => name)).not.toContain(defaultManagementApiAdminName);
  });

  it('should stop the sign-in links of a resent or revoked invitation from working', async () => {
    await installLicense(true);
    const { headers } = getMember(TenantRole.Admin);
    const email = `${generateUsername()}@example.com`;

    const [invitation] = await ky
      .post(meUrl('tenant/invitations'), {
        headers,
        json: { invitee: email, roleName: TenantRole.Admin },
      })
      .json<Array<{ id: string }>>();
    assert(invitation, new Error('No invitation is created.'));
    const { payload: first } = await readConnectorMessage('Email');

    await ky.post(meUrl(`tenant/invitations/${invitation.id}/message`), { headers });
    const { payload: second } = await readConnectorMessage('Email');

    await ky.patch(meUrl(`tenant/invitations/${invitation.id}/status`), {
      headers,
      json: { status: OrganizationInvitationStatus.Revoked },
    });

    for (const { link } of [first, second]) {
      assert(typeof link === 'string', new Error('The invitation email has no link.'));
      const token = new URL(link).searchParams.get('one_time_token');
      assert(token, new Error('The invitation link carries no one-time token.'));

      // eslint-disable-next-line no-await-in-loop
      const client = await initExperienceClient({
        interactionEvent: InteractionEvent.SignIn,
        config: {
          endpoint: logtoConsoleUrl,
          appId: adminConsoleApplicationId,
          resources: [resourceMe],
          scopes: [PredefinedScope.All],
        },
        redirectUri: adminConsoleRedirectUri,
        api: adminTenantApi,
      });
      // eslint-disable-next-line no-await-in-loop
      await expectRejects(
        client.verifyOneTimeToken({
          token,
          identifier: { type: SignInIdentifier.Email, value: email },
        }),
        { code: 'one_time_token.token_revoked', status: 400 }
      );
    }
  });

  it('should refuse the whole request when any invitee already has a pending invitation', async () => {
    await installLicense(true);
    const { headers } = getMember(TenantRole.Admin);
    const pendingEmail = `${generateUsername()}@example.com`;
    const freshEmail = `${generateUsername()}@example.com`;

    await ky.post(meUrl('tenant/invitations'), {
      headers,
      json: { invitee: pendingEmail, roleName: TenantRole.Admin },
    });

    await expectRejects(
      ky.post(meUrl('tenant/invitations'), {
        headers,
        json: { invitee: [freshEmail, pendingEmail], roleName: TenantRole.Admin },
      }),
      { code: 'request.invalid_input', status: 422 }
    );

    const invitations = await ky
      .get(meUrl('tenant/invitations'), { headers })
      .json<Array<{ invitee: string }>>();
    expect(invitations.map(({ invitee }) => invitee)).not.toContain(freshEmail);
  });

  it('should never both revoke and accept one invitation', async () => {
    await installLicense(true);
    const { headers } = getMember(TenantRole.Admin);
    const email = `${generateUsername()}@example.com`;

    const [invitation] = await ky
      .post(meUrl('tenant/invitations'), {
        headers,
        json: { invitee: email, roleName: TenantRole.Admin },
      })
      .json<Array<{ id: string }>>();
    assert(invitation, new Error('No invitation is created.'));

    const { payload } = await readConnectorMessage('Email');
    assert(typeof payload.link === 'string', new Error('The invitation email has no link.'));
    const { client, userId } = await signUpWithInvitationLink(payload.link, email);
    // eslint-disable-next-line @silverhand/fp/no-mutating-methods
    createdUserIds.push(userId);
    const inviteeHeaders = { authorization: `Bearer ${await client.getAccessToken(resourceMe)}` };

    const [accepted, revoked] = await Promise.allSettled([
      ky.patch(meUrl(`invitations/${invitation.id}/status`), {
        headers: inviteeHeaders,
        json: { status: OrganizationInvitationStatus.Accepted },
      }),
      ky.patch(meUrl(`tenant/invitations/${invitation.id}/status`), {
        headers,
        json: { status: OrganizationInvitationStatus.Revoked },
      }),
    ]);

    // Exactly one wins, and membership and Console access follow the winner.
    expect(accepted.status === 'fulfilled').not.toBe(revoked.status === 'fulfilled');
    const members = await ky.get(meUrl('tenant/members'), { headers }).json<Member[]>();
    const roles = await authedAdminTenantApi.get(`users/${userId}/roles`).json<Role[]>();
    const isMember = members.some(({ id }) => id === userId);
    const hasConsoleAccess = roles.some(({ name }) => name === defaultManagementApiAdminName);

    expect(isMember).toBe(accepted.status === 'fulfilled');
    expect(hasConsoleAccess).toBe(isMember);

    if (isMember) {
      await ky.delete(meUrl(`tenant/members/${userId}`), { headers });
    }
  });

  it('should preserve a legacy invitation role until an admin explicitly promotes the member', async () => {
    await installLicense(true);
    const { headers, user } = getMember(TenantRole.Admin);
    const email = `${generateUsername()}@example.com`;

    // Seed a pending invitation as stored before invitations became admin-only.
    const invitation = await authedAdminTenantApi
      .post('organization-invitations', {
        json: {
          inviterId: user.id,
          invitee: email,
          organizationId: tenantOrganizationId,
          organizationRoleIds: [getTenantRole(TenantRole.Collaborator).id],
          expiresAt: Date.now() + 86_400_000,
          messagePayload: false,
        },
      })
      .json<{ id: string }>();

    await ky.post(meUrl(`tenant/invitations/${invitation.id}/message`), { headers });
    const { payload } = await readConnectorMessage('Email');
    assert(typeof payload.link === 'string', new Error('The invitation email has no link.'));
    const { client, userId } = await signUpWithInvitationLink(payload.link, email);
    // eslint-disable-next-line @silverhand/fp/no-mutating-methods -- Track the fixture user for cleanup.
    createdUserIds.push(userId);
    const inviteeHeaders = { authorization: `Bearer ${await client.getAccessToken(resourceMe)}` };

    await ky.patch(meUrl(`invitations/${invitation.id}/status`), {
      headers: inviteeHeaders,
      json: { status: OrganizationInvitationStatus.Accepted },
    });
    const listed = await ky.get(meUrl('tenant/members'), { headers }).json<Member[]>();
    expect(listed.find(({ id }) => id === userId)?.organizationRoles).toEqual([
      expect.objectContaining({ id: TenantRole.Collaborator }),
    ]);
    await expectRejects(ky.get(meUrl('tenant/invitations'), { headers: inviteeHeaders }), {
      code: 'auth.expected_role_not_found',
      status: 403,
    });

    await ky.put(meUrl(`tenant/members/${userId}/roles`), {
      headers,
      json: { roleName: TenantRole.Admin },
    });
    const promoted = await ky.get(meUrl('tenant/members'), { headers }).json<Member[]>();
    expect(promoted.find(({ id }) => id === userId)?.organizationRoles).toEqual([
      expect.objectContaining({ id: TenantRole.Admin }),
    ]);
    await expect(
      ky.get(meUrl('tenant/invitations'), { headers: inviteeHeaders })
    ).resolves.toHaveProperty('status', 200);
    await ky.delete(meUrl(`tenant/members/${userId}`), { headers });
  });

  it('should keep one admin when two admins leave at once', async () => {
    const first = getMember(TenantRole.Admin);
    const second = await createTenantMember(TenantRole.Admin);
    // eslint-disable-next-line @silverhand/fp/no-mutating-methods
    createdUserIds.push(second.user.id);

    // Only these two admins, so that at most one removal may pass.
    const listed = await ky
      .get(meUrl('tenant/members'), { headers: first.headers })
      .json<Member[]>();
    const otherAdmins = listed.filter(
      ({ id, organizationRoles }) =>
        ![first.user.id, second.user.id].includes(id) &&
        organizationRoles.some(({ id: roleId }) => roleId === TenantRole.Admin)
    );
    await Promise.all(
      otherAdmins.map(async ({ id }) =>
        // Adjust the fixture directly; the Console API no longer permits demotion.
        authedAdminTenantApi.put(`organizations/${tenantOrganizationId}/users/${id}/roles`, {
          json: { organizationRoleIds: [getTenantRole(TenantRole.Collaborator).id] },
        })
      )
    );

    try {
      const results = await Promise.allSettled([
        ky.delete(meUrl(`tenant/members/${first.user.id}`), {
          headers: first.headers,
        }),
        ky.delete(meUrl(`tenant/members/${second.user.id}`), {
          headers: second.headers,
        }),
      ]);

      expect(results.filter(({ status }) => status === 'fulfilled')).toHaveLength(1);
      const after = await authedAdminTenantApi
        .get(`organizations/${tenantOrganizationId}/users`, {
          searchParams: { organizationRoleId: getTenantRole(TenantRole.Admin).id },
        })
        .json<Array<{ id: string }>>();
      expect(after).toHaveLength(1);
    } finally {
      await Promise.all(
        otherAdmins.map(async ({ id, organizationRoles }) =>
          authedAdminTenantApi.put(`organizations/${tenantOrganizationId}/users/${id}/roles`, {
            json: { organizationRoleIds: organizationRoles.map(({ id }) => id) },
          })
        )
      );
    }
  });
});
