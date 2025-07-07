import { UserScope } from '@logto/core-kit';
import { MfaFactor } from '@logto/schemas';
import { authenticator } from 'otplib';

import { enableAllAccountCenterFields } from '#src/api/account-center.js';
import { addMfaVerification, generateTotpSecret, verifyTotpMfa } from '#src/api/my-account.js';
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
import { devFeatureTest } from '#src/utils.js';

describe('my-account (mfa verification)', () => {
  beforeAll(async () => {
    await enableAllPasswordSignInMethods();
    await enableAllAccountCenterFields();
    await enableUserControlledMfaWithTotpAndWebAuthn();
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
});
