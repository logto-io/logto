import { ConnectorType } from '@logto/connector-kit';
import { decodeAccessToken, decodeIdToken } from '@logto/js';
import { Prompt } from '@logto/node';
import { GrantType, MfaFactor, MfaPolicy, demoAppApplicationId } from '@logto/schemas';
import { formUrlEncodedHeaders, generateStandardId } from '@logto/shared';
import { isKeyInObject } from '@silverhand/essentials';
import ky from 'ky';
import { authenticator } from 'otplib';

import {
  createUserMfaVerification,
  deleteUser,
  updateUserLogtoConfig,
} from '#src/api/admin-user.js';
import { createResource, deleteResource } from '#src/api/resource.js';
import { updateSignInExperience } from '#src/api/sign-in-experience.js';
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
import {
  successfullyCreateAndVerifyTotp,
  successfullyVerifyTotp,
} from '#src/helpers/experience/totp-verification.js';
import { expectRejects } from '#src/helpers/index.js';
import {
  enableAllPasswordSignInMethods,
  enableMandatoryMfaWithTotp,
  enableMandatoryMfaWithTotpAndBackupCode,
  resetMfaSettings,
} from '#src/helpers/sign-in-experience.js';
import { generateNewUserProfile, UserApiTest } from '#src/helpers/user.js';
import { devFeatureTest } from '#src/utils.js';

const firstFactorAcr = 'urn:logto:acr:1fa';
const mfaAcr = 'urn:logto:acr:mfa';

const nowInSeconds = () => Math.floor(Date.now() / 1000);

/**
 * Start an authorization on a fresh client (so a sign-in is always required) that issues a
 * refresh token: the provider only issues one for `offline_access` under `prompt=consent`.
 */
const initClient = async (resources?: string[]) =>
  initExperienceClient({
    config: {
      appId: demoAppApplicationId,
      prompt: Prompt.Consent,
      scopes: ['offline_access'],
      resources,
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
    await updateSignInExperience({ adaptiveMfa: { enabled: false } });
  });

  afterAll(async () => {
    await resetMfaSettings();
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

  it('issues acr=mfa and amr=[pwd, otp, mfa] for a password sign-in verified with TOTP', async () => {
    await enableMandatoryMfaWithTotpAndBackupCode();
    const { username, password } = generateNewUserProfile({ username: true, password: true });
    const user = await userApi.create({ username, password });
    const totp = await createUserMfaVerification(user.id, MfaFactor.TOTP);
    await createUserMfaVerification(user.id, MfaFactor.BackupCode);

    if (totp.type !== MfaFactor.TOTP) {
      throw new TypeError('unexpected mfa type');
    }

    const client = await initClient();
    await identifyUserWithUsernamePassword(client, username, password);
    await successfullyVerifyTotp(client, { code: authenticator.generate(totp.secret) });
    const claims = await finishSignIn(client);

    expect(claims).toMatchObject({ acr: mfaAcr, amr: ['pwd', 'otp', 'mfa'] });
    expect(typeof claims.auth_time).toBe('number');

    await logoutClient(client);
    await resetMfaSettings();
  });

  it('issues acr=mfa and amr=[pwd, otp, mfa] when the sign-in enrolls the first TOTP of the account', async () => {
    // A factor established by the interaction and written to the account counts like one it
    // verified; this is what makes an MFA step-up satisfiable for a user without a factor.
    await enableMandatoryMfaWithTotp();
    const { username, password } = generateNewUserProfile({ username: true, password: true });
    await userApi.create({ username, password });

    const client = await initClient();
    await identifyUserWithUsernamePassword(client, username, password);
    await expectRejects(client.submitInteraction(), {
      code: 'user.missing_mfa',
      status: 422,
    });
    const totpVerificationId = await successfullyCreateAndVerifyTotp(client);
    await client.bindMfa(MfaFactor.TOTP, totpVerificationId);
    const claims = await finishSignIn(client);

    expect(claims).toMatchObject({ acr: mfaAcr, amr: ['pwd', 'otp', 'mfa'] });

    await logoutClient(client);
    await resetMfaSettings();
  });

  it('keeps the proof of the last backup code, which is marked used before submission', async () => {
    // A sign-in that completes without an MFA challenge, so the consumed code is the only proof.
    await updateSignInExperience({
      mfa: { factors: [MfaFactor.TOTP, MfaFactor.BackupCode], policy: MfaPolicy.NoPrompt },
    });
    const { username, password } = generateNewUserProfile({ username: true, password: true });
    const user = await userApi.create({ username, password });
    await createUserMfaVerification(user.id, MfaFactor.TOTP);
    const backupCodes = await createUserMfaVerification(user.id, MfaFactor.BackupCode);
    await updateUserLogtoConfig(user.id, { mfa: { skipMfaOnSignIn: true }, passkeySignIn: {} });

    if (backupCodes.type !== MfaFactor.BackupCode) {
      throw new TypeError('unexpected mfa type');
    }

    const [lastCode, ...otherCodes] = backupCodes.codes;

    // Consume every other code first; each verification marks its code used in the database.
    const consumer = await initClient();
    await identifyUserWithUsernamePassword(consumer, username, password);
    for (const code of otherCodes) {
      // eslint-disable-next-line no-await-in-loop -- Each code must be consumed in sequence.
      await consumer.verifyBackupCode({ code });
    }

    const client = await initClient();
    await identifyUserWithUsernamePassword(client, username, password);
    await client.verifyBackupCode({ code: lastCode! });
    const claims = await finishSignIn(client);

    expect(claims.sub).toBe(user.id);
    expect(claims).toMatchObject({ acr: mfaAcr, amr: ['pwd', 'otp', 'mfa'] });

    await logoutClient(client);
    await resetMfaSettings();
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
    const identifySocialUser = async (resources?: string[]) => {
      const client = await initClient(resources);
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

    it('issues amr=[fed] and no acr in ID and JWT access tokens', async () => {
      const resource = await createResource();

      try {
        const client = await identifySocialUser([resource.indicator]);
        const claims = await finishSignIn(client);

        expect(claims.sub).toBe(userId);
        expect(claims.amr).toEqual(['fed']);
        expect(claims).not.toHaveProperty('acr');
        expect(typeof claims.auth_time).toBe('number');

        const accessTokenClaims = decodeAccessToken(
          await client.getAccessToken(resource.indicator)
        );
        expect(accessTokenClaims).toMatchObject({
          sub: userId,
          amr: ['fed'],
          auth_time: claims.auth_time,
        });
        expect(accessTokenClaims).not.toHaveProperty('acr');

        await logoutClient(client);
      } finally {
        await deleteResource(resource.id);
      }
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
  });
});
