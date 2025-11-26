import { InteractionEvent, MfaFactor, SignInIdentifier, SignInMode } from '@logto/schemas';
import { generateStandardId } from '@logto/shared';

import {
  createUserMfaVerification,
  deleteUser,
  getUser,
  getUserSsoIdentity,
} from '#src/api/admin-user.js';
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
import { generateEmail, generatePassword } from '#src/utils.js';

describe('enterprise sso sign-in and sign-up', () => {
  const ssoConnectorApi = new SsoConnectorApi();
  // Use a random domain that contains uppercase letters to test the case-insensitivity of email domain matching.
  const domain = 'Foo.com';
  const enterpriseSsoIdentityId = generateStandardId();
  const email = generateEmail(domain);
  const userApi = new UserApiTest();
  const mockTokenResponse = {
    id_token: 'mock-id-token',
    access_token: 'mock-access-token',
    scope: 'openid',
    expires_in: 3600,
  };
  const ENABLE_TOKEN_STORAGE = true;

  beforeAll(async () => {
    await ssoConnectorApi.createMockOidcConnector([domain], undefined, ENABLE_TOKEN_STORAGE);
    await updateSignInExperience({
      singleSignOnEnabled: true,
      signInMode: SignInMode.SignInAndRegister,
      signUp: { identifiers: [], password: false, verify: false },
    });
  });

  afterAll(async () => {
    await Promise.all([ssoConnectorApi.cleanUp(), userApi.cleanUp()]);
  });

  it('should successfully sign-up with enterprise sso and sync email and sync SSO profile on the next sign-in', async () => {
    if (!ssoConnectorApi.firstConnectorId) {
      throw new Error('SSO connector is not created');
    }

    const userId = await signInWithEnterpriseSso(
      ssoConnectorApi.firstConnectorId,
      {
        sub: enterpriseSsoIdentityId,
        email,
        email_verified: true,
        tokenResponse: mockTokenResponse,
      },
      true
    );

    const { primaryEmail } = await getUser(userId);
    expect(primaryEmail).toBe(email);

    const { ssoIdentity, tokenSecret } = await getUserSsoIdentity(
      userId,
      ssoConnectorApi.firstConnectorId
    );

    expect(ssoIdentity.identityId).toBe(enterpriseSsoIdentityId);
    expect(tokenSecret?.identityId).toBe(enterpriseSsoIdentityId);
    expect(tokenSecret?.ssoConnectorId).toBe(ssoConnectorApi.firstConnectorId);
    expect(tokenSecret?.metadata.scope).toBe(mockTokenResponse.scope);

    await signInWithEnterpriseSso(ssoConnectorApi.firstConnectorId, {
      sub: enterpriseSsoIdentityId,
      email,
      email_verified: true,
      name: 'John Doe',
      tokenResponse: {
        ...mockTokenResponse,
        scope: 'openid profile email',
      },
    });

    const { name } = await getUser(userId);
    expect(name).toBe('John Doe');

    // Should update the token set
    const { tokenSecret: updatedTokenSecret } = await getUserSsoIdentity(
      userId,
      ssoConnectorApi.firstConnectorId
    );
    expect(updatedTokenSecret?.metadata.scope).toBe('openid profile email');

    // Should delete the token set when the connector token storage is disabled
    await ssoConnectorApi.update(ssoConnectorApi.firstConnectorId, {
      enableTokenStorage: false,
    });

    const { tokenSecret: deletedTokenSecret } = await getUserSsoIdentity(
      userId,
      ssoConnectorApi.firstConnectorId
    );
    expect(deletedTokenSecret).toBeUndefined();

    await deleteUser(userId);
  });

  it('should successfully sign-in and link new enterprise sso identity', async () => {
    if (!ssoConnectorApi.firstConnectorId) {
      throw new Error('SSO connector is not created');
    }

    const { userProfile, user } = await generateNewUser({
      primaryEmail: true,
    });

    const { primaryEmail } = userProfile;

    const userId = await signInWithEnterpriseSso(ssoConnectorApi.firstConnectorId, {
      sub: enterpriseSsoIdentityId,
      email: primaryEmail,
      email_verified: true,
      name: 'John Doe',
    });

    expect(userId).toBe(user.id);

    const { name, ssoIdentities } = await getUser(userId, true);

    expect(name).toBe('John Doe');

    const enterpriseSsoIdentity = ssoIdentities?.find(
      (identity) => identity.identityId === enterpriseSsoIdentityId
    );

    expect(enterpriseSsoIdentity).toBeTruthy();
    expect(enterpriseSsoIdentity?.updatedAt).not.toBeNull();

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

    beforeAll(async () => {
      await Promise.all([setEmailConnector(), setSmsConnector()]);
      await enableAllVerificationCodeSignInMethods();
    });

    it('should reject when trying to sign-in with email verification code', async () => {
      // Test with lowercase domain to ensure the domain matching is case-insensitive
      const email = generateEmail(domain.toLocaleLowerCase());
      const identifier = Object.freeze({ type: SignInIdentifier.Email, value: email });
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
      // Test with uppercase domain to ensure the domain matching is case-insensitive
      const email = generateEmail(domain.toUpperCase());
      const identifier = Object.freeze({ type: SignInIdentifier.Email, value: email });
      const user = await userApi.create({ primaryEmail: email, password });

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

      await deleteUser(user.id);
    });
  });
});
