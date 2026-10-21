import { UserScope } from '@logto/core-kit';
import { ApplicationType, InteractionEvent, SignInIdentifier } from '@logto/schemas';
import ky from 'ky';

import { assignUserConsentScopes } from '#src/api/application-user-consent-scope.js';
import { createApplicationWithSecret, deleteApplication } from '#src/api/application.js';
import { ExperienceClient } from '#src/client/experience/index.js';
import { logtoUrl } from '#src/constants.js';
import { enableAllPasswordSignInMethods } from '#src/helpers/sign-in-experience.js';
import { generateNewUserProfile, UserApiTest } from '#src/helpers/user.js';
import { devFeatureTest } from '#src/utils.js';

const followRedirect = async (client: ExperienceClient, redirectTo: string) =>
  ky.get(redirectTo, {
    headers: { cookie: client.getCookieHeader(new URL(redirectTo).pathname) },
    redirect: 'manual',
    throwHttpErrors: false,
  });

devFeatureTest.describe('POST /experience/abort', () => {
  const redirectUri = 'http://example.com/callback';
  const state = 'abort-at-consent-state';
  const userApi = new UserApiTest();
  const userProfile = generateNewUserProfile({ username: true, password: true });

  // A third-party application that requires the `profile` scope, so a completed sign-in lands on
  // the consent step instead of returning to the client.
  const bootstrapApplication = async () => {
    const application = await createApplicationWithSecret(
      'abort-at-consent-app',
      ApplicationType.Traditional,
      {
        isThirdParty: true,
        oidcClientMetadata: {
          redirectUris: [redirectUri],
          postLogoutRedirectUris: [],
        },
      }
    );

    await assignUserConsentScopes(application.id, { userScopes: [UserScope.Profile] });

    return application;
  };

  /** Start an authorization with a known `state` and keep the cookies it sets. */
  const startAuthorization = async (client: ExperienceClient, clientId: string) => {
    const search = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'openid profile offline_access',
      state,
      // The authorization is never exchanged for tokens, so a fixed valid PKCE challenge suffices.
      code_challenge: 'a'.repeat(43),
      code_challenge_method: 'S256',
    });

    const response = await ky.get(`${logtoUrl}/oidc/auth?${search.toString()}`, {
      redirect: 'manual',
      throwHttpErrors: false,
    });
    client.mergeRawCookies(response.headers.getSetCookie());

    return response;
  };

  beforeAll(async () => {
    await enableAllPasswordSignInMethods();
    await userApi.create(userProfile);
  });

  afterAll(async () => {
    await userApi.cleanUp();
  });

  it('aborts at the consent step and returns access_denied with the original state', async () => {
    const application = await bootstrapApplication();

    try {
      const client = new ExperienceClient({
        appId: application.id,
        appSecret: application.secret,
      });

      const authorizationResponse = await startAuthorization(client, application.id);
      expect(authorizationResponse.status).toBe(303);
      expect(authorizationResponse.headers.get('location')?.startsWith('/sign-in')).toBe(true);

      await client.initInteraction({ interactionEvent: InteractionEvent.SignIn });

      const { verificationId } = await client.verifyPassword({
        identifier: { type: SignInIdentifier.Username, value: userProfile.username },
        password: userProfile.password,
      });
      await client.identifyUser({ verificationId });

      const { redirectTo } = await client.submitInteraction();
      const consentResponse = await followRedirect(client, redirectTo);
      client.mergeRawCookies(consentResponse.headers.getSetCookie());

      expect(consentResponse.status).toBe(303);
      expect(consentResponse.headers.get('location')).toBe(`/consent?app_id=${application.id}`);

      const { redirectTo: abortRedirectTo } = await ky
        .post(`${logtoUrl}/api/experience/abort`, {
          headers: { cookie: client.getCookieHeader() },
          json: { reason: 'User cancelled the consent' },
        })
        .json<{ redirectTo: string }>();
      const resumeResponse = await followRedirect(client, abortRedirectTo);

      expect(resumeResponse.status).toBe(303);

      const location = new URL(resumeResponse.headers.get('location') ?? '');
      expect(`${location.origin}${location.pathname}`).toBe(redirectUri);
      expect(location.searchParams.get('error')).toBe('access_denied');
      expect(location.searchParams.get('error_description')).toBe('User cancelled the consent');
      expect(location.searchParams.get('state')).toBe(state);
      expect(location.searchParams.get('iss')).toBe(`${logtoUrl}/oidc`);
    } finally {
      await deleteApplication(application.id);
    }
  });
});
