import { ConnectorType } from '@logto/connector-kit';
import { decodeIdToken } from '@logto/js';
import { Prompt } from '@logto/node';
import { GrantType, SignInIdentifier, demoAppApplicationId } from '@logto/schemas';
import { formUrlEncodedHeaders, generateStandardId } from '@logto/shared';
import { isKeyInObject } from '@silverhand/essentials';
import ky from 'ky';

import { deleteUser } from '#src/api/admin-user.js';
import { type ExperienceClient } from '#src/client/experience/index.js';
import { demoAppRedirectUri, logtoUrl } from '#src/constants.js';
import { initExperienceClient, logoutClient, processSession } from '#src/helpers/client.js';
import { clearConnectorsByTypes, setSocialConnector } from '#src/helpers/connector.js';
import {
  identifyUserWithUsernamePassword,
  signInWithSocial,
} from '#src/helpers/experience/index.js';
import {
  successfullyCreateSocialVerification,
  successfullyVerifySocialAuthorization,
} from '#src/helpers/experience/social-verification.js';
import { expectRejects } from '#src/helpers/index.js';
import { enableAllPasswordSignInMethods } from '#src/helpers/sign-in-experience.js';
import { generateNewUserProfile, UserApiTest } from '#src/helpers/user.js';
import { devFeatureTest } from '#src/utils.js';

const firstFactorAcr = 'urn:logto:acr:1fa';

const nowInSeconds = () => Math.floor(Date.now() / 1000);

/**
 * Start an authorization on a fresh client (so a sign-in is always required) that issues a
 * refresh token: the provider only issues one for `offline_access` under `prompt=consent`.
 */
const initClient = async () =>
  initExperienceClient({
    config: {
      appId: demoAppApplicationId,
      prompt: Prompt.Consent,
      scopes: ['offline_access'],
    },
    redirectUri: demoAppRedirectUri,
  });

const finishSignIn = async (client: ExperienceClient) => {
  const { redirectTo } = await client.submitInteraction();
  await processSession(client, redirectTo);
  return client.getIdTokenClaims();
};

/** Rotate the refresh token through the token endpoint and decode the new ID token. */
const refreshIdToken = async (client: ExperienceClient) => {
  const refreshToken = await client.getRefreshToken();
  const json = await ky
    .post(`${logtoUrl}/oidc/token`, {
      headers: formUrlEncodedHeaders,
      body: new URLSearchParams({
        grant_type: GrantType.RefreshToken,
        client_id: demoAppApplicationId,
        refresh_token: refreshToken ?? '',
      }),
    })
    .json();

  if (!isKeyInObject(json, 'id_token') || typeof json.id_token !== 'string') {
    throw new TypeError('The refresh token grant did not return an ID token');
  }

  return decodeIdToken(json.id_token);
};

devFeatureTest.describe('authentication context claims on sign-in', () => {
  const userApi = new UserApiTest();

  beforeAll(async () => {
    await enableAllPasswordSignInMethods();
  });

  afterAll(async () => {
    await userApi.cleanUp();
  });

  it('issues acr=1fa, amr=[pwd], and a fresh auth_time for a password sign-in, preserved across refresh', async () => {
    const { username, password } = generateNewUserProfile({ username: true, password: true });
    await userApi.create({ username, password });
    const client = await initClient();
    const before = nowInSeconds();

    await identifyUserWithUsernamePassword(client, username, password);
    const claims = await finishSignIn(client);

    expect(claims).toMatchObject({ acr: firstFactorAcr, amr: ['pwd'] });
    expect(claims.auth_time).toBeGreaterThanOrEqual(before);
    expect(claims.auth_time).toBeLessThanOrEqual(nowInSeconds());

    // Refreshing never makes the authentication more recent.
    await new Promise((resolve) => {
      setTimeout(resolve, 1100);
    });
    const refreshed = await refreshIdToken(client);
    expect(refreshed).toMatchObject({
      acr: firstFactorAcr,
      amr: ['pwd'],
      auth_time: claims.auth_time,
    });

    await logoutClient(client);
  });

  describe('social sign-in', () => {
    // eslint-disable-next-line @silverhand/fp/no-let
    let connectorId: string;
    // eslint-disable-next-line @silverhand/fp/no-let
    let socialUserId: string;
    // eslint-disable-next-line @silverhand/fp/no-let
    let userId: string;

    beforeAll(async () => {
      // Let a social user register without a username or password.
      await enableAllPasswordSignInMethods({ identifiers: [], password: false, verify: false });
      await clearConnectorsByTypes([ConnectorType.Social]);
      // eslint-disable-next-line @silverhand/fp/no-mutation
      ({ id: connectorId } = await setSocialConnector());
      // eslint-disable-next-line @silverhand/fp/no-mutation
      socialUserId = generateStandardId();
      // Register the social user first; only a sign-in seeds the authentication context.
      // eslint-disable-next-line @silverhand/fp/no-mutation
      userId = await signInWithSocial(connectorId, { id: socialUserId }, { registerNewUser: true });
    });

    afterAll(async () => {
      await clearConnectorsByTypes([ConnectorType.Social]);
      await deleteUser(userId);
      await enableAllPasswordSignInMethods();
    });

    /** Start a sign-in on a fresh client and identify the social user without submitting. */
    const identifySocialUser = async () => {
      const client = await initClient();
      const state = 'state';
      const redirectUri = 'http://localhost:3000';
      const { verificationId } = await successfullyCreateSocialVerification(client, connectorId, {
        redirectUri,
        state,
      });
      await successfullyVerifySocialAuthorization(client, connectorId, {
        verificationId,
        connectorData: { state, redirectUri, code: 'fake_code', userId: socialUserId },
      });
      await client.identifyUser({ verificationId });
      return client;
    };

    it('issues amr=[fed] and no acr', async () => {
      const client = await identifySocialUser();
      const claims = await finishSignIn(client);

      expect(claims.sub).toBe(userId);
      expect(claims.amr).toEqual(['fed']);
      expect(claims).not.toHaveProperty('acr');
      expect(typeof claims.auth_time).toBe('number');

      await logoutClient(client);
    });

    it('keeps fed on the sign-in that links the identity to an existing account', async () => {
      const { primaryEmail } = generateNewUserProfile({ primaryEmail: true });
      const existingUser = await userApi.create({ primaryEmail });
      const linkingSocialUserId = generateStandardId();

      const client = await initClient();
      const state = 'state';
      const redirectUri = 'http://localhost:3000';
      const { verificationId } = await successfullyCreateSocialVerification(client, connectorId, {
        redirectUri,
        state,
      });
      await successfullyVerifySocialAuthorization(client, connectorId, {
        verificationId,
        connectorData: {
          state,
          redirectUri,
          code: 'fake_code',
          userId: linkingSocialUserId,
          email: primaryEmail,
        },
      });
      // The identity is not stored yet; the user is identified by the related email and the
      // link is written by the submission.
      await client.identifyUser({ verificationId, linkSocialIdentity: true });
      const claims = await finishSignIn(client);

      expect(claims.sub).toBe(existingUser.id);
      expect(claims.amr).toEqual(['fed']);
      expect(claims).not.toHaveProperty('acr');
      expect(typeof claims.auth_time).toBe('number');

      await logoutClient(client);
    });

    it('refuses a registration password in a sign-in interaction', async () => {
      const { username, password } = generateNewUserProfile({ username: true, password: true });
      const client = await identifySocialUser();

      // A password proposed for an unused username never authenticates the identified account, so
      // the route only accepts it in a Register interaction.
      await expectRejects(
        client.createNewPasswordIdentityVerification({
          identifier: { type: SignInIdentifier.Username, value: username },
          password,
        }),
        { code: 'session.invalid_interaction_type', status: 400 }
      );

      const claims = await finishSignIn(client);
      expect(claims.sub).toBe(userId);
      expect(claims.amr).toEqual(['fed']);
      expect(claims).not.toHaveProperty('acr');

      await logoutClient(client);
    });
  });
});
