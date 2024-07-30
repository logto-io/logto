import { MfaFactor } from '@logto/schemas';
import { authenticator } from 'otplib';

import { createUserMfaVerification } from '#src/api/admin-user.js';
import { initExperienceClient } from '#src/helpers/client.js';
import { identifyUserWithUsernamePassword } from '#src/helpers/experience/index.js';
import { successfullyVerifyTotp } from '#src/helpers/experience/totp-verification.js';
import { expectRejects } from '#src/helpers/index.js';
import {
  enableAllPasswordSignInMethods,
  enableMandatoryMfaWithTotpAndBackupCode,
} from '#src/helpers/sign-in-experience.js';
import { generateNewUserProfile, UserApiTest } from '#src/helpers/user.js';
import { devFeatureTest } from '#src/utils.js';

devFeatureTest.describe('mfa sign-in verification', () => {
  const userApi = new UserApiTest();

  beforeAll(async () => {
    await enableAllPasswordSignInMethods();
  });

  afterAll(async () => {
    await userApi.cleanUp();
  });

  describe('TOTP verification', () => {
    beforeAll(async () => {
      await enableMandatoryMfaWithTotpAndBackupCode();
    });

    it('should throw require_mfa_verification error when signing in without mfa verification', async () => {
      const { username, password } = generateNewUserProfile({ username: true, password: true });

      const user = await userApi.create({ username, password });
      await createUserMfaVerification(user.id, MfaFactor.TOTP);

      const client = await initExperienceClient();

      await identifyUserWithUsernamePassword(client, username, password);

      await expectRejects(client.submitInteraction(), {
        code: 'session.mfa.require_mfa_verification',
        status: 403,
      });
    });

    it('should sign-in successfully with TOTP verification', async () => {
      const { username, password } = generateNewUserProfile({ username: true, password: true });
      const user = await userApi.create({ username, password });

      const response = await createUserMfaVerification(user.id, MfaFactor.TOTP);
      // Fulfill the backup code requirement
      await createUserMfaVerification(user.id, MfaFactor.BackupCode);

      if (response.type !== MfaFactor.TOTP) {
        throw new Error('unexpected mfa type');
      }

      const { secret } = response;

      const client = await initExperienceClient();

      await identifyUserWithUsernamePassword(client, username, password);

      const code = authenticator.generate(secret);

      await successfullyVerifyTotp(client, { code });

      await expect(client.submitInteraction()).resolves.not.toThrow();
    });

    it('should sign-in successfully with backup code with both TOTP and backup code enabled', async () => {
      const { username, password } = generateNewUserProfile({ username: true, password: true });
      const user = await userApi.create({ username, password });

      await createUserMfaVerification(user.id, MfaFactor.TOTP);
      const response = await createUserMfaVerification(user.id, MfaFactor.BackupCode);

      if (response.type !== MfaFactor.BackupCode) {
        throw new Error('unexpected mfa type');
      }

      const { codes } = response;

      const client = await initExperienceClient();

      await identifyUserWithUsernamePassword(client, username, password);

      const code = codes[0]!;

      await client.verifyBackupCode({ code });

      await expect(client.submitInteraction()).resolves.not.toThrow();
    });
  });
});
