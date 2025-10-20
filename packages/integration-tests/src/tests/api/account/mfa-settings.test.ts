import { UserScope } from '@logto/core-kit';
import { AccountCenterControlValue } from '@logto/schemas';

import { enableAllAccountCenterFields, updateAccountCenter } from '#src/api/account-center.js';
import {
  getMfaSettings,
  getMyLogtoConfig,
  updateMfaSettings,
  updateMyLogtoConfig,
} from '#src/api/my-account.js';
import { createVerificationRecordByPassword } from '#src/api/verification-record.js';
import { expectRejects } from '#src/helpers/index.js';
import {
  createDefaultTenantUserWithPassword,
  deleteDefaultTenantUser,
  signInAndGetUserApi,
} from '#src/helpers/profile.js';
import { enableAllPasswordSignInMethods } from '#src/helpers/sign-in-experience.js';

describe('my-account (mfa-settings)', () => {
  beforeAll(async () => {
    await enableAllPasswordSignInMethods();
    await enableAllAccountCenterFields();
  });

  describe('GET /api/my-account/mfa-settings', () => {
    it('should get default MFA settings', async () => {
      const { user, username, password } = await createDefaultTenantUserWithPassword();
      const api = await signInAndGetUserApi(username, password, {
        scopes: [UserScope.Profile, UserScope.Identities],
      });

      const mfaSettings = await getMfaSettings(api);

      expect(mfaSettings).toEqual({
        skipMfaOnSignIn: false, // Default value (MFA required)
      });

      await deleteDefaultTenantUser(user.id);
    });

    it('should throw error if user does not have Identities scope', async () => {
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

    it('should throw error if MFA field is not enabled in account center', async () => {
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
    });

    it('should work when MFA field is ReadOnly', async () => {
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
        skipMfaOnSignIn: false,
      });

      await deleteDefaultTenantUser(user.id);
      await enableAllAccountCenterFields(); // Reset for other tests
    });
  });

  describe('PATCH /api/my-account/mfa-settings', () => {
    it('should update MFA settings successfully', async () => {
      const { user, username, password } = await createDefaultTenantUserWithPassword();
      const api = await signInAndGetUserApi(username, password, {
        scopes: [UserScope.Profile, UserScope.Identities],
      });

      // Create verification record
      const verificationRecordId = await createVerificationRecordByPassword(api, password);

      // Update MFA settings to skip MFA
      const updateResponse = await updateMfaSettings(api, verificationRecordId, true);
      expect(updateResponse).toEqual({ skipMfaOnSignIn: true });

      // Update back to require MFA
      const verificationRecordId2 = await createVerificationRecordByPassword(api, password);
      const updateResponse2 = await updateMfaSettings(api, verificationRecordId2, false);
      expect(updateResponse2).toEqual({ skipMfaOnSignIn: false });

      await deleteDefaultTenantUser(user.id);
    });

    it('should throw error if user does not have Identities scope', async () => {
      const { user, username, password } = await createDefaultTenantUserWithPassword();
      const api = await signInAndGetUserApi(username, password, {
        scopes: [UserScope.Profile], // Missing Identities scope
      });

      const verificationRecordId = await createVerificationRecordByPassword(api, password);

      await expectRejects(updateMfaSettings(api, verificationRecordId, true), {
        code: 'auth.unauthorized',
        status: 401,
      });

      await deleteDefaultTenantUser(user.id);
    });

    it('should throw error if identity is not verified', async () => {
      const { user, username, password } = await createDefaultTenantUserWithPassword();
      const api = await signInAndGetUserApi(username, password, {
        scopes: [UserScope.Profile, UserScope.Identities],
      });

      // Try to update without verification record
      await expectRejects(updateMfaSettings(api, 'invalid-verification-id', true), {
        code: 'verification_record.permission_denied',
        status: 401,
      });

      await deleteDefaultTenantUser(user.id);
    });

    it('should throw error if MFA field is not editable', async () => {
      await updateAccountCenter({
        enabled: true,
        fields: { mfa: AccountCenterControlValue.ReadOnly },
      });

      const { user, username, password } = await createDefaultTenantUserWithPassword();
      const api = await signInAndGetUserApi(username, password, {
        scopes: [UserScope.Profile, UserScope.Identities],
      });

      const verificationRecordId = await createVerificationRecordByPassword(api, password);

      await expectRejects(updateMfaSettings(api, verificationRecordId, true), {
        code: 'account_center.field_not_editable',
        status: 400,
      });

      await deleteDefaultTenantUser(user.id);
      await enableAllAccountCenterFields(); // Reset for other tests
    });

    it('should throw error if MFA field is disabled', async () => {
      await updateAccountCenter({
        enabled: true,
        fields: { mfa: AccountCenterControlValue.Off },
      });

      const { user, username, password } = await createDefaultTenantUserWithPassword();
      const api = await signInAndGetUserApi(username, password, {
        scopes: [UserScope.Profile, UserScope.Identities],
      });

      const verificationRecordId = await createVerificationRecordByPassword(api, password);

      await expectRejects(updateMfaSettings(api, verificationRecordId, true), {
        code: 'account_center.field_not_editable',
        status: 400,
      });

      await deleteDefaultTenantUser(user.id);
      await enableAllAccountCenterFields(); // Reset for other tests
    });
  });

  describe('PATCH /api/my-account/logto-configs', () => {
    it('should update MFA skip state successfully', async () => {
      const { user, username, password } = await createDefaultTenantUserWithPassword();
      const api = await signInAndGetUserApi(username, password, {
        scopes: [UserScope.Profile, UserScope.Identities],
      });

      const response = await updateMyLogtoConfig(api, { mfa: { skipped: true } });
      expect(response).toEqual({ mfa: { skipped: true } });

      const updatedConfig = await getMyLogtoConfig(api);
      expect(updatedConfig.mfa.skipped).toBe(true);

      const response2 = await updateMyLogtoConfig(api, { mfa: { skipped: false } });
      expect(response2).toEqual({ mfa: { skipped: false } });

      const updatedConfig2 = await getMyLogtoConfig(api);
      expect(updatedConfig2.mfa.skipped).toBe(false);

      await deleteDefaultTenantUser(user.id);
    });

    it('should throw error if user does not have Identities scope', async () => {
      const { user, username, password } = await createDefaultTenantUserWithPassword();
      const api = await signInAndGetUserApi(username, password, {
        scopes: [UserScope.Profile],
      });

      await expectRejects(updateMyLogtoConfig(api, { mfa: { skipped: true } }), {
        code: 'auth.unauthorized',
        status: 401,
      });

      await deleteDefaultTenantUser(user.id);
    });

    it('should throw error if MFA field is not editable', async () => {
      await updateAccountCenter({
        enabled: true,
        fields: { mfa: AccountCenterControlValue.ReadOnly },
      });

      const { user, username, password } = await createDefaultTenantUserWithPassword();
      const api = await signInAndGetUserApi(username, password, {
        scopes: [UserScope.Profile, UserScope.Identities],
      });

      await expectRejects(updateMyLogtoConfig(api, { mfa: { skipped: true } }), {
        code: 'account_center.field_not_editable',
        status: 400,
      });

      await deleteDefaultTenantUser(user.id);
      await enableAllAccountCenterFields();
    });

    it('should throw error if MFA field is disabled', async () => {
      await updateAccountCenter({
        enabled: true,
        fields: { mfa: AccountCenterControlValue.Off },
      });

      const { user, username, password } = await createDefaultTenantUserWithPassword();
      const api = await signInAndGetUserApi(username, password, {
        scopes: [UserScope.Profile, UserScope.Identities],
      });

      await expectRejects(updateMyLogtoConfig(api, { mfa: { skipped: true } }), {
        code: 'account_center.field_not_editable',
        status: 400,
      });

      await deleteDefaultTenantUser(user.id);
      await enableAllAccountCenterFields();
    });
  });
});
