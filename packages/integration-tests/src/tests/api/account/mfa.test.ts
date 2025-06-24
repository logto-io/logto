import { UserScope } from '@logto/core-kit';
import { MfaFactor } from '@logto/schemas';

import { enableAllAccountCenterFields } from '#src/api/account-center.js';
import {
  addMfaVerification,
  deleteMfaVerification,
  generateTotpSecret,
  generateBackupCodes,
  getBackupCodes,
  getMfaVerifications,
} from '#src/api/my-account.js';
import {
  createVerificationRecordByPassword,
  createWebAuthnRegistrationOptions,
  verifyWebAuthnRegistration,
} from '#src/api/verification-record.js';
import { expectRejects } from '#src/helpers/index.js';
import {
  createDefaultTenantUserWithPassword,
  deleteDefaultTenantUser,
  signInAndGetUserApi,
} from '#src/helpers/profile.js';
import {
  enableAllPasswordSignInMethods,
  enableUserControlledMfaWithTotpAndWebAuthn,
  enableAllUserControlledMfaFactors,
  resetMfaSettings,
} from '#src/helpers/sign-in-experience.js';
import { devFeatureTest } from '#src/utils.js';

describe('my-account (mfa)', () => {
  beforeAll(async () => {
    await enableAllPasswordSignInMethods();
    await enableAllAccountCenterFields();
    await enableUserControlledMfaWithTotpAndWebAuthn();
  });

  afterAll(async () => {
    await resetMfaSettings();
  });

  devFeatureTest.describe('POST /my-account/mfa-verifications/totp-secret/generate', () => {
    devFeatureTest.it('should be able to generate totp secret', async () => {
      const { user, username, password } = await createDefaultTenantUserWithPassword();
      const api = await signInAndGetUserApi(username, password, {
        scopes: [UserScope.Profile, UserScope.Identities],
      });

      const { secret } = await generateTotpSecret(api);

      expect(secret).toBeTruthy();

      await deleteDefaultTenantUser(user.id);
    });
  });

  devFeatureTest.describe('POST /my-account/mfa-verifications/backup-codes/generate', () => {
    devFeatureTest.it('should be able to generate backup codes', async () => {
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

  devFeatureTest.describe('POST /my-account/mfa-verifications', () => {
    devFeatureTest.it('should be able to add totp verification', async () => {
      await enableAllAccountCenterFields();

      const { user, username, password } = await createDefaultTenantUserWithPassword();
      const api = await signInAndGetUserApi(username, password, {
        scopes: [UserScope.Profile, UserScope.Identities],
      });
      const { secret } = await generateTotpSecret(api);
      const verificationRecordId = await createVerificationRecordByPassword(api, password);

      await addMfaVerification(api, verificationRecordId, {
        type: MfaFactor.TOTP,
        secret,
      });
      const mfaVerifications = await getMfaVerifications(api);

      expect(mfaVerifications).toHaveLength(1);
      expect(mfaVerifications[0]?.type).toBe(MfaFactor.TOTP);

      await deleteDefaultTenantUser(user.id);
    });

    devFeatureTest.it('should fail if totp secret is invalid', async () => {
      await enableAllAccountCenterFields();

      const { user, username, password } = await createDefaultTenantUserWithPassword();
      const api = await signInAndGetUserApi(username, password, {
        scopes: [UserScope.Profile, UserScope.Identities],
      });
      const verificationRecordId = await createVerificationRecordByPassword(api, password);

      await expectRejects(
        addMfaVerification(api, verificationRecordId, {
          type: MfaFactor.TOTP,
          secret: 'invalid-totp-secret',
        }),
        {
          code: 'user.totp_secret_invalid',
          status: 400,
        }
      );

      await deleteDefaultTenantUser(user.id);
    });
  });

  devFeatureTest.describe('DELETE /my-account/mfa-verifications/:verificationId', () => {
    devFeatureTest.it('should be able to delete totp verification', async () => {
      await enableAllAccountCenterFields();

      const { user, username, password } = await createDefaultTenantUserWithPassword();
      const api = await signInAndGetUserApi(username, password, {
        scopes: [UserScope.Profile, UserScope.Identities],
      });
      const { secret } = await generateTotpSecret(api);
      const verificationRecordId = await createVerificationRecordByPassword(api, password);

      // Add TOTP verification
      await addMfaVerification(api, verificationRecordId, {
        type: MfaFactor.TOTP,
        secret,
      });

      const mfaVerifications = await getMfaVerifications(api);
      expect(mfaVerifications).toHaveLength(1);
      expect(mfaVerifications[0]?.type).toBe(MfaFactor.TOTP);

      const totpVerificationId = mfaVerifications[0]?.id;
      expect(totpVerificationId).toBeTruthy();

      // Delete TOTP verification
      const deleteVerificationRecordId = await createVerificationRecordByPassword(api, password);
      await deleteMfaVerification(api, totpVerificationId!, deleteVerificationRecordId);

      const updatedMfaVerifications = await getMfaVerifications(api);
      expect(updatedMfaVerifications).toHaveLength(0);

      await deleteDefaultTenantUser(user.id);
    });
  });

  describe('POST /my-account/mfa-verifications/web-authn/registration', () => {
    it('should be able to get webauthn registration options', async () => {
      const { user, username, password } = await createDefaultTenantUserWithPassword();
      const api = await signInAndGetUserApi(username, password, {
        scopes: [UserScope.Profile],
      });

      const { verificationRecordId, registrationOptions } =
        await createWebAuthnRegistrationOptions(api);

      expect(verificationRecordId).toBeTruthy();
      expect(registrationOptions.rp.name).toBe('localhost');
      expect(registrationOptions.user.displayName).toBe(user.username);

      await deleteDefaultTenantUser(user.id);
    });

    it('should be able to verify webauthn registration', async () => {
      const { user, username, password } = await createDefaultTenantUserWithPassword();
      const api = await signInAndGetUserApi(username, password, {
        scopes: [UserScope.Profile],
      });

      const {
        verificationRecordId,
        registrationOptions: {
          rp: { id: rpId },
          challenge,
        },
      } = await createWebAuthnRegistrationOptions(api);

      const rawId = Buffer.from(rpId ?? 'localhost')
        .toString('base64')
        .replaceAll('+', '-')
        .replaceAll('/', '_')
        .replace(/=+$/, '');

      // This error is expected because the mock registration response
      // can not pass the server side validation.
      await expectRejects(
        verifyWebAuthnRegistration(api, verificationRecordId, {
          type: MfaFactor.WebAuthn,
          id: rawId,
          rawId,
          response: {
            clientDataJSON: Buffer.from(
              JSON.stringify({
                type: 'webauthn.create',
                challenge,
                origin: 'http://localhost:3001',
                crossOrigin: false,
              })
            ).toString('base64url'),
            attestationObject: rawId,
          },
          clientExtensionResults: {},
        }),
        {
          code: 'session.mfa.webauthn_verification_failed',
          status: 400,
        }
      );

      await deleteDefaultTenantUser(user.id);
    });
  });

  devFeatureTest.describe('POST /my-account/mfa-verifications (backup codes)', () => {
    beforeAll(async () => {
      await enableAllUserControlledMfaFactors();
    });

    afterAll(async () => {
      await resetMfaSettings();
    });

    devFeatureTest.it('should be able to add backup codes after TOTP', async () => {
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

    devFeatureTest.it('should fail to add backup codes without other MFA factor', async () => {
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

    devFeatureTest.it(
      'should fail to add backup codes when already has active backup codes',
      async () => {
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
      }
    );
  });

  devFeatureTest.describe('GET /my-account/mfa-verifications/backup-codes', () => {
    beforeAll(async () => {
      await enableAllUserControlledMfaFactors();
    });

    afterAll(async () => {
      await resetMfaSettings();
    });

    devFeatureTest.it('should be able to get backup codes after adding them', async () => {
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

    devFeatureTest.it('should fail to get backup codes without identity verification', async () => {
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

    devFeatureTest.it('should fail to get backup codes when no backup codes exist', async () => {
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
});
