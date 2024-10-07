import { ConnectorType } from '@logto/connector-kit';
import { InteractionEvent, MfaFactor, SignInIdentifier } from '@logto/schemas';
import { authenticator } from 'otplib';

import { createUserMfaVerification } from '#src/api/admin-user.js';
import { initExperienceClient } from '#src/helpers/client.js';
import {
  clearConnectorsByTypes,
  setEmailConnector,
  setSmsConnector,
} from '#src/helpers/connector.js';
import { identifyUserWithUsernamePassword } from '#src/helpers/experience/index.js';
import { successfullyVerifyTotp } from '#src/helpers/experience/totp-verification.js';
import {
  successfullySendVerificationCode,
  successfullyVerifyVerificationCode,
} from '#src/helpers/experience/verification-code.js';
import { expectRejects } from '#src/helpers/index.js';
import {
  enableAllPasswordSignInMethods,
  enableMandatoryMfaWithTotpAndBackupCode,
  resetMfaSettings,
} from '#src/helpers/sign-in-experience.js';
import { generateNewUserProfile, UserApiTest } from '#src/helpers/user.js';
import { generateEmail } from '#src/utils.js';

describe('Fulfill User Profiles', () => {
  const userApi = new UserApiTest();

  beforeAll(async () => {
    await clearConnectorsByTypes([ConnectorType.Email, ConnectorType.Sms]);
    await Promise.all([setEmailConnector(), setSmsConnector()]);
    await enableAllPasswordSignInMethods();
  });

  afterEach(async () => {
    await userApi.cleanUp();
  });

  it('should throw 400 if the interaction event is ForgotPassword', async () => {
    const client = await initExperienceClient(InteractionEvent.ForgotPassword);

    await expectRejects(
      client.updateProfile({ type: SignInIdentifier.Username, value: 'username' }),
      {
        status: 400,
        code: 'session.not_supported_for_forgot_password',
      }
    );
  });

  it('should throw 404 if the interaction is not identified', async () => {
    const client = await initExperienceClient();

    await expectRejects(
      client.updateProfile({ type: SignInIdentifier.Username, value: 'username' }),
      {
        status: 404,
        code: 'session.identifier_not_found',
      }
    );
  });

  it('should throw 422 if the profile field is already exist in current user account', async () => {
    const { username, password } = generateNewUserProfile({ username: true, password: true });

    await userApi.create({ username, password });

    const client = await initExperienceClient();
    await identifyUserWithUsernamePassword(client, username, password);

    await expectRejects(
      client.updateProfile({ type: SignInIdentifier.Username, value: 'username' }),
      {
        status: 422,
        code: 'user.username_exists_in_profile',
      }
    );

    await expectRejects(client.updateProfile({ type: 'password', value: 'password' }), {
      status: 422,
      code: 'user.password_exists_in_profile',
    });
  });

  it('should throw 422 if the profile field is used by another user', async () => {
    const { username, password } = generateNewUserProfile({ username: true, password: true });
    await userApi.create({ username, password });

    const { primaryEmail } = generateNewUserProfile({ primaryEmail: true });
    await userApi.create({ primaryEmail });

    const client = await initExperienceClient();
    await identifyUserWithUsernamePassword(client, username, password);

    const { verificationId, code: verificationCode } = await successfullySendVerificationCode(
      client,
      {
        identifier: { type: SignInIdentifier.Email, value: primaryEmail },
        interactionEvent: InteractionEvent.SignIn,
      }
    );

    await successfullyVerifyVerificationCode(client, {
      identifier: { type: SignInIdentifier.Email, value: primaryEmail },
      verificationId,
      code: verificationCode,
    });

    await expectRejects(client.updateProfile({ type: SignInIdentifier.Email, verificationId }), {
      status: 422,
      code: 'user.email_already_in_use',
    });
  });

  describe('MFA verification status is required', () => {
    beforeAll(async () => {
      await enableMandatoryMfaWithTotpAndBackupCode();
    });
    afterAll(async () => {
      await resetMfaSettings();
    });

    it('should throw 422 if the mfa is enabled but not verified', async () => {
      const { username, password } = generateNewUserProfile({ username: true, password: true });
      const user = await userApi.create({ username, password });
      await createUserMfaVerification(user.id, MfaFactor.TOTP);

      const client = await initExperienceClient();
      await identifyUserWithUsernamePassword(client, username, password);

      await expectRejects(
        client.updateProfile({ type: SignInIdentifier.Username, value: 'username' }),
        {
          status: 403,
          code: 'session.mfa.require_mfa_verification',
        }
      );
    });

    it('should update the profile successfully if the mfa is enabled and verified', async () => {
      const { username, password } = generateNewUserProfile({ username: true, password: true });
      const user = await userApi.create({ username, password });

      const client = await initExperienceClient();
      await identifyUserWithUsernamePassword(client, username, password);

      const response = await createUserMfaVerification(user.id, MfaFactor.TOTP);

      if (response.type !== MfaFactor.TOTP) {
        throw new Error('unexpected mfa type');
      }

      const { secret } = response;
      const code = authenticator.generate(secret);

      await successfullyVerifyTotp(client, { code });

      const email = generateEmail();

      const { verificationId, code: verificationCode } = await successfullySendVerificationCode(
        client,
        {
          identifier: { type: SignInIdentifier.Email, value: email },
          interactionEvent: InteractionEvent.SignIn,
        }
      );

      await successfullyVerifyVerificationCode(client, {
        identifier: { type: SignInIdentifier.Email, value: email },
        verificationId,
        code: verificationCode,
      });

      await expect(
        client.updateProfile({ type: SignInIdentifier.Email, verificationId })
      ).resolves.not.toThrow();
    });
  });
});
