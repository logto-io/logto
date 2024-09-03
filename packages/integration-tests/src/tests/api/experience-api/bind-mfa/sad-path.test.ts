import { InteractionEvent, MfaFactor, SignInIdentifier } from '@logto/schemas';

import { createUserMfaVerification } from '#src/api/admin-user.js';
import { initExperienceClient } from '#src/helpers/client.js';
import { identifyUserWithUsernamePassword } from '#src/helpers/experience/index.js';
import { successfullyCreateAndVerifyTotp } from '#src/helpers/experience/totp-verification.js';
import { expectRejects } from '#src/helpers/index.js';
import {
  enableAllPasswordSignInMethods,
  enableMandatoryMfaWithTotp,
  enableMandatoryMfaWithTotpAndBackupCode,
} from '#src/helpers/sign-in-experience.js';
import { generateNewUserProfile, UserApiTest } from '#src/helpers/user.js';
import { devFeatureTest } from '#src/utils.js';

devFeatureTest.describe('Bind MFA APIs sad path', () => {
  const userApi = new UserApiTest();

  beforeAll(async () => {
    await enableAllPasswordSignInMethods({
      identifiers: [SignInIdentifier.Username],
      password: true,
      verify: false,
    });
  });

  afterEach(async () => {
    await userApi.cleanUp();
  });

  describe('No MFA is enabled', () => {
    it('should throw mfa_factor_not_enabled error when binding TOTP', async () => {
      const { username, password } = generateNewUserProfile({ username: true, password: true });
      await userApi.create({ username, password });
      const client = await initExperienceClient();

      await identifyUserWithUsernamePassword(client, username, password);

      const totpVerificationId = await successfullyCreateAndVerifyTotp(client);

      await expectRejects(client.bindMfa(MfaFactor.TOTP, totpVerificationId), {
        code: 'session.mfa.mfa_factor_not_enabled',
        status: 400,
      });
    });
  });

  describe('Mandatory TOTP', () => {
    beforeAll(async () => {
      await enableMandatoryMfaWithTotp();
    });

    it('should throw not supported error when binding TOTP on ForgotPassword interaction', async () => {
      const { username, password } = generateNewUserProfile({ username: true, password: true });
      await userApi.create({ username, password });
      const client = await initExperienceClient(InteractionEvent.ForgotPassword);

      await expectRejects(client.skipMfaBinding(), {
        code: 'session.not_supported_for_forgot_password',
        status: 400,
      });

      await expectRejects(client.bindMfa(MfaFactor.TOTP, 'dummy_verification_id'), {
        code: 'session.not_supported_for_forgot_password',
        status: 400,
      });
    });

    it('should throw identifier_not_found error, if user has not been identified', async () => {
      const client = await initExperienceClient();
      await expectRejects(client.bindMfa(MfaFactor.TOTP, 'dummy_verification_id'), {
        code: 'session.identifier_not_found',
        status: 404,
      });
    });

    it('should throw mfa_factor_not_enabled error when trying to bind backup code', async () => {
      const { username, password } = generateNewUserProfile({ username: true, password: true });
      await userApi.create({ username, password });
      const client = await initExperienceClient();
      await identifyUserWithUsernamePassword(client, username, password);

      const { verificationId } = await client.generateMfaBackupCodes();

      await expectRejects(client.bindMfa(MfaFactor.BackupCode, verificationId), {
        code: 'session.mfa.mfa_factor_not_enabled',
        status: 400,
      });
    });

    it('should throw mfa_policy_not_user_controlled error when trying to skip MFA binding', async () => {
      const { username, password } = generateNewUserProfile({ username: true, password: true });
      await userApi.create({ username, password });
      const client = await initExperienceClient();
      await identifyUserWithUsernamePassword(client, username, password);

      await expectRejects(client.skipMfaBinding(), {
        code: 'session.mfa.mfa_policy_not_user_controlled',
        status: 422,
      });
    });
  });

  describe('Mandatory TOTP and Backup Code', () => {
    beforeAll(async () => {
      await enableMandatoryMfaWithTotpAndBackupCode();
    });

    it('should throw if user has a TOTP in record', async () => {
      const { username, password } = generateNewUserProfile({ username: true, password: true });
      const user = await userApi.create({ username, password });

      await createUserMfaVerification(user.id, MfaFactor.TOTP);
      const response = await createUserMfaVerification(user.id, MfaFactor.BackupCode);

      if (response.type !== MfaFactor.BackupCode) {
        throw new Error('unexpected mfa type');
      }

      const code = response.codes[0]!;

      const client = await initExperienceClient();
      await identifyUserWithUsernamePassword(client, username, password);
      await client.verifyBackupCode({ code });

      const totpVerificationId = await successfullyCreateAndVerifyTotp(client);

      await expectRejects(client.bindMfa(MfaFactor.TOTP, totpVerificationId), {
        code: 'user.totp_already_in_use',
        status: 422,
      });
    });

    it('should throw if the interaction is not verified, when add new backup codes', async () => {
      const { username, password } = generateNewUserProfile({ username: true, password: true });
      const user = await userApi.create({ username, password });
      await createUserMfaVerification(user.id, MfaFactor.TOTP);

      const client = await initExperienceClient();
      await identifyUserWithUsernamePassword(client, username, password);
      const { verificationId } = await client.generateMfaBackupCodes();

      await expectRejects(client.bindMfa(MfaFactor.BackupCode, verificationId), {
        code: 'session.mfa.require_mfa_verification',
        status: 403,
      });
    });

    it('should throw if the backup codes is the only MFA factor', async () => {
      const { username, password } = generateNewUserProfile({ username: true, password: true });
      await userApi.create({ username, password });

      const client = await initExperienceClient();
      await identifyUserWithUsernamePassword(client, username, password);

      const { verificationId } = await client.generateMfaBackupCodes();

      await expectRejects(client.bindMfa(MfaFactor.BackupCode, verificationId), {
        code: 'session.mfa.backup_code_can_not_be_alone',
        status: 422,
      });
    });

    it('should throw if no pending backup codes is found', async () => {
      const { username, password } = generateNewUserProfile({ username: true, password: true });
      await userApi.create({ username, password });

      const client = await initExperienceClient();
      await identifyUserWithUsernamePassword(client, username, password);
      const totpVerificationId = await successfullyCreateAndVerifyTotp(client);
      await client.bindMfa(MfaFactor.TOTP, totpVerificationId);

      await expectRejects(client.bindMfa(MfaFactor.BackupCode, 'invalid_verification'), {
        code: 'session.verification_session_not_found',
        status: 404,
      });
    });
  });
});
