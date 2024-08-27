import { InteractionEvent, MfaFactor, SignInIdentifier } from '@logto/schemas';
import { authenticator } from 'otplib';

import { createUserMfaVerification, deleteUser } from '#src/api/admin-user.js';
import { initExperienceClient, logoutClient, processSession } from '#src/helpers/client.js';
import {
  identifyUserWithUsernamePassword,
  signInWithPassword,
} from '#src/helpers/experience/index.js';
import {
  successfullyCreateAndVerifyTotp,
  successfullyVerifyTotp,
} from '#src/helpers/experience/totp-verification.js';
import { expectRejects } from '#src/helpers/index.js';
import {
  enableAllPasswordSignInMethods,
  enableMandatoryMfaWithTotp,
  enableMandatoryMfaWithTotpAndBackupCode,
  enableUserControlledMfaWithTotp,
} from '#src/helpers/sign-in-experience.js';
import { generateNewUserProfile, UserApiTest } from '#src/helpers/user.js';
import { devFeatureTest } from '#src/utils.js';

devFeatureTest.describe('Bind MFA APIs happy path', () => {
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

  describe('mandatory TOTP', () => {
    beforeAll(async () => {
      await enableMandatoryMfaWithTotp();
    });

    it('should bind TOTP on register', async () => {
      const { username, password } = generateNewUserProfile({ username: true, password: true });
      const client = await initExperienceClient(InteractionEvent.Register);

      const { verificationId } = await client.createNewPasswordIdentityVerification({
        identifier: {
          type: SignInIdentifier.Username,
          value: username,
        },
        password,
      });

      await client.identifyUser({ verificationId });

      await expectRejects(client.submitInteraction(), {
        code: 'user.missing_mfa',
        status: 422,
      });

      const totpVerificationId = await successfullyCreateAndVerifyTotp(client);

      await client.bindMfa(MfaFactor.TOTP, totpVerificationId);

      const { redirectTo } = await client.submitInteraction();
      const userId = await processSession(client, redirectTo);
      await logoutClient(client);

      const signInClient = await initExperienceClient();
      await identifyUserWithUsernamePassword(signInClient, username, password);

      await expectRejects(signInClient.submitInteraction(), {
        code: 'session.mfa.require_mfa_verification',
        status: 403,
      });

      await deleteUser(userId);
    });

    it('should bind TOTP on sign-in', async () => {
      const { username, password } = generateNewUserProfile({ username: true, password: true });
      await userApi.create({ username, password });

      const client = await initExperienceClient();
      await identifyUserWithUsernamePassword(client, username, password);

      await expectRejects(client.submitInteraction(), {
        code: 'user.missing_mfa',
        status: 422,
      });

      const totpVerificationId = await successfullyCreateAndVerifyTotp(client);

      await client.bindMfa(MfaFactor.TOTP, totpVerificationId);

      const { redirectTo } = await client.submitInteraction();
      await processSession(client, redirectTo);
      await logoutClient(client);
    });

    it('should not throw if user already has TOTP', async () => {
      const { username, password } = generateNewUserProfile({ username: true, password: true });
      const user = await userApi.create({ username, password });
      const response = await createUserMfaVerification(user.id, MfaFactor.TOTP);

      if (response.type !== MfaFactor.TOTP) {
        throw new Error('unexpected mfa type');
      }

      const { secret } = response;

      const client = await initExperienceClient();
      await identifyUserWithUsernamePassword(client, username, password);
      const code = authenticator.generate(secret);

      await successfullyVerifyTotp(client, { code });

      const { redirectTo } = await client.submitInteraction();
      await processSession(client, redirectTo);
      await logoutClient(client);
    });
  });

  describe('user controlled TOTP', () => {
    beforeAll(async () => {
      await enableUserControlledMfaWithTotp();
    });

    it('should able to skip MFA binding on register', async () => {
      const { username, password } = generateNewUserProfile({ username: true, password: true });
      const client = await initExperienceClient(InteractionEvent.Register);

      const { verificationId } = await client.createNewPasswordIdentityVerification({
        identifier: {
          type: SignInIdentifier.Username,
          value: username,
        },
        password,
      });

      await client.identifyUser({ verificationId });

      await expectRejects(client.submitInteraction(), {
        code: 'user.missing_mfa',
        status: 422,
      });

      await client.skipMfaBinding();

      const { redirectTo } = await client.submitInteraction();
      const userId = await processSession(client, redirectTo);
      await logoutClient(client);

      await signInWithPassword({
        identifier: {
          type: SignInIdentifier.Username,
          value: username,
        },
        password,
      });

      await deleteUser(userId);
    });

    it('should able to skip MFA binding on sign-in', async () => {
      const { username, password } = generateNewUserProfile({ username: true, password: true });
      await userApi.create({ username, password });

      const client = await initExperienceClient();
      await identifyUserWithUsernamePassword(client, username, password);

      await expectRejects(client.submitInteraction(), {
        code: 'user.missing_mfa',
        status: 422,
      });

      await client.skipMfaBinding();

      const { redirectTo } = await client.submitInteraction();
      await processSession(client, redirectTo);
      await logoutClient(client);
    });
  });

  describe('mandatory TOTP with backup codes', () => {
    beforeAll(async () => {
      await enableMandatoryMfaWithTotpAndBackupCode();
    });

    it('should bind TOTP and backup codes on register', async () => {
      const { username, password } = generateNewUserProfile({ username: true, password: true });
      const client = await initExperienceClient(InteractionEvent.Register);

      const { verificationId } = await client.createNewPasswordIdentityVerification({
        identifier: {
          type: SignInIdentifier.Username,
          value: username,
        },
        password,
      });

      await client.identifyUser({ verificationId });

      await expectRejects(client.submitInteraction(), {
        code: 'user.missing_mfa',
        status: 422,
      });

      const totpVerificationId = await successfullyCreateAndVerifyTotp(client);

      await client.bindMfa(MfaFactor.TOTP, totpVerificationId);

      await expectRejects(client.submitInteraction(), {
        code: 'session.mfa.backup_code_required',
        status: 422,
      });

      const { codes, verificationId: backupCodeVerificationId } =
        await client.generateMfaBackupCodes();

      expect(codes.length).toBeGreaterThan(0);

      await client.bindMfa(MfaFactor.BackupCode, backupCodeVerificationId);

      const { redirectTo } = await client.submitInteraction();
      const userId = await processSession(client, redirectTo);
      await logoutClient(client);

      await deleteUser(userId);
    });

    it('should bind backup codes on sign-in', async () => {
      const { username, password } = generateNewUserProfile({ username: true, password: true });
      const user = await userApi.create({ username, password });

      const result = await createUserMfaVerification(user.id, MfaFactor.TOTP);

      if (result.type !== MfaFactor.TOTP) {
        throw new Error('unexpected mfa type');
      }

      const { secret } = result;
      const code = authenticator.generate(secret);

      const client = await initExperienceClient();
      await identifyUserWithUsernamePassword(client, username, password);

      await expectRejects(client.submitInteraction(), {
        code: 'session.mfa.require_mfa_verification',
        status: 403,
      });

      await successfullyVerifyTotp(client, { code });

      await expectRejects(client.submitInteraction(), {
        code: 'session.mfa.backup_code_required',
        status: 422,
      });

      const { codes, verificationId } = await client.generateMfaBackupCodes();
      expect(codes.length).toBeGreaterThan(0);

      await client.bindMfa(MfaFactor.BackupCode, verificationId);

      const { redirectTo } = await client.submitInteraction();
      await processSession(client, redirectTo);
      await logoutClient(client);
    });
  });
});
