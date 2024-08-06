import { InteractionEvent, MfaFactor, SignInIdentifier } from '@logto/schemas';
import { generateStandardId } from '@logto/shared';

import { createUserMfaVerification, deleteUser, getUser } from '#src/api/admin-user.js';
import { updateSignInExperience } from '#src/api/sign-in-experience.js';
import { SsoConnectorApi } from '#src/api/sso-connector.js';
import { initExperienceClient } from '#src/helpers/client.js';
import { setEmailConnector, setSmsConnector } from '#src/helpers/connector.js';
import { signInWithEnterpriseSso } from '#src/helpers/experience/index.js';
import {
  successfullySendVerificationCode,
  successfullyVerifyVerificationCode,
} from '#src/helpers/experience/verification-code.js';
import { expectRejects } from '#src/helpers/index.js';
import {
  enableAllVerificationCodeSignInMethods,
  enableMandatoryMfaWithTotp,
} from '#src/helpers/sign-in-experience.js';
import { generateNewUser, UserApiTest } from '#src/helpers/user.js';
import { devFeatureTest, generateEmail, generatePassword } from '#src/utils.js';

devFeatureTest.describe('enterprise sso sign-in and sign-up', () => {
  const ssoConnectorApi = new SsoConnectorApi();
  const domain = 'foo.com';
  const enterpriseSsoIdentityId = generateStandardId();
  const email = generateEmail(domain);
  const userApi = new UserApiTest();

  beforeAll(async () => {
    await ssoConnectorApi.createMockOidcConnector([domain]);
    await updateSignInExperience({
      singleSignOnEnabled: true,
      signUp: { identifiers: [], password: false, verify: false },
    });
  });

  afterAll(async () => {
    await Promise.all([ssoConnectorApi.cleanUp(), userApi.cleanUp()]);
  });

  it('should successfully sign-up with enterprise sso and sync email', async () => {
    const userId = await signInWithEnterpriseSso(
      ssoConnectorApi.firstConnectorId!,
      {
        sub: enterpriseSsoIdentityId,
        email,
        email_verified: true,
      },
      true
    );

    const { primaryEmail } = await getUser(userId);
    expect(primaryEmail).toBe(email);
  });

  it('should successfully sign-in with enterprise sso', async () => {
    const userId = await signInWithEnterpriseSso(ssoConnectorApi.firstConnectorId!, {
      sub: enterpriseSsoIdentityId,
      email,
      email_verified: true,
      name: 'John Doe',
    });

    const { name } = await getUser(userId);
    expect(name).toBe('John Doe');

    await deleteUser(userId);
  });

  it('should successfully sign-in and link new enterprise sso identity', async () => {
    const { userProfile, user } = await generateNewUser({
      primaryEmail: true,
    });
    const { primaryEmail } = userProfile;

    const userId = await signInWithEnterpriseSso(ssoConnectorApi.firstConnectorId!, {
      sub: enterpriseSsoIdentityId,
      email: primaryEmail,
      email_verified: true,
      name: 'John Doe',
    });

    expect(userId).toBe(user.id);

    const { name, ssoIdentities } = await getUser(userId, true);

    expect(name).toBe('John Doe');
    expect(ssoIdentities?.some((identity) => identity.identityId === enterpriseSsoIdentityId)).toBe(
      true
    );

    await deleteUser(userId);
  });

  describe('should not check mfa and profile fulfillment for the enterprise sso authentication flow', () => {
    const email = generateEmail(domain);
    const enterpriseSsoIdentityId = generateStandardId();
    const userIdMap = new Map<string, string>();

    beforeAll(async () => {
      await updateSignInExperience({
        signUp: { identifiers: [SignInIdentifier.Username], password: true, verify: false },
      });
      await enableMandatoryMfaWithTotp();
    });

    it('should successfully sign-up with enterprise sso without profile and mfa fulfillment', async () => {
      const userId = await signInWithEnterpriseSso(
        ssoConnectorApi.firstConnectorId!,
        {
          sub: enterpriseSsoIdentityId,
          email,
          email_verified: true,
        },
        true
      );

      userIdMap.set('ssoUser', userId);
    });

    it('should successfully sign-in with enterprise sso without mfa validation', async () => {
      const userId = userIdMap.get('ssoUser')!;

      await createUserMfaVerification(userId, MfaFactor.TOTP);

      await signInWithEnterpriseSso(ssoConnectorApi.firstConnectorId!, {
        sub: enterpriseSsoIdentityId,
        email,
        email_verified: true,
      });

      await deleteUser(userId);
    });
  });

  describe('should block email identifier from non-enterprise sso verifications if the SSO is enabled', () => {
    const password = generatePassword();
    const email = generateEmail(domain);
    const identifier = Object.freeze({ type: SignInIdentifier.Email, value: email });

    beforeAll(async () => {
      await Promise.all([setEmailConnector(), setSmsConnector()]);
      await enableAllVerificationCodeSignInMethods();
      await userApi.create({ primaryEmail: email, password });
    });

    it('should reject when trying to sign-in with email verification code', async () => {
      const client = await initExperienceClient();

      const { verificationId, code } = await successfullySendVerificationCode(client, {
        identifier,
        interactionEvent: InteractionEvent.Register,
      });

      await successfullyVerifyVerificationCode(client, {
        identifier,
        verificationId,
        code,
      });

      await expectRejects(
        client.identifyUser({
          verificationId,
        }),
        {
          code: `session.sso_enabled`,
          status: 422,
        }
      );
    });

    it('should reject when trying to sign-in with email password', async () => {
      const client = await initExperienceClient();

      const { verificationId } = await client.verifyPassword({
        identifier,
        password,
      });

      await expectRejects(
        client.identifyUser({
          verificationId,
        }),
        {
          code: `session.sso_enabled`,
          status: 422,
        }
      );
    });
  });
});
