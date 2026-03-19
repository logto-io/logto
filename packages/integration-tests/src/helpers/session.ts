import { ReservedScope, UserScope } from '@logto/core-kit';
import { fetchTokenByRefreshToken } from '@logto/js';
import { ApplicationType, SignInIdentifier, type GetUserSessionsResponse } from '@logto/schemas';
import { assert } from '@silverhand/essentials';

import { assignUserConsentScopes } from '#src/api/application-user-consent-scope.js';
import { createApplication } from '#src/api/application.js';
import { consent } from '#src/api/interaction.js';
import { defaultConfig } from '#src/client/index.js';
import { demoAppRedirectUri } from '#src/constants.js';
import { initExperienceClient, processSession } from '#src/helpers/client.js';
import { generateTestName } from '#src/utils.js';

const defaultScopes = [ReservedScope.OfflineAccess];

const userScopeValues = new Set<string>(Object.values(UserScope));

const pickUserScopes = (scopes: string[]) =>
  scopes.filter((scope): scope is UserScope => userScopeValues.has(scope));

type CreateAppAndSignInOptions = {
  username: string;
  password: string;
  isThirdParty?: boolean;
  scopes?: string[];
  appType?: ApplicationType;
  appName?: string;
  redirectUri?: string;
};

type UserSession = GetUserSessionsResponse['sessions'][number];

export const findSessionByAppId = (sessions: UserSession[], appId: string) =>
  sessions.find((session) => session.payload.authorizations?.[appId]);

const tokenEndpoint = `${defaultConfig.endpoint}/oidc/token`;

export const assertRefreshTokenInvalidGrant = async (options: {
  clientId: string;
  refreshToken: string;
}): Promise<void> => {
  await fetchTokenByRefreshToken(
    {
      clientId: options.clientId,
      tokenEndpoint,
      refreshToken: options.refreshToken,
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async (...args: Parameters<typeof fetch>): Promise<any> => {
      const response = await fetch(...args);
      expect(response.status).toBe(400);
      const body: unknown = await response.json();
      expect(body).toMatchObject({
        error: 'invalid_grant',
        error_description: 'grant request is invalid',
      });

      return body;
    }
  );
};

export const assertRefreshTokenValid = async (options: {
  clientId: string;
  refreshToken: string;
}): Promise<void> => {
  await fetchTokenByRefreshToken(
    {
      clientId: options.clientId,
      tokenEndpoint,
      refreshToken: options.refreshToken,
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async (...args: Parameters<typeof fetch>): Promise<any> => {
      const response = await fetch(...args);
      assert(response.ok, new Error('Refresh token exchange failed'));

      // Response body is not needed for the assertion.
      return {};
    }
  );
};

export const createAppAndSignInWithPassword = async ({
  username,
  password,
  isThirdParty = false,
  scopes = defaultScopes,
  appType = ApplicationType.SPA,
  appName = generateTestName(),
  redirectUri = demoAppRedirectUri,
}: CreateAppAndSignInOptions) => {
  const app = await createApplication(appName, appType, {
    isThirdParty,
    oidcClientMetadata: {
      redirectUris: [redirectUri],
      postLogoutRedirectUris: [],
    },
    customClientMetadata: {
      alwaysIssueRefreshToken: true,
    },
  });

  const mergedScopes = Array.from(new Set([...defaultScopes, ...scopes]));
  const userScopes = pickUserScopes(mergedScopes);

  if (isThirdParty && userScopes.length > 0) {
    await assignUserConsentScopes(app.id, {
      userScopes,
    });
  }

  const signIn = async () => {
    const appSecret = appType === ApplicationType.Traditional ? app.secret : undefined;
    const client = await initExperienceClient({
      config: {
        appId: app.id,
        ...(appSecret ? { appSecret } : {}),
        scopes: mergedScopes,
      },
      redirectUri,
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

    if (isThirdParty) {
      await client.processSession(redirectTo, false);
      const { redirectTo: consentRedirectTo } = await consent(client.interactionCookie);
      await client.manualConsent(consentRedirectTo);
    } else {
      await processSession(client, redirectTo);
    }

    return {
      client,
      refreshToken: await client.getRefreshToken(),
    };
  };

  const initialSignIn = await signIn();

  return {
    app,
    signIn,
    ...initialSignIn,
  };
};
