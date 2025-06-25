import { UserScope } from '@logto/core-kit';
import { MfaFactor, type User } from '@logto/schemas';
import { type KyInstance } from 'ky';

import { enableAllAccountCenterFields } from '#src/api/account-center.js';
import {
  addMfaVerification,
  generateTotpSecret,
  generateBackupCodes,
  getMfaVerifications,
} from '#src/api/my-account.js';
import { createVerificationRecordByPassword } from '#src/api/verification-record.js';
import { createDefaultTenantUserWithPassword, signInAndGetUserApi } from '#src/helpers/profile.js';
import {
  enableAllPasswordSignInMethods,
  enableAllUserControlledMfaFactors,
} from '#src/helpers/sign-in-experience.js';

export type MfaTestUser = {
  user: User;
  username: string;
  password: string;
  api: KyInstance;
};

/**
 * Creates a test user with proper scopes for MFA testing
 */
export async function createMfaTestUser(): Promise<MfaTestUser> {
  const { user, username, password } = await createDefaultTenantUserWithPassword();
  const api = await signInAndGetUserApi(username, password, {
    scopes: [UserScope.Profile, UserScope.Identities],
  });

  return { user, username, password, api };
}

/**
 * Sets up common MFA test environment
 */
export async function setupMfaTestEnvironment() {
  await enableAllPasswordSignInMethods();
  await enableAllAccountCenterFields();
  await enableAllUserControlledMfaFactors();
}

/**
 * Adds TOTP verification for a user
 */
export async function addTotpVerification(api: KyInstance, password: string) {
  const { secret } = await generateTotpSecret(api);
  const verificationRecordId = await createVerificationRecordByPassword(api, password);

  await addMfaVerification(api, verificationRecordId, {
    type: MfaFactor.TOTP,
    secret,
  });

  return { secret, verificationRecordId };
}

/**
 * Adds backup codes verification for a user (requires existing TOTP)
 */
export async function addBackupCodesVerification(api: KyInstance, password: string) {
  const { codes } = await generateBackupCodes(api);
  const verificationRecordId = await createVerificationRecordByPassword(api, password);

  await addMfaVerification(api, verificationRecordId, {
    type: MfaFactor.BackupCode,
    codes,
  });

  return { codes, verificationRecordId };
}

/**
 * Sets up a user with both TOTP and backup codes
 */
export async function setupUserWithTotpAndBackupCodes(api: KyInstance, password: string) {
  const totpResult = await addTotpVerification(api, password);
  const backupResult = await addBackupCodesVerification(api, password);

  const mfaVerifications = await getMfaVerifications(api);
  const totpVerification = mfaVerifications.find(
    (verification) => verification.type === MfaFactor.TOTP
  );
  const backupVerification = mfaVerifications.find(
    (verification) => verification.type === MfaFactor.BackupCode
  );

  return {
    totp: { ...totpResult, verification: totpVerification },
    backup: { ...backupResult, verification: backupVerification },
    allVerifications: mfaVerifications,
  };
}
