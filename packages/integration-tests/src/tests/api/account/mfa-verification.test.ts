import { UserScope } from '@logto/core-kit';
import { MfaFactor } from '@logto/schemas';
import { authenticator } from 'otplib';

import { enableAllAccountCenterFields } from '#src/api/account-center.js';
import {
  addMfaVerification,
  generateBackupCodes,
  generateTotpSecret,
  verifyBackupCodeMfa,
  verifyTotpMfa,
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
import { devFeatureTest } from '#src/utils.js';

describe('my-account (mfa verification)', () => {
  beforeAll(async () => {
    await enableAllPasswordSignInMethods();
    await enableAllAccountCenterFields();
    await enableAllUserControlledMfaFactors();
  });

  afterAll(async () => {
    await resetMfaSettings();
  });

  devFeatureTest.describe('POST /my-account/mfa-verifications/totp/verify', () => {
    devFeatureTest.it('should verify TOTP code successfully', async () => {
      const { user, username, password } = await createDefaultTenantUserWithPassword();
      const api = await signInAndGetUserApi(username, password, {
        scopes: [UserScope.Profile, UserScope.Identities],
      });

      const verificationRecordId = await createVerificationRecordByPassword(api, password);
      const { secret } = await generateTotpSecret(api);

      // Add TOTP MFA
      await addMfaVerification(api, verificationRecordId, {
        type: MfaFactor.TOTP,
        secret,
      });

      // Generate valid TOTP code
      const code = authenticator.generate(secret);

      // Verify TOTP code should succeed
      const response = await verifyTotpMfa(api, code);
      expect(response.status).toBe(204);

      await deleteDefaultTenantUser(user.id);
    });

    devFeatureTest.it('should fail with invalid TOTP code', async () => {
      const { user, username, password } = await createDefaultTenantUserWithPassword();
      const api = await signInAndGetUserApi(username, password, {
        scopes: [UserScope.Profile, UserScope.Identities],
      });

      const verificationRecordId = await createVerificationRecordByPassword(api, password);
      const { secret } = await generateTotpSecret(api);

      // Add TOTP MFA
      await addMfaVerification(api, verificationRecordId, {
        type: MfaFactor.TOTP,
        secret,
      });

      // Try with invalid code
      await expectRejects(verifyTotpMfa(api, '123456'), {
        code: 'session.mfa.invalid_totp_code',
        status: 422,
      });

      await deleteDefaultTenantUser(user.id);
    });

    devFeatureTest.it('should fail when user has no TOTP factor', async () => {
      const { user, username, password } = await createDefaultTenantUserWithPassword();
      const api = await signInAndGetUserApi(username, password, {
        scopes: [UserScope.Profile, UserScope.Identities],
      });

      // Try to verify TOTP without having TOTP configured
      await expectRejects(verifyTotpMfa(api, '123456'), {
        code: 'session.mfa.mfa_factor_not_enabled',
        status: 422,
      });

      await deleteDefaultTenantUser(user.id);
    });

    devFeatureTest.it('should fail without required scope', async () => {
      const { user, username, password } = await createDefaultTenantUserWithPassword();
      const api = await signInAndGetUserApi(username, password, {
        scopes: [UserScope.Profile], // Missing UserScope.Identities
      });

      await expectRejects(verifyTotpMfa(api, '123456'), {
        code: 'auth.unauthorized',
        status: 401,
      });

      await deleteDefaultTenantUser(user.id);
    });
  });

  devFeatureTest.describe('POST /my-account/mfa-verifications/backup-code/verify', () => {
    devFeatureTest.it('should verify backup code successfully', async () => {
      const { user, username, password } = await createDefaultTenantUserWithPassword();
      const api = await signInAndGetUserApi(username, password, {
        scopes: [UserScope.Profile, UserScope.Identities],
      });

      const verificationRecordId = await createVerificationRecordByPassword(api, password);

      // First add TOTP MFA (backup codes cannot be the only MFA factor)
      const { secret } = await generateTotpSecret(api);
      await addMfaVerification(api, verificationRecordId, {
        type: MfaFactor.TOTP,
        secret,
      });

      // Generate and add backup codes
      const { codes } = await generateBackupCodes(api);
      await addMfaVerification(api, verificationRecordId, {
        type: MfaFactor.BackupCode,
        codes,
      });

      // Verify with first backup code should succeed
      const response = await verifyBackupCodeMfa(api, codes[0]!);
      expect(response.status).toBe(204);

      // Verify the same code again should fail (already used)
      await expectRejects(verifyBackupCodeMfa(api, codes[0]!), {
        code: 'session.mfa.invalid_backup_code',
        status: 422,
      });

      // Verify with second backup code should succeed
      const response2 = await verifyBackupCodeMfa(api, codes[1]!);
      expect(response2.status).toBe(204);

      await deleteDefaultTenantUser(user.id);
    });

    devFeatureTest.it('should fail with invalid backup code format', async () => {
      const { user, username, password } = await createDefaultTenantUserWithPassword();
      const api = await signInAndGetUserApi(username, password, {
        scopes: [UserScope.Profile, UserScope.Identities],
      });

      const verificationRecordId = await createVerificationRecordByPassword(api, password);

      // First add TOTP MFA
      const { secret } = await generateTotpSecret(api);
      await addMfaVerification(api, verificationRecordId, {
        type: MfaFactor.TOTP,
        secret,
      });

      // Add backup codes
      const { codes } = await generateBackupCodes(api);
      await addMfaVerification(api, verificationRecordId, {
        type: MfaFactor.BackupCode,
        codes,
      });

      // Try with invalid format (should be 10 hex characters)
      await expectRejects(verifyBackupCodeMfa(api, '123456'), {
        code: 'guard.invalid_input',
        status: 400,
      });

      // Try with valid format but non-existent code
      await expectRejects(verifyBackupCodeMfa(api, '1234567890'), {
        code: 'session.mfa.invalid_backup_code',
        status: 422,
      });

      await deleteDefaultTenantUser(user.id);
    });

    devFeatureTest.it('should fail when user has no backup codes', async () => {
      const { user, username, password } = await createDefaultTenantUserWithPassword();
      const api = await signInAndGetUserApi(username, password, {
        scopes: [UserScope.Profile, UserScope.Identities],
      });

      // Try to verify backup code without having backup codes configured (use valid format)
      await expectRejects(verifyBackupCodeMfa(api, '1234567890'), {
        code: 'session.mfa.mfa_factor_not_enabled',
        status: 422,
      });

      await deleteDefaultTenantUser(user.id);
    });

    devFeatureTest.it('should fail without required scope', async () => {
      const { user, username, password } = await createDefaultTenantUserWithPassword();
      const api = await signInAndGetUserApi(username, password, {
        scopes: [UserScope.Profile], // Missing UserScope.Identities
      });

      await expectRejects(verifyBackupCodeMfa(api, '1234567890'), {
        code: 'auth.unauthorized',
        status: 401,
      });

      await deleteDefaultTenantUser(user.id);
    });

    devFeatureTest.it('should fail when trying to reuse already used backup codes', async () => {
      const { user, username, password } = await createDefaultTenantUserWithPassword();
      const api = await signInAndGetUserApi(username, password, {
        scopes: [UserScope.Profile, UserScope.Identities],
      });

      const verificationRecordId = await createVerificationRecordByPassword(api, password);

      // First add TOTP MFA
      const { secret } = await generateTotpSecret(api);
      await addMfaVerification(api, verificationRecordId, {
        type: MfaFactor.TOTP,
        secret,
      });

      // Generate and add backup codes
      const { codes } = await generateBackupCodes(api);
      await addMfaVerification(api, verificationRecordId, {
        type: MfaFactor.BackupCode,
        codes,
      });

      // Use first two backup codes for testing
      const testCodes = codes.slice(0, 2);
      for (const code of testCodes) {
        // eslint-disable-next-line no-await-in-loop -- We need to use codes sequentially to avoid race conditions
        const response = await verifyBackupCodeMfa(api, code);
        expect(response.status).toBe(204);
      }

      // Try to use any code after it's been used
      await expectRejects(verifyBackupCodeMfa(api, testCodes[0]!), {
        code: 'session.mfa.invalid_backup_code',
        status: 422,
      });

      await deleteDefaultTenantUser(user.id);
    });
  });
});
