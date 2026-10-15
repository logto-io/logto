import { ConnectorType } from '@logto/connector-kit';
import { Prompt } from '@logto/node';
import {
  InteractionEvent,
  MfaFactor,
  SignInIdentifier,
  demoAppApplicationId,
} from '@logto/schemas';
import { generateStandardId } from '@logto/shared';

import { deleteUser } from '#src/api/admin-user.js';
import { updateSignInExperience } from '#src/api/sign-in-experience.js';
import { type ExperienceClient } from '#src/client/experience/index.js';
import { demoAppRedirectUri } from '#src/constants.js';
import { initExperienceClient, logoutClient, processSession } from '#src/helpers/client.js';
import {
  clearConnectorsByTypes,
  setEmailConnector,
  setSmsConnector,
  setSocialConnector,
} from '#src/helpers/connector.js';
import {
  successfullyCreateSocialVerification,
  successfullyVerifySocialAuthorization,
} from '#src/helpers/experience/social-verification.js';
import { successfullyCreateAndVerifyTotp } from '#src/helpers/experience/totp-verification.js';
import {
  successfullySendVerificationCode,
  successfullyVerifyVerificationCode,
} from '#src/helpers/experience/verification-code.js';
import { expectRejects } from '#src/helpers/index.js';
import {
  enableAllPasswordSignInMethods,
  enableAllVerificationCodeSignInMethods,
  enableMandatoryMfaWithTotp,
  resetMfaSettings,
  resetPasswordPolicy,
} from '#src/helpers/sign-in-experience.js';
import { generateNewUserProfile } from '#src/helpers/user.js';
import { devFeatureTest } from '#src/utils.js';

const firstFactorAcr = 'urn:logto:acr:1fa';
const mfaAcr = 'urn:logto:acr:mfa';

const nowInSeconds = () => Math.floor(Date.now() / 1000);

const registerClient = async () =>
  initExperienceClient({ interactionEvent: InteractionEvent.Register });

/** Start a sign-in on a fresh client, as a social user who turns out to be new would. */
const initClient = async () =>
  initExperienceClient({
    config: { appId: demoAppApplicationId, prompt: Prompt.Consent, scopes: ['offline_access'] },
    redirectUri: demoAppRedirectUri,
  });

/** Verify a registration password for a fresh username and create the account with it. */
const registerWithUsernamePassword = async (client: ExperienceClient) => {
  const { username, password } = generateNewUserProfile({ username: true, password: true });
  const { verificationId } = await client.createNewPasswordIdentityVerification({
    identifier: { type: SignInIdentifier.Username, value: username },
    password,
  });
  await client.identifyUser({ verificationId });
};

/** Submit the registration, read the ID token claims, and delete the account. */
const finishRegistration = async (client: ExperienceClient) => {
  const { redirectTo } = await client.submitInteraction();
  await processSession(client, redirectTo);
  const claims = await client.getIdTokenClaims();
  await logoutClient(client);
  await deleteUser(claims.sub);
  return claims;
};

/**
 * A registration creates the account from the interaction's records, so every credential it
 * establishes is a proof of that account and the ID token carries it like a sign-in would.
 */
devFeatureTest.describe('authentication context claims on registration', () => {
  beforeAll(async () => {
    await enableAllPasswordSignInMethods();
    await updateSignInExperience({ adaptiveMfa: { enabled: false } });
  });

  afterAll(async () => {
    await resetMfaSettings();
  });

  describe('username and password', () => {
    beforeAll(async () => {
      // Disable the password policy so the generated password is accepted.
      await updateSignInExperience({
        signUp: { identifiers: [SignInIdentifier.Username], password: true, verify: false },
        passwordPolicy: {},
      });
    });

    afterAll(async () => {
      await resetPasswordPolicy();
      await enableAllPasswordSignInMethods();
    });

    it('issues acr=1fa, amr=[pwd], and a fresh auth_time for the password the account was created with', async () => {
      const client = await registerClient();
      const before = nowInSeconds();
      await registerWithUsernamePassword(client);

      const claims = await finishRegistration(client);

      expect(claims).toMatchObject({ acr: firstFactorAcr, amr: ['pwd'] });
      expect(claims.auth_time).toBeGreaterThanOrEqual(before);
      expect(claims.auth_time).toBeLessThanOrEqual(nowInSeconds());
    });

    it('issues acr=mfa and amr=[pwd, otp, mfa] when the registration enrolls a mandatory TOTP', async () => {
      await enableMandatoryMfaWithTotp();
      const client = await registerClient();
      await registerWithUsernamePassword(client);

      await expectRejects(client.submitInteraction(), {
        code: 'user.missing_mfa',
        status: 422,
      });
      const totpVerificationId = await successfullyCreateAndVerifyTotp(client);
      await client.bindMfa(MfaFactor.TOTP, totpVerificationId);

      const claims = await finishRegistration(client);

      expect(claims).toMatchObject({ acr: mfaAcr, amr: ['pwd', 'otp', 'mfa'] });

      await resetMfaSettings();
    });
  });

  describe('verification code', () => {
    beforeAll(async () => {
      await clearConnectorsByTypes([ConnectorType.Email, ConnectorType.Sms]);
      await Promise.all([setEmailConnector(), setSmsConnector()]);
      await enableAllVerificationCodeSignInMethods({
        identifiers: [SignInIdentifier.Email, SignInIdentifier.Phone],
        password: false,
        verify: true,
      });
    });

    afterAll(async () => {
      await clearConnectorsByTypes([ConnectorType.Email, ConnectorType.Sms]);
      await enableAllPasswordSignInMethods();
    });

    it.each([
      { identifierType: SignInIdentifier.Email, profileKey: 'primaryEmail', amr: ['otp'] },
      { identifierType: SignInIdentifier.Phone, profileKey: 'primaryPhone', amr: ['sms'] },
    ] as const)(
      'issues acr=1fa and amr=$amr for the verified $identifierType the account was created with',
      async ({ identifierType, profileKey, amr }) => {
        const profile = generateNewUserProfile({ primaryEmail: true, primaryPhone: true });
        const identifier = { type: identifierType, value: profile[profileKey] };
        const client = await registerClient();
        const { verificationId, code } = await successfullySendVerificationCode(client, {
          identifier,
          interactionEvent: InteractionEvent.Register,
        });
        await successfullyVerifyVerificationCode(client, { identifier, verificationId, code });
        await client.identifyUser({ verificationId });

        const claims = await finishRegistration(client);

        expect(claims).toMatchObject({ acr: firstFactorAcr, amr });
        expect(typeof claims.auth_time).toBe('number');
      }
    );
  });

  describe('verification code and password', () => {
    beforeAll(async () => {
      await clearConnectorsByTypes([ConnectorType.Email, ConnectorType.Sms]);
      await Promise.all([setEmailConnector(), setSmsConnector()]);
      await enableAllVerificationCodeSignInMethods({
        identifiers: [SignInIdentifier.Email],
        password: true,
        verify: true,
      });
      await updateSignInExperience({ passwordPolicy: {} });
    });

    afterAll(async () => {
      await clearConnectorsByTypes([ConnectorType.Email, ConnectorType.Sms]);
      await resetPasswordPolicy();
      await enableAllPasswordSignInMethods();
    });

    it('issues acr=1fa and amr=[otp, pwd] for the verified email and the password set on the profile', async () => {
      // The password is set through the profile and has no verification record; the profile's
      // password transition records its proof. Two first factors are still one assurance level.
      const { primaryEmail, password } = generateNewUserProfile({
        primaryEmail: true,
        password: true,
      });
      const identifier = { type: SignInIdentifier.Email, value: primaryEmail } as const;
      const client = await registerClient();
      const { verificationId, code } = await successfullySendVerificationCode(client, {
        identifier,
        interactionEvent: InteractionEvent.Register,
      });
      await successfullyVerifyVerificationCode(client, { identifier, verificationId, code });
      await expectRejects(client.identifyUser({ verificationId }), {
        code: 'user.missing_profile',
        status: 422,
      });
      await client.updateProfile({ type: 'password', value: password });
      await client.identifyUser();

      const claims = await finishRegistration(client);

      expect(claims).toMatchObject({ acr: firstFactorAcr, amr: ['otp', 'pwd'] });
    });
  });

  describe('social', () => {
    // eslint-disable-next-line @silverhand/fp/no-let
    let connectorId: string;

    beforeAll(async () => {
      // Let a social user register without a username or password.
      await enableAllPasswordSignInMethods({ identifiers: [], password: false, verify: false });
      await clearConnectorsByTypes([ConnectorType.Social]);
      // eslint-disable-next-line @silverhand/fp/no-mutation
      ({ id: connectorId } = await setSocialConnector());
    });

    afterAll(async () => {
      await clearConnectorsByTypes([ConnectorType.Social]);
      await enableAllPasswordSignInMethods();
    });

    it('issues amr=[fed] and no acr for a social registration', async () => {
      const client = await initClient();
      const state = 'state';
      const redirectUri = 'http://localhost:3000';
      const { verificationId } = await successfullyCreateSocialVerification(client, connectorId, {
        redirectUri,
        state,
      });
      await successfullyVerifySocialAuthorization(client, connectorId, {
        verificationId,
        connectorData: { state, redirectUri, code: 'fake_code', userId: generateStandardId() },
      });
      await expectRejects(client.identifyUser({ verificationId }), {
        code: 'user.identity_not_exist',
        status: 404,
      });
      await client.updateInteractionEvent({ interactionEvent: InteractionEvent.Register });
      await client.identifyUser({ verificationId });

      const claims = await finishRegistration(client);

      expect(claims.amr).toEqual(['fed']);
      expect(claims).not.toHaveProperty('acr');
      expect(typeof claims.auth_time).toBe('number');
    });
  });
});
