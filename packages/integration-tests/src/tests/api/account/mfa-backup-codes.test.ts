import { UserScope } from '@logto/core-kit';
import { MfaFactor } from '@logto/schemas';

import { enableAllAccountCenterFields } from '#src/api/account-center.js';
import {
  addMfaVerification,
  generateTotpSecret,
  generateBackupCodes,
  getBackupCodes,
  deleteMfaVerification,
  getMfaVerifications,
} from '#src/api/my-account.js';
import { createVerificationRecordByPassword } from '#src/api/verification-record.js';
import { expectRejects } from '#src/helpers/index.js';
import {
  createDefaultTenantUserWithPassword,
  deleteDefaultTenantUser,
  signInAndGetUserApi,
} from '#src/helpers/profile.js';
import {
  enableAllPasswordSignInMethods,
  enableAllUserControlledMfaFactors,
  resetMfaSettings,
} from '#src/helpers/sign-in-experience.js';

describe('my-account (mfa - Backup Codes)', () => {
  beforeAll(async () => {
    await enableAllPasswordSignInMethods();
    await enableAllAccountCenterFields();
    await enableAllUserControlledMfaFactors();
  });

  afterAll(async () => {
    await resetMfaSettings();
  });

  describe('POST /my-account/mfa-verifications/backup-codes/generate', () => {
    it('should be able to generate backup codes', async () => {
      const { user, username, password } = await createDefaultTenantUserWithPassword();
      const api = await signInAndGetUserApi(username, password, {
        scopes: [UserScope.Profile, UserScope.Identities],
      });

      const { codes } = await generateBackupCodes(api);

      expect(codes).toBeTruthy();
      expect(codes).toHaveLength(10);
      expect(codes.every((code) => typeof code === 'string' && code.length > 0)).toBe(true);

      await deleteDefaultTenantUser(user.id);
    });
  });

  describe('POST /my-account/mfa-verifications (backup codes)', () => {
    it('should be able to add backup codes after TOTP', async () => {
      const { user, username, password } = await createDefaultTenantUserWithPassword();
      const api = await signInAndGetUserApi(username, password, {
        scopes: [UserScope.Profile, UserScope.Identities],
      });
      const { secret } = await generateTotpSecret(api);
      const verificationRecordId = await createVerificationRecordByPassword(api, password);

      // Add TOTP first
      await addMfaVerification(api, verificationRecordId, {
        type: MfaFactor.TOTP,
        secret,
      });

      // Add backup codes
      const { codes } = await generateBackupCodes(api);
      const backupVerificationRecordId = await createVerificationRecordByPassword(api, password);
      await addMfaVerification(api, backupVerificationRecordId, {
        type: MfaFactor.BackupCode,
        codes,
      });

      const mfaVerifications = await getMfaVerifications(api);
      expect(mfaVerifications).toHaveLength(2);

      const backupCodeVerification = mfaVerifications.find(
        (verification) => verification.type === MfaFactor.BackupCode
      );
      expect(backupCodeVerification).toBeDefined();
      expect(backupCodeVerification?.remainCodes).toBe(10);

      await deleteDefaultTenantUser(user.id);
    });

    it('should fail to add backup codes without other MFA factor', async () => {
      const { user, username, password } = await createDefaultTenantUserWithPassword();
      const api = await signInAndGetUserApi(username, password, {
        scopes: [UserScope.Profile, UserScope.Identities],
      });
      const verificationRecordId = await createVerificationRecordByPassword(api, password);

      const { codes } = await generateBackupCodes(api);
      await expectRejects(
        addMfaVerification(api, verificationRecordId, {
          type: MfaFactor.BackupCode,
          codes,
        }),
        {
          code: 'session.mfa.backup_code_can_not_be_alone',
          status: 422,
        }
      );

      await deleteDefaultTenantUser(user.id);
    });

    it('should fail to add backup codes when already has active backup codes', async () => {
      const { user, username, password } = await createDefaultTenantUserWithPassword();
      const api = await signInAndGetUserApi(username, password, {
        scopes: [UserScope.Profile, UserScope.Identities],
      });
      const { secret } = await generateTotpSecret(api);
      const verificationRecordId = await createVerificationRecordByPassword(api, password);

      // Add TOTP first
      await addMfaVerification(api, verificationRecordId, {
        type: MfaFactor.TOTP,
        secret,
      });

      // Add backup codes
      const { codes } = await generateBackupCodes(api);
      const backupVerificationRecordId = await createVerificationRecordByPassword(api, password);
      await addMfaVerification(api, backupVerificationRecordId, {
        type: MfaFactor.BackupCode,
        codes,
      });

      // Try to add backup codes again
      const { codes: secondCodes } = await generateBackupCodes(api);
      const secondBackupVerificationRecordId = await createVerificationRecordByPassword(
        api,
        password
      );
      await expectRejects(
        addMfaVerification(api, secondBackupVerificationRecordId, {
          type: MfaFactor.BackupCode,
          codes: secondCodes,
        }),
        {
          code: 'user.backup_code_already_in_use',
          status: 422,
        }
      );

      await deleteDefaultTenantUser(user.id);
    });
  });

  describe('GET /my-account/mfa-verifications/backup-codes', () => {
    it('should be able to get backup codes after adding them', async () => {
      const { user, username, password } = await createDefaultTenantUserWithPassword();
      const api = await signInAndGetUserApi(username, password, {
        scopes: [UserScope.Profile, UserScope.Identities],
      });
      const { secret } = await generateTotpSecret(api);
      const verificationRecordId = await createVerificationRecordByPassword(api, password);

      // Add TOTP first
      await addMfaVerification(api, verificationRecordId, {
        type: MfaFactor.TOTP,
        secret,
      });

      // Add backup codes
      const { codes } = await generateBackupCodes(api);
      const backupVerificationRecordId = await createVerificationRecordByPassword(api, password);
      await addMfaVerification(api, backupVerificationRecordId, {
        type: MfaFactor.BackupCode,
        codes,
      });

      // Get backup codes
      const getBackupCodesRecordId = await createVerificationRecordByPassword(api, password);
      const { codes: retrievedCodes } = await getBackupCodes(api, getBackupCodesRecordId);

      expect(retrievedCodes).toHaveLength(10);
      expect(retrievedCodes.map(({ code }) => code)).toEqual(expect.arrayContaining(codes));
      expect(retrievedCodes.every(({ usedAt }) => !usedAt)).toBe(true);

      await deleteDefaultTenantUser(user.id);
    });

    it('should fail to get backup codes without identity verification', async () => {
      const { user, username, password } = await createDefaultTenantUserWithPassword();
      const api = await signInAndGetUserApi(username, password, {
        scopes: [UserScope.Profile, UserScope.Identities],
      });
      const { secret } = await generateTotpSecret(api);
      const verificationRecordId = await createVerificationRecordByPassword(api, password);

      // Add TOTP first
      await addMfaVerification(api, verificationRecordId, {
        type: MfaFactor.TOTP,
        secret,
      });

      // Add backup codes
      const { codes } = await generateBackupCodes(api);
      const backupVerificationRecordId = await createVerificationRecordByPassword(api, password);
      await addMfaVerification(api, backupVerificationRecordId, {
        type: MfaFactor.BackupCode,
        codes,
      });

      // Try to get backup codes without identity verification (no verification record ID)
      await expectRejects(getBackupCodes(api, ''), {
        code: 'verification_record.permission_denied',
        status: 401,
      });

      await deleteDefaultTenantUser(user.id);
    });

    it('should fail to get backup codes when no backup codes exist', async () => {
      const { user, username, password } = await createDefaultTenantUserWithPassword();
      const api = await signInAndGetUserApi(username, password, {
        scopes: [UserScope.Profile, UserScope.Identities],
      });

      const verificationRecordId = await createVerificationRecordByPassword(api, password);

      await expectRejects(getBackupCodes(api, verificationRecordId), {
        code: 'verification_record.not_found',
        status: 404,
      });

      await deleteDefaultTenantUser(user.id);
    });
  });

  describe('DELETE /my-account/mfa-verifications/backup-codes', () => {
    it('should be able to delete backup codes', async () => {
      const { user, username, password } = await createDefaultTenantUserWithPassword();
      const api = await signInAndGetUserApi(username, password, {
        scopes: [UserScope.Profile, UserScope.Identities],
      });
      const { secret } = await generateTotpSecret(api);
      const verificationRecordId = await createVerificationRecordByPassword(api, password);

      // Add TOTP first
      await addMfaVerification(api, verificationRecordId, {
        type: MfaFactor.TOTP,
        secret,
      });

      // Add backup codes
      const { codes } = await generateBackupCodes(api);
      const backupVerificationRecordId = await createVerificationRecordByPassword(api, password);
      await addMfaVerification(api, backupVerificationRecordId, {
        type: MfaFactor.BackupCode,
        codes,
      });

      // Verify backup codes exist
      const initialMfaVerifications = await getMfaVerifications(api);
      expect(initialMfaVerifications).toHaveLength(2);
      const backupCodeVerification = initialMfaVerifications.find(
        (verification) => verification.type === MfaFactor.BackupCode
      );
      expect(backupCodeVerification).toBeDefined();

      // Delete backup codes
      const deleteVerificationRecordId = await createVerificationRecordByPassword(api, password);
      await deleteMfaVerification(api, backupCodeVerification!.id, deleteVerificationRecordId);

      // Verify backup codes are deleted
      const finalMfaVerifications = await getMfaVerifications(api);
      expect(finalMfaVerifications).toHaveLength(1);
      expect(finalMfaVerifications[0]?.type).toBe(MfaFactor.TOTP);

      await deleteDefaultTenantUser(user.id);
    });

    it('should fail to delete backup codes without identity verification', async () => {
      const { user, username, password } = await createDefaultTenantUserWithPassword();
      const api = await signInAndGetUserApi(username, password, {
        scopes: [UserScope.Profile, UserScope.Identities],
      });
      const { secret } = await generateTotpSecret(api);
      const verificationRecordId = await createVerificationRecordByPassword(api, password);

      // Add TOTP first
      await addMfaVerification(api, verificationRecordId, {
        type: MfaFactor.TOTP,
        secret,
      });

      // Add backup codes
      const { codes } = await generateBackupCodes(api);
      const backupVerificationRecordId = await createVerificationRecordByPassword(api, password);
      await addMfaVerification(api, backupVerificationRecordId, {
        type: MfaFactor.BackupCode,
        codes,
      });

      // Try to delete backup codes without identity verification
      const mfaVerifications = await getMfaVerifications(api);
      const backupCodeVerification = mfaVerifications.find(
        (verification) => verification.type === MfaFactor.BackupCode
      )!;
      await expectRejects(deleteMfaVerification(api, backupCodeVerification.id, ''), {
        code: 'verification_record.permission_denied',
        status: 401,
      });

      await deleteDefaultTenantUser(user.id);
    });

    it('should fail to delete backup codes when no backup codes exist', async () => {
      const { user, username, password } = await createDefaultTenantUserWithPassword();
      const api = await signInAndGetUserApi(username, password, {
        scopes: [UserScope.Profile, UserScope.Identities],
      });

      const verificationRecordId = await createVerificationRecordByPassword(api, password);

      // Try to delete non-existent backup codes
      await expectRejects(deleteMfaVerification(api, 'non-existent-id', verificationRecordId), {
        code: 'verification_record.not_found',
        status: 400,
      });

      await deleteDefaultTenantUser(user.id);
    });
  });
});
