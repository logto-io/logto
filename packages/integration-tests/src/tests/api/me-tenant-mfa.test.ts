import {
  AdminTenantRole,
  type Role,
  PredefinedScope,
  SignInIdentifier,
  TenantRole,
  adminConsoleApplicationId,
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
  resourceMe,
} from '#src/helpers/admin-tenant.js';
import { initExperienceClient } from '#src/helpers/client.js';
import { expectRejects } from '#src/helpers/index.js';
import { buildTestLicensePayload, signTestLicenseKey } from '#src/helpers/license.js';
import { devFeatureTest } from '#src/utils.js';

const tenantOrganizationId = getTenantOrganizationId(defaultTenantId);
const tenantMfaUrl = new URL('/me/tenant/mfa', logtoConsoleUrl).href;
const membersWithoutMfaUrl = new URL('/me/tenant/members-without-mfa', logtoConsoleUrl).href;

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

  return { user, username, password, headers };
};

const installLicense = async (mandatoryMfa: boolean) => {
  const response = await putSystemLicense(
    await signTestLicenseKey(buildTestLicensePayload({ quota: { mandatoryMfa } }))
  );
  expect(response.status).toBe(204);
};

// The tenant routes and the license are behind the self-hosted plans feature, which the instance
// under test only enables with `DEV_FEATURES_ENABLED`.
devFeatureTest.describe('me tenant MFA', () => {
  const members = new Map<TenantRole, Awaited<ReturnType<typeof createTenantMember>>>();

  const getMember = (role: TenantRole) => {
    const member = members.get(role);

    if (!member) {
      throw new Error(`The ${role} member is not created.`);
    }

    return member;
  };

  beforeAll(async () => {
    const roles = [TenantRole.Admin, TenantRole.Collaborator];
    const created = await Promise.all(roles.map(async (role) => createTenantMember(role)));

    for (const [index, role] of roles.entries()) {
      members.set(role, created[index]!);
    }
  });

  afterAll(async () => {
    // Never leave the requirement on: every other test signs in to the admin tenant.
    await ky.patch(tenantMfaUrl, {
      headers: getMember(TenantRole.Admin).headers,
      json: { isMfaRequired: false },
    });
    // Leave a license that grants nothing, as the license tests do.
    await installLicense(false);
    await Promise.all([...members.values()].map(async ({ user }) => deleteUser(user.id)));
  });

  it('should reject a request without the me token', async () => {
    await expectRejects(ky.get(tenantMfaUrl), {
      code: 'auth.authorization_header_missing',
      status: 401,
    });
  });

  it('should reject a collaborator changing the requirement', async () => {
    await installLicense(true);

    await expectRejects(
      ky.patch(tenantMfaUrl, {
        headers: getMember(TenantRole.Collaborator).headers,
        json: { isMfaRequired: true },
      }),
      { code: 'auth.forbidden', status: 403 }
    );
    await expectRejects(
      ky.get(membersWithoutMfaUrl, { headers: getMember(TenantRole.Collaborator).headers }),
      {
        code: 'auth.forbidden',
        status: 403,
      }
    );
  });

  it('should refuse to require MFA without the license entitlement', async () => {
    await installLicense(false);

    await expectRejects(
      ky.patch(tenantMfaUrl, {
        headers: getMember(TenantRole.Admin).headers,
        json: { isMfaRequired: true },
      }),
      { code: 'subscription.limit_exceeded', status: 403 }
    );
  });

  it('should list the members without MFA to an admin', async () => {
    const membersWithoutMfa = await ky
      .get(membersWithoutMfaUrl, { headers: getMember(TenantRole.Admin).headers })
      .json<Array<{ id: string }>>();

    expect(membersWithoutMfa.map(({ id }) => id)).toEqual(
      expect.arrayContaining([...members.values()].map(({ user }) => user.id))
    );
  });

  it('should require MFA, and challenge a member without it at the next sign-in', async () => {
    await installLicense(true);
    const admin = getMember(TenantRole.Admin);
    const collaborator = getMember(TenantRole.Collaborator);

    const updated = await ky
      .patch(tenantMfaUrl, { headers: admin.headers, json: { isMfaRequired: true } })
      .json();
    expect(updated).toEqual({ isMfaRequired: true });

    // Signed-in members keep their session, and learn that they have to set up MFA.
    await expect(ky.get(tenantMfaUrl, { headers: collaborator.headers }).json()).resolves.toEqual({
      isMfaRequired: true,
      hasMfaConfigured: false,
      isMember: true,
      isAdmin: false,
    });

    // The next sign-in stops them until they set it up.
    const client = await initExperienceClient({
      config: { endpoint: logtoConsoleUrl, appId: adminConsoleApplicationId },
      redirectUri: adminConsoleRedirectUri,
      api: adminTenantApi,
    });
    const { verificationId } = await client.verifyPassword({
      identifier: { type: SignInIdentifier.Username, value: collaborator.username },
      password: collaborator.password,
    });
    await client.identifyUser({ verificationId });
    await expectRejects(client.submitInteraction(), { code: 'user.missing_mfa', status: 422 });

    // Turning it off lets them in again.
    const disabled = await ky
      .patch(tenantMfaUrl, { headers: admin.headers, json: { isMfaRequired: false } })
      .json();
    expect(disabled).toEqual({ isMfaRequired: false });
    await expect(
      initClientAndSignIn(collaborator.username, collaborator.password)
    ).resolves.toBeTruthy();
  });
});
