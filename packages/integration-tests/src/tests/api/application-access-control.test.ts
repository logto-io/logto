import { ReservedScope } from '@logto/core-kit';
import {
  type ApplicationAccessControl,
  ApplicationType,
  createDefaultApplicationAccessControl,
  RoleType,
  SignInIdentifier,
} from '@logto/schemas';
import { assert } from '@silverhand/essentials';
import ky from 'ky';

import { oidcApi } from '#src/api/api.js';
import {
  createApplication,
  deleteApplication,
  replaceApplicationAccessControl,
  updateApplication,
} from '#src/api/application.js';
import { assignUsersToRole, createRole, deleteRole } from '#src/api/role.js';
import { demoAppRedirectUri, logtoUrl } from '#src/constants.js';
import { initExperienceClient } from '#src/helpers/client.js';
import { OrganizationApiTest } from '#src/helpers/organization.js';
import {
  createDefaultTenantUserWithPassword,
  deleteDefaultTenantUser,
} from '#src/helpers/profile.js';
import { devFeatureTest, generateTestName } from '#src/utils.js';

const signInAndGetRefreshToken = async ({
  appId,
  username,
  password,
}: {
  appId: string;
  username: string;
  password: string;
}) => {
  const client = await initExperienceClient({
    config: {
      appId,
      scopes: [ReservedScope.OfflineAccess],
    },
    redirectUri: demoAppRedirectUri,
  });

  const { verificationId } = await client.verifyPassword({
    identifier: {
      type: SignInIdentifier.Username,
      value: username,
    },
    password,
  });

  await client.identifyUser({ verificationId });

  const { redirectTo } = await client.submitInteraction();
  await client.processSession(redirectTo);

  return client.getRefreshToken();
};

const assertRefreshTokenExchangeAllowed = async (
  configureAccessControl: (
    applicationId: string,
    userId: string
  ) => Promise<ApplicationAccessControl>
) => {
  const { user, username, password } = await createDefaultTenantUserWithPassword();
  const application = await createApplication(generateTestName(), ApplicationType.SPA, {
    oidcClientMetadata: {
      redirectUris: [demoAppRedirectUri],
      postLogoutRedirectUris: [],
    },
    customClientMetadata: {
      alwaysIssueRefreshToken: true,
    },
  });

  try {
    await replaceApplicationAccessControl(
      application.id,
      await configureAccessControl(application.id, user.id)
    );
    await updateApplication(application.id, { appLevelAccessControlEnabled: true });

    const refreshToken = await signInAndGetRefreshToken({
      appId: application.id,
      username,
      password,
    });
    assert(refreshToken, new Error('Refresh token should be issued'));

    const response = await oidcApi.post('token', {
      body: new URLSearchParams({
        client_id: application.id,
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }),
      throwHttpErrors: false,
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toHaveProperty('access_token');
  } finally {
    await Promise.allSettled([deleteApplication(application.id), deleteDefaultTenantUser(user.id)]);
  }
};

devFeatureTest.describe('application access control OIDC enforcement', () => {
  it('allows refresh token exchange through each app access rule type', async () => {
    const organizationApi = new OrganizationApiTest();
    const userRole = await createRole({ type: RoleType.User });

    try {
      await assertRefreshTokenExchangeAllowed(async (_applicationId, userId) => ({
        ...createDefaultApplicationAccessControl(),
        userIds: [userId],
      }));

      await assertRefreshTokenExchangeAllowed(async (_applicationId, userId) => {
        await assignUsersToRole([userId], userRole.id);

        return {
          ...createDefaultApplicationAccessControl(),
          userRoleIds: [userRole.id],
        };
      });

      await assertRefreshTokenExchangeAllowed(async (_applicationId, userId) => {
        const organization = await organizationApi.create({ name: generateTestName() });
        await organizationApi.addUsers(organization.id, [userId]);

        return {
          ...createDefaultApplicationAccessControl(),
          organizationIds: [organization.id],
        };
      });

      await assertRefreshTokenExchangeAllowed(async (_applicationId, userId) => {
        const [organization, organizationRole] = await Promise.all([
          organizationApi.create({ name: generateTestName() }),
          organizationApi.roleApi.create({ name: generateTestName(), type: RoleType.User }),
        ]);
        await organizationApi.addUsers(organization.id, [userId]);
        await organizationApi.addUserRoles(organization.id, userId, [organizationRole.id]);

        return {
          ...createDefaultApplicationAccessControl(),
          organizationRoleRules: [
            {
              organizationId: organization.id,
              organizationRoleIds: [organizationRole.id],
            },
          ],
        };
      });
    } finally {
      await Promise.allSettled([organizationApi.cleanUp(), deleteRole(userRole.id)]);
    }
  });

  it('denies refresh token exchange after app access is revoked', async () => {
    const [{ user, username, password }, allowedUser] = await Promise.all([
      createDefaultTenantUserWithPassword(),
      createDefaultTenantUserWithPassword(),
    ]);

    const application = await createApplication(generateTestName(), ApplicationType.SPA, {
      oidcClientMetadata: {
        redirectUris: [demoAppRedirectUri],
        postLogoutRedirectUris: [],
      },
      customClientMetadata: {
        alwaysIssueRefreshToken: true,
      },
    });

    try {
      await replaceApplicationAccessControl(application.id, {
        ...createDefaultApplicationAccessControl(),
        userIds: [user.id],
      });
      await updateApplication(application.id, { appLevelAccessControlEnabled: true });

      const refreshToken = await signInAndGetRefreshToken({
        appId: application.id,
        username,
        password,
      });
      assert(refreshToken, new Error('Refresh token should be issued'));

      await replaceApplicationAccessControl(application.id, {
        ...createDefaultApplicationAccessControl(),
        userIds: [allowedUser.user.id],
      });

      const response = await oidcApi.post('token', {
        body: new URLSearchParams({
          client_id: application.id,
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
        }),
        throwHttpErrors: false,
      });

      expect(response.status).toBe(400);
      await expect(response.json()).resolves.toMatchObject({
        code: 'oidc.access_denied',
        error: 'access_denied',
      });
    } finally {
      await Promise.allSettled([
        deleteApplication(application.id),
        deleteDefaultTenantUser(user.id),
        deleteDefaultTenantUser(allowedUser.user.id),
      ]);
    }
  });

  it('denies the consent step when the signed-in user has no app access', async () => {
    const [{ user, username, password }, allowedUser] = await Promise.all([
      createDefaultTenantUserWithPassword(),
      createDefaultTenantUserWithPassword(),
    ]);

    const application = await createApplication(generateTestName(), ApplicationType.SPA, {
      oidcClientMetadata: {
        redirectUris: [demoAppRedirectUri],
        postLogoutRedirectUris: [],
      },
    });

    try {
      await replaceApplicationAccessControl(application.id, {
        ...createDefaultApplicationAccessControl(),
        userIds: [allowedUser.user.id],
      });
      await updateApplication(application.id, { appLevelAccessControlEnabled: true });

      const client = await initExperienceClient({
        config: {
          appId: application.id,
        },
        redirectUri: demoAppRedirectUri,
      });

      const { verificationId } = await client.verifyPassword({
        identifier: {
          type: SignInIdentifier.Username,
          value: username,
        },
        password,
      });

      await client.identifyUser({ verificationId });

      const { redirectTo } = await client.submitInteraction();
      const authResponse = await ky.get(redirectTo, {
        headers: {
          cookie: client.interactionCookie,
        },
        redirect: 'manual',
        throwHttpErrors: false,
      });

      expect(authResponse.status).toBe(303);
      expect(authResponse.headers.get('location')).toBe(`/consent?app_id=${application.id}`);
      client.assignRawCookies(authResponse.headers.getSetCookie());

      const consentResponse = await ky.get(`${logtoUrl}/consent`, {
        headers: {
          cookie: client.interactionCookie,
        },
        redirect: 'manual',
        throwHttpErrors: false,
      });

      expect(consentResponse.status).toBe(200);

      const consentInfoResponse = await ky.get(`${logtoUrl}/api/interaction/consent`, {
        headers: {
          cookie: client.interactionCookie,
        },
        throwHttpErrors: false,
      });

      expect(consentInfoResponse.status).toBe(400);
      await expect(consentInfoResponse.json()).resolves.toMatchObject({
        code: 'oidc.access_denied',
      });
    } finally {
      await Promise.allSettled([
        deleteApplication(application.id),
        deleteDefaultTenantUser(user.id),
        deleteDefaultTenantUser(allowedUser.user.id),
      ]);
    }
  });
});
