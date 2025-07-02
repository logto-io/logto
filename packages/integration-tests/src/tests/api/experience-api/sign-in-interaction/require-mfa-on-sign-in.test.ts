import { MfaFactor } from '@logto/schemas';
import { authenticator } from 'otplib';

import { updateUser, createUserMfaVerification } from '#src/api/admin-user.js';
import { initExperienceClient } from '#src/helpers/client.js';
import { identifyUserWithUsernamePassword } from '#src/helpers/experience/index.js';
import { successfullyVerifyTotp } from '#src/helpers/experience/totp-verification.js';
import {
  enableAllPasswordSignInMethods,
  enableMandatoryMfaWithTotpAndBackupCode,
} from '#src/helpers/sign-in-experience.js';
import { generateNewUserProfile, UserApiTest } from '#src/helpers/user.js';
import { devFeatureTest } from '#src/utils.js';

devFeatureTest.describe('requireMfaOnSignIn = false integration tests', () => {
  const userApi = new UserApiTest();

  beforeAll(async () => {
    await enableAllPasswordSignInMethods();
    await enableMandatoryMfaWithTotpAndBackupCode();
  });

  afterAll(async () => {
    await userApi.cleanUp();
  });

  devFeatureTest.describe('requireMfaOnSignIn = false (new bypass functionality)', () => {
    devFeatureTest.it(
      'should not require MFA when user has requireMfaOnSignIn = false even with MFA factors configured',
      async () => {
        const { username, password } = generateNewUserProfile({ username: true, password: true });
        const user = await userApi.create({ username, password });

        // Set requireMfaOnSignIn to false
        await updateUser(user.id, { requireMfaOnSignIn: false });

        // Set up MFA factors (should be ignored)
        await createUserMfaVerification(user.id, MfaFactor.TOTP);
        await createUserMfaVerification(user.id, MfaFactor.BackupCode);

        const client = await initExperienceClient();
        await identifyUserWithUsernamePassword(client, username, password);

        // Should succeed without MFA despite having factors configured
        await expect(client.submitInteraction()).resolves.not.toThrow();
      }
    );

    devFeatureTest.it(
      'should not require MFA when user has requireMfaOnSignIn = false and no MFA factors',
      async () => {
        const { username, password } = generateNewUserProfile({ username: true, password: true });
        const user = await userApi.create({ username, password });

        // Set requireMfaOnSignIn to false
        await updateUser(user.id, { requireMfaOnSignIn: false });

        const client = await initExperienceClient();
        await identifyUserWithUsernamePassword(client, username, password);

        // Should succeed without MFA
        await expect(client.submitInteraction()).resolves.not.toThrow();
      }
    );

    devFeatureTest.it(
      'should allow MFA verification even when requireMfaOnSignIn = false (optional MFA)',
      async () => {
        const { username, password } = generateNewUserProfile({ username: true, password: true });
        const user = await userApi.create({ username, password });

        // Set requireMfaOnSignIn to false
        await updateUser(user.id, { requireMfaOnSignIn: false });

        // Set up TOTP MFA
        const response = await createUserMfaVerification(user.id, MfaFactor.TOTP);
        await createUserMfaVerification(user.id, MfaFactor.BackupCode);

        if (response.type !== MfaFactor.TOTP) {
          throw new Error('unexpected mfa type');
        }

        const { secret } = response;
        const client = await initExperienceClient();

        await identifyUserWithUsernamePassword(client, username, password);

        // User can optionally verify MFA even when not required
        const code = authenticator.generate(secret);
        await successfullyVerifyTotp(client, { code });

        // Should succeed with optional MFA verification
        await expect(client.submitInteraction()).resolves.not.toThrow();
      }
    );
    devFeatureTest.it(
      'should bypass multiple MFA factors when requireMfaOnSignIn = false',
      async () => {
        const { username, password } = generateNewUserProfile({ username: true, password: true });
        const user = await userApi.create({ username, password });

        // Set requireMfaOnSignIn to false
        await updateUser(user.id, { requireMfaOnSignIn: false });

        // Set up multiple MFA factors (should be ignored)
        await createUserMfaVerification(user.id, MfaFactor.TOTP);
        await createUserMfaVerification(user.id, MfaFactor.BackupCode);

        const client = await initExperienceClient();
        await identifyUserWithUsernamePassword(client, username, password);

        // Should succeed without any MFA verification
        await expect(client.submitInteraction()).resolves.not.toThrow();
      }
    );

    devFeatureTest.it('should respect explicit requireMfaOnSignIn = false setting', async () => {
      const { username, password } = generateNewUserProfile({ username: true, password: true });
      const user = await userApi.create({ username, password });

      // Explicitly set to false
      await updateUser(user.id, { requireMfaOnSignIn: false });

      // Set up MFA (should be ignored)
      await createUserMfaVerification(user.id, MfaFactor.TOTP);

      const client = await initExperienceClient();
      await identifyUserWithUsernamePassword(client, username, password);

      // Should succeed without MFA
      await expect(client.submitInteraction()).resolves.not.toThrow();
    });

    devFeatureTest.it('should allow toggling from requireMfaOnSignIn = true to false', async () => {
      const { username, password } = generateNewUserProfile({ username: true, password: true });
      const user = await userApi.create({ username, password });

      // Set up MFA
      await createUserMfaVerification(user.id, MfaFactor.TOTP);

      // Default behavior (requireMfaOnSignIn = true) would require MFA,
      // but we're testing the toggle to false
      await updateUser(user.id, { requireMfaOnSignIn: false });

      const client = await initExperienceClient();
      await identifyUserWithUsernamePassword(client, username, password);

      // Should succeed without MFA after setting to false
      await expect(client.submitInteraction()).resolves.not.toThrow();
    });
  });
});
