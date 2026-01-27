import { MfaFactor, type SignInExperience } from '@logto/schemas';
import { type Optional } from '@silverhand/essentials';
import { authenticator } from 'otplib';

import { createUserMfaVerification } from '#src/api/admin-user.js';
import { getSignInExperience, updateSignInExperience } from '#src/api/sign-in-experience.js';
import { initExperienceClient } from '#src/helpers/client.js';
import { identifyUserWithUsernamePassword } from '#src/helpers/experience/index.js';
import { expectRejects } from '#src/helpers/index.js';
import { enableAllPasswordSignInMethods } from '#src/helpers/sign-in-experience.js';
import { UserApiTest, generateNewUserProfile } from '#src/helpers/user.js';
import { devFeatureTest } from '#src/utils.js';

devFeatureTest.describe('MFA sentinel (factor isolation)', () => {
  const userApi = new UserApiTest();
  // eslint-disable-next-line @silverhand/fp/no-let
  let originalSentinelPolicy: Optional<SignInExperience['sentinelPolicy']>;

  beforeAll(async () => {
    await enableAllPasswordSignInMethods();
    const signInExperience = await getSignInExperience();
    // eslint-disable-next-line @silverhand/fp/no-mutation
    originalSentinelPolicy = signInExperience.sentinelPolicy;
    await updateSignInExperience({
      sentinelPolicy: {
        maxAttempts: 2,
        lockoutDuration: 1,
      },
    });
  });

  afterAll(async () => {
    await userApi.cleanUp();
    await updateSignInExperience({ sentinelPolicy: originalSentinelPolicy ?? {} });
  });

  devFeatureTest.it('should block repeated failed TOTP verifications', async () => {
    const { username, password } = generateNewUserProfile({ username: true, password: true });
    const user = await userApi.create({ username, password });

    const mfaResponse = await createUserMfaVerification(user.id, MfaFactor.TOTP);

    if (mfaResponse.type !== MfaFactor.TOTP) {
      throw new Error('Invalid MFA response');
    }

    const validCode = authenticator.generate(mfaResponse.secret);
    const invalidCode = validCode.replace(/.$/, (lastDigit) => (lastDigit === '0' ? '1' : '0'));

    const client = await initExperienceClient();

    await identifyUserWithUsernamePassword(client, username, password);

    await expectRejects(client.verifyTotp({ code: invalidCode }), {
      code: 'session.mfa.invalid_totp_code',
      status: 400,
    });

    await expectRejects(client.verifyTotp({ code: invalidCode }), {
      code: 'session.verification_blocked_too_many_attempts',
      status: 400,
    });
  });

  devFeatureTest.it('should not block backup codes when TOTP is locked', async () => {
    const { username, password } = generateNewUserProfile({ username: true, password: true });
    const user = await userApi.create({ username, password });

    const totpResponse = await createUserMfaVerification(user.id, MfaFactor.TOTP);
    if (totpResponse.type !== MfaFactor.TOTP) {
      throw new Error('Invalid MFA response');
    }

    const backupResponse = await createUserMfaVerification(user.id, MfaFactor.BackupCode);
    if (backupResponse.type !== MfaFactor.BackupCode) {
      throw new Error('Invalid MFA response');
    }

    const validCode = authenticator.generate(totpResponse.secret);
    const invalidTotpCode = validCode.replace(/.$/, (lastDigit) => (lastDigit === '0' ? '1' : '0'));

    const client = await initExperienceClient();
    await identifyUserWithUsernamePassword(client, username, password);

    await expectRejects(client.verifyTotp({ code: invalidTotpCode }), {
      code: 'session.mfa.invalid_totp_code',
      status: 400,
    });
    await expectRejects(client.verifyTotp({ code: invalidTotpCode }), {
      code: 'session.verification_blocked_too_many_attempts',
      status: 400,
    });

    const { verificationId } = await client.verifyBackupCode({ code: backupResponse.codes[0]! });
    expect(verificationId).toBeTruthy();
  });

  devFeatureTest.it('should not block TOTP when backup codes are locked', async () => {
    const { username, password } = generateNewUserProfile({ username: true, password: true });
    const user = await userApi.create({ username, password });

    const totpResponse = await createUserMfaVerification(user.id, MfaFactor.TOTP);
    if (totpResponse.type !== MfaFactor.TOTP) {
      throw new Error('Invalid MFA response');
    }

    const backupResponse = await createUserMfaVerification(user.id, MfaFactor.BackupCode);
    if (backupResponse.type !== MfaFactor.BackupCode) {
      throw new Error('Invalid MFA response');
    }

    const client = await initExperienceClient();
    await identifyUserWithUsernamePassword(client, username, password);

    const invalidBackupCode = `${backupResponse.codes[0]!}0`;

    await expectRejects(client.verifyBackupCode({ code: invalidBackupCode }), {
      code: 'session.mfa.invalid_backup_code',
      status: 400,
    });
    await expectRejects(client.verifyBackupCode({ code: invalidBackupCode }), {
      code: 'session.verification_blocked_too_many_attempts',
      status: 400,
    });

    const validTotpCode = authenticator.generate(totpResponse.secret);
    const { verificationId } = await client.verifyTotp({ code: validTotpCode });
    expect(verificationId).toBeTruthy();
  });
});
