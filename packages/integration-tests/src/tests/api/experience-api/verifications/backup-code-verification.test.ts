import { MfaFactor } from '@logto/schemas';

import { createUserMfaVerification } from '#src/api/admin-user.js';
import { initExperienceClient } from '#src/helpers/client.js';
import { identifyUserWithUsernamePassword } from '#src/helpers/experience/index.js';
import { expectRejects } from '#src/helpers/index.js';
import { enableAllPasswordSignInMethods } from '#src/helpers/sign-in-experience.js';
import { UserApiTest, generateNewUserProfile } from '#src/helpers/user.js';
import { devFeatureTest } from '#src/utils.js';

devFeatureTest.describe('backup code verification APIs', () => {
  const { username, password } = generateNewUserProfile({ username: true, password: true });
  const userApi = new UserApiTest();

  beforeAll(async () => {
    await enableAllPasswordSignInMethods();
    await userApi.create({ username, password });
  });

  afterAll(async () => {
    await userApi.cleanUp();
  });

  it('should throw 400 if the user is not identified', async () => {
    const client = await initExperienceClient();

    await expectRejects(client.verifyBackupCode({ code: '1234' }), {
      code: 'session.identifier_not_found',
      status: 400,
    });
  });

  it('should throw 400 if the user does not have backup codes set up', async () => {
    const client = await initExperienceClient();

    await identifyUserWithUsernamePassword(client, username, password);

    await expectRejects(client.verifyBackupCode({ code: '1234' }), {
      code: 'session.mfa.invalid_backup_code',
      status: 400,
    });
  });

  it('should verify the backup code successfully', async () => {
    const { username, password } = generateNewUserProfile({ username: true, password: true });
    const user = await userApi.create({ username, password });

    // Can not create backup code MFA without other MFA settings
    await createUserMfaVerification(user.id, MfaFactor.TOTP);
    const response = await createUserMfaVerification(user.id, MfaFactor.BackupCode);

    if (response.type !== MfaFactor.BackupCode) {
      throw new Error('unexpected mfa type');
    }

    const client = await initExperienceClient();
    await identifyUserWithUsernamePassword(client, username, password);
    const { verificationId } = await client.verifyBackupCode({ code: response.codes[0]! });

    expect(verificationId).toBeTruthy();
  });

  it('should throw 400 if the backup code has been consumed', async () => {
    const { username, password } = generateNewUserProfile({ username: true, password: true });
    const user = await userApi.create({ username, password });

    // Can not create backup code MFA without other MFA settings
    await createUserMfaVerification(user.id, MfaFactor.TOTP);
    const response = await createUserMfaVerification(user.id, MfaFactor.BackupCode);

    if (response.type !== MfaFactor.BackupCode) {
      return;
    }

    const code = response.codes[0]!;

    const client = await initExperienceClient();
    await identifyUserWithUsernamePassword(client, username, password);
    await client.verifyBackupCode({ code });

    // Start a brand new session
    const newClient = await initExperienceClient();
    await identifyUserWithUsernamePassword(newClient, username, password);

    await expectRejects(newClient.verifyBackupCode({ code }), {
      code: 'session.mfa.invalid_backup_code',
      status: 400,
    });
  });
});
