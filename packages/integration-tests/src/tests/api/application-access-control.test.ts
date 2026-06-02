import { ReservedScope } from '@logto/core-kit';
import {
  ApplicationType,
  createDefaultApplicationAccessControl,
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
import { demoAppRedirectUri, logtoUrl } from '#src/constants.js';
import { initExperienceClient } from '#src/helpers/client.js';
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

devFeatureTest.describe('application access control OIDC enforcement', () => {
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

      expect(consentResponse.status).toBe(400);
      await expect(consentResponse.json()).resolves.toMatchObject({
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
