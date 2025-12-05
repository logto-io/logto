import { UserScope } from '@logto/core-kit';
import { MfaFactor } from '@logto/schemas';
import { authenticator } from 'otplib';

import { enableAllAccountCenterFields } from '#src/api/account-center.js';
import {
  addMfaVerification,
  deleteMfaVerification,
  generateTotpSecret,
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
  enableUserControlledMfaWithTotpAndWebAuthn,
  resetMfaSettings,
} from '#src/helpers/sign-in-experience.js';

describe('my-account (mfa - TOTP)', () => {
  beforeAll(async () => {
    await enableAllPasswordSignInMethods();
    await enableAllAccountCenterFields();
    await enableUserControlledMfaWithTotpAndWebAuthn();
  });

  afterAll(async () => {
    await resetMfaSettings();
  });

  describe('POST /my-account/mfa-verifications/totp-secret/generate', () => {
    it('should be able to generate totp secret', async () => {
      const { user, username, password } = await createDefaultTenantUserWithPassword();
      const api = await signInAndGetUserApi(username, password, {
        scopes: [UserScope.Profile, UserScope.Identities],
      });

      const { secret } = await generateTotpSecret(api);

      expect(secret).toBeTruthy();

      await deleteDefaultTenantUser(user.id);
    });
  });

  describe('POST /my-account/mfa-verifications (TOTP)', () => {
    it('should be able to add totp verification', async () => {
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

    it('should fail if totp secret is invalid', async () => {
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

    it('should be able to add totp verification with code', async () => {
      await enableAllAccountCenterFields();

      const { user, username, password } = await createDefaultTenantUserWithPassword();
      const api = await signInAndGetUserApi(username, password, {
        scopes: [UserScope.Profile, UserScope.Identities],
      });
      const { secret } = await generateTotpSecret(api);
      const verificationRecordId = await createVerificationRecordByPassword(api, password);

      const code = authenticator.generate(secret);

      await addMfaVerification(api, verificationRecordId, {
        type: MfaFactor.TOTP,
        secret,
        code,
      });
      const mfaVerifications = await getMfaVerifications(api);

      expect(mfaVerifications).toHaveLength(1);
      expect(mfaVerifications[0]?.type).toBe(MfaFactor.TOTP);

      await deleteDefaultTenantUser(user.id);
    });
  });

  describe('DELETE /my-account/mfa-verifications/:verificationId (TOTP)', () => {
    it('should be able to delete totp verification', async () => {
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
});
