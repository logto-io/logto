import { UserScope } from '@logto/core-kit';
import { AccountCenterControlValue } from '@logto/schemas';

import { enableAllAccountCenterFields, updateAccountCenter } from '#src/api/account-center.js';
import { getMfaSettings, updateMfaSettings } from '#src/api/my-account.js';
import { createVerificationRecordByPassword } from '#src/api/verification-record.js';
import { expectRejects } from '#src/helpers/index.js';
import {
  createDefaultTenantUserWithPassword,
  deleteDefaultTenantUser,
  signInAndGetUserApi,
} from '#src/helpers/profile.js';
import { enableAllPasswordSignInMethods } from '#src/helpers/sign-in-experience.js';
import { devFeatureTest } from '#src/utils.js';

devFeatureTest.describe('my-account (mfa-settings)', () => {
  beforeAll(async () => {
    await enableAllPasswordSignInMethods();
    await enableAllAccountCenterFields();
  });

  devFeatureTest.describe('GET /api/my-account/mfa-settings', () => {
    devFeatureTest.it('should get default MFA settings', async () => {
      const { user, username, password } = await createDefaultTenantUserWithPassword();
      const api = await signInAndGetUserApi(username, password, {
        scopes: [UserScope.Profile, UserScope.Identities],
      });

      const mfaSettings = await getMfaSettings(api);

      expect(mfaSettings).toEqual({
        requireMfaOnSignIn: true, // Default value from database schema
      });

      await deleteDefaultTenantUser(user.id);
    });

    devFeatureTest.it('should throw error if user does not have Identities scope', async () => {
      const { user, username, password } = await createDefaultTenantUserWithPassword();
      const api = await signInAndGetUserApi(username, password, {
        scopes: [UserScope.Profile], // Missing Identities scope
      });

      await expectRejects(getMfaSettings(api), {
        code: 'auth.unauthorized',
        status: 401,
      });

      await deleteDefaultTenantUser(user.id);
    });

    devFeatureTest.it(
      'should throw error if MFA field is not enabled in account center',
      async () => {
        await updateAccountCenter({
          enabled: true,
          fields: { mfa: AccountCenterControlValue.Off },
        });

        const { user, username, password } = await createDefaultTenantUserWithPassword();
        const api = await signInAndGetUserApi(username, password, {
          scopes: [UserScope.Profile, UserScope.Identities],
        });

        await expectRejects(getMfaSettings(api), {
          code: 'account_center.field_not_enabled',
          status: 400,
        });

        await deleteDefaultTenantUser(user.id);
        await enableAllAccountCenterFields(); // Reset for other tests
      }
    );

    devFeatureTest.it('should work when MFA field is ReadOnly', async () => {
      await updateAccountCenter({
        enabled: true,
        fields: { mfa: AccountCenterControlValue.ReadOnly },
      });

      const { user, username, password } = await createDefaultTenantUserWithPassword();
      const api = await signInAndGetUserApi(username, password, {
        scopes: [UserScope.Profile, UserScope.Identities],
      });

      const mfaSettings = await getMfaSettings(api);

      expect(mfaSettings).toEqual({
        requireMfaOnSignIn: true,
      });

      await deleteDefaultTenantUser(user.id);
      await enableAllAccountCenterFields(); // Reset for other tests
    });
  });

  devFeatureTest.describe('PATCH /api/my-account/mfa-settings', () => {
    devFeatureTest.it('should update MFA settings successfully', async () => {
      const { user, username, password } = await createDefaultTenantUserWithPassword();
      const api = await signInAndGetUserApi(username, password, {
        scopes: [UserScope.Profile, UserScope.Identities],
      });

      // Create verification record
      const verificationRecordId = await createVerificationRecordByPassword(api, password);

      // Update MFA settings
      await updateMfaSettings(api, verificationRecordId, false);

      // Verify the change
      const mfaSettings = await getMfaSettings(api);
      expect(mfaSettings.requireMfaOnSignIn).toBe(false);

      // Update back to true
      const verificationRecordId2 = await createVerificationRecordByPassword(api, password);
      await updateMfaSettings(api, verificationRecordId2, true);

      // Verify the change again
      const mfaSettings2 = await getMfaSettings(api);
      expect(mfaSettings2.requireMfaOnSignIn).toBe(true);

      await deleteDefaultTenantUser(user.id);
    });

    devFeatureTest.it('should throw error if user does not have Identities scope', async () => {
      const { user, username, password } = await createDefaultTenantUserWithPassword();
      const api = await signInAndGetUserApi(username, password, {
        scopes: [UserScope.Profile], // Missing Identities scope
      });

      const verificationRecordId = await createVerificationRecordByPassword(api, password);

      await expectRejects(updateMfaSettings(api, verificationRecordId, false), {
        code: 'auth.unauthorized',
        status: 401,
      });

      await deleteDefaultTenantUser(user.id);
    });

    devFeatureTest.it('should throw error if identity is not verified', async () => {
      const { user, username, password } = await createDefaultTenantUserWithPassword();
      const api = await signInAndGetUserApi(username, password, {
        scopes: [UserScope.Profile, UserScope.Identities],
      });

      // Try to update without verification record
      await expectRejects(updateMfaSettings(api, 'invalid-verification-id', false), {
        code: 'verification_record.permission_denied',
        status: 401,
      });

      await deleteDefaultTenantUser(user.id);
    });

    devFeatureTest.it('should throw error if MFA field is not editable', async () => {
      await updateAccountCenter({
        enabled: true,
        fields: { mfa: AccountCenterControlValue.ReadOnly },
      });

      const { user, username, password } = await createDefaultTenantUserWithPassword();
      const api = await signInAndGetUserApi(username, password, {
        scopes: [UserScope.Profile, UserScope.Identities],
      });

      const verificationRecordId = await createVerificationRecordByPassword(api, password);

      await expectRejects(updateMfaSettings(api, verificationRecordId, false), {
        code: 'account_center.field_not_editable',
        status: 400,
      });

      await deleteDefaultTenantUser(user.id);
      await enableAllAccountCenterFields(); // Reset for other tests
    });

    devFeatureTest.it('should throw error if MFA field is disabled', async () => {
      await updateAccountCenter({
        enabled: true,
        fields: { mfa: AccountCenterControlValue.Off },
      });

      const { user, username, password } = await createDefaultTenantUserWithPassword();
      const api = await signInAndGetUserApi(username, password, {
        scopes: [UserScope.Profile, UserScope.Identities],
      });

      const verificationRecordId = await createVerificationRecordByPassword(api, password);

      await expectRejects(updateMfaSettings(api, verificationRecordId, false), {
        code: 'account_center.field_not_editable',
        status: 400,
      });

      await deleteDefaultTenantUser(user.id);
      await enableAllAccountCenterFields(); // Reset for other tests
    });
  });
});
