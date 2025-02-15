import { UserScope } from '@logto/core-kit';
import { SignInIdentifier } from '@logto/schemas';

import { enableAllAccountCenterFields } from '#src/api/account-center.js';
import { authedAdminApi } from '#src/api/api.js';
import {
  deletePrimaryEmail,
  deletePrimaryPhone,
  getUserInfo,
  updatePrimaryEmail,
  updatePrimaryPhone,
} from '#src/api/my-account.js';
import {
  createAndVerifyVerificationCode,
  createVerificationRecordByPassword,
} from '#src/api/verification-record.js';
import { setEmailConnector, setSmsConnector } from '#src/helpers/connector.js';
import { expectRejects } from '#src/helpers/index.js';
import {
  createDefaultTenantUserWithPassword,
  deleteDefaultTenantUser,
  signInAndGetUserApi,
} from '#src/helpers/profile.js';
import { enableAllPasswordSignInMethods } from '#src/helpers/sign-in-experience.js';
import { generateEmail, generatePhone } from '#src/utils.js';

describe('account (email and phone)', () => {
  beforeAll(async () => {
    await enableAllPasswordSignInMethods();
    await setEmailConnector(authedAdminApi);
    await setSmsConnector(authedAdminApi);
    await enableAllAccountCenterFields(authedAdminApi);
  });

  describe('POST /my-account/primary-email', () => {
    it('should fail if scope is missing', async () => {
      const { user, username, password } = await createDefaultTenantUserWithPassword();
      const api = await signInAndGetUserApi(username, password);
      const newEmail = generateEmail();
      const verificationRecordId = await createVerificationRecordByPassword(api, password);

      await expectRejects(
        updatePrimaryEmail(api, newEmail, verificationRecordId, 'new-verification-record-id'),
        {
          code: 'auth.unauthorized',
          status: 400,
        }
      );

      await deleteDefaultTenantUser(user.id);
    });

    it('should fail if verification record is invalid', async () => {
      const { user, username, password } = await createDefaultTenantUserWithPassword();
      const api = await signInAndGetUserApi(username, password, {
        scopes: [UserScope.Profile, UserScope.Email],
      });
      const newEmail = generateEmail();

      await expectRejects(
        updatePrimaryEmail(
          api,
          newEmail,
          'invalid-verification-record-id',
          'new-verification-record-id'
        ),
        {
          code: 'verification_record.permission_denied',
          status: 401,
        }
      );

      await deleteDefaultTenantUser(user.id);
    });

    it('should fail if new identifier verification record is invalid', async () => {
      const { user, username, password } = await createDefaultTenantUserWithPassword();
      const api = await signInAndGetUserApi(username, password, {
        scopes: [UserScope.Profile, UserScope.Email],
      });
      const newEmail = generateEmail();
      const verificationRecordId = await createVerificationRecordByPassword(api, password);

      await expectRejects(
        updatePrimaryEmail(api, newEmail, verificationRecordId, 'new-verification-record-id'),
        {
          code: 'verification_record.not_found',
          status: 400,
        }
      );

      await deleteDefaultTenantUser(user.id);
    });

    it('should be able to update primary email by verifying password', async () => {
      const { user, username, password } = await createDefaultTenantUserWithPassword();
      const api = await signInAndGetUserApi(username, password, {
        scopes: [UserScope.Profile, UserScope.Email],
      });
      const newEmail = generateEmail();
      const verificationRecordId = await createVerificationRecordByPassword(api, password);
      const newVerificationRecordId = await createAndVerifyVerificationCode(api, {
        type: SignInIdentifier.Email,
        value: newEmail,
      });

      await updatePrimaryEmail(api, newEmail, verificationRecordId, newVerificationRecordId);

      const userInfo = await getUserInfo(api);
      expect(userInfo).toHaveProperty('primaryEmail', newEmail);

      await deleteDefaultTenantUser(user.id);
    });

    it('should be able to update primary email by verifying existing email', async () => {
      const primaryEmail = generateEmail();
      const { user, username, password } = await createDefaultTenantUserWithPassword({
        primaryEmail,
      });
      const api = await signInAndGetUserApi(username, password, {
        scopes: [UserScope.Profile, UserScope.Email],
      });
      const newEmail = generateEmail();
      const verificationRecordId = await createAndVerifyVerificationCode(api, {
        type: SignInIdentifier.Email,
        value: primaryEmail,
      });
      const newVerificationRecordId = await createAndVerifyVerificationCode(api, {
        type: SignInIdentifier.Email,
        value: newEmail,
      });

      await updatePrimaryEmail(api, newEmail, verificationRecordId, newVerificationRecordId);

      const userInfo = await getUserInfo(api);
      expect(userInfo).toHaveProperty('primaryEmail', newEmail);

      await deleteDefaultTenantUser(user.id);
    });
  });

  describe('DELETE /my-account/primary-email', () => {
    it('should fail if scope is missing', async () => {
      const { user, username, password } = await createDefaultTenantUserWithPassword();
      const api = await signInAndGetUserApi(username, password);
      const verificationRecordId = await createVerificationRecordByPassword(api, password);

      await expectRejects(deletePrimaryEmail(api, verificationRecordId), {
        code: 'auth.unauthorized',
        status: 400,
      });

      await deleteDefaultTenantUser(user.id);
    });

    it('should fail if verification record is invalid', async () => {
      const { user, username, password } = await createDefaultTenantUserWithPassword();
      const api = await signInAndGetUserApi(username, password, {
        scopes: [UserScope.Profile, UserScope.Email],
      });

      await expectRejects(deletePrimaryEmail(api, 'invalid-verification-record-id'), {
        code: 'verification_record.permission_denied',
        status: 401,
      });

      await deleteDefaultTenantUser(user.id);
    });

    it('should fail if email is the only sign-up identifier', async () => {
      const { user, username, password } = await createDefaultTenantUserWithPassword();
      const api = await signInAndGetUserApi(username, password, {
        scopes: [UserScope.Profile, UserScope.Email],
      });
      const verificationRecordId = await createVerificationRecordByPassword(api, password);
      await enableAllPasswordSignInMethods({
        identifiers: [SignInIdentifier.Email],
        password: true,
        verify: true,
      });

      await expectRejects(deletePrimaryEmail(api, verificationRecordId), {
        code: 'user.email_required',
        status: 400,
      });

      await enableAllPasswordSignInMethods();
      await deleteDefaultTenantUser(user.id);
    });

    it('should fail if email or phone is the sign-up identifier', async () => {
      const { user, username, password } = await createDefaultTenantUserWithPassword();
      const api = await signInAndGetUserApi(username, password, {
        scopes: [UserScope.Profile, UserScope.Email],
      });
      const verificationRecordId = await createVerificationRecordByPassword(api, password);
      await enableAllPasswordSignInMethods({
        identifiers: [SignInIdentifier.Email, SignInIdentifier.Phone],
        password: true,
        verify: true,
      });

      await expectRejects(deletePrimaryEmail(api, verificationRecordId), {
        code: 'user.email_or_phone_required',
        status: 400,
      });

      await enableAllPasswordSignInMethods();
      await deleteDefaultTenantUser(user.id);
    });

    it('should be able to delete primary email', async () => {
      const { user, username, password } = await createDefaultTenantUserWithPassword();
      const api = await signInAndGetUserApi(username, password, {
        scopes: [UserScope.Profile, UserScope.Email],
      });
      const verificationRecordId = await createVerificationRecordByPassword(api, password);
      const newEmail = generateEmail();
      const newVerificationRecordId = await createAndVerifyVerificationCode(api, {
        type: SignInIdentifier.Email,
        value: newEmail,
      });

      await updatePrimaryEmail(api, newEmail, verificationRecordId, newVerificationRecordId);

      const userInfo = await getUserInfo(api);
      expect(userInfo).toHaveProperty('primaryEmail', newEmail);

      await deletePrimaryEmail(api, verificationRecordId);

      const userInfoAfterDelete = await getUserInfo(api);
      expect(userInfoAfterDelete).toHaveProperty('primaryEmail', null);

      await deleteDefaultTenantUser(user.id);
    });
  });

  describe('POST /my-account/primary-phone', () => {
    it('should fail if scope is missing', async () => {
      const { user, username, password } = await createDefaultTenantUserWithPassword();
      const api = await signInAndGetUserApi(username, password);
      const verificationRecordId = await createVerificationRecordByPassword(api, password);

      await expectRejects(deletePrimaryPhone(api, verificationRecordId), {
        code: 'auth.unauthorized',
        status: 400,
      });

      await deleteDefaultTenantUser(user.id);
    });

    it('should fail if verification record is invalid', async () => {
      const { user, username, password } = await createDefaultTenantUserWithPassword();
      const api = await signInAndGetUserApi(username, password, {
        scopes: [UserScope.Profile, UserScope.Phone],
      });

      await expectRejects(deletePrimaryPhone(api, 'invalid-verification-record-id'), {
        code: 'verification_record.permission_denied',
        status: 401,
      });

      await deleteDefaultTenantUser(user.id);
    });

    it('should fail if phone is the only sign-up identifier', async () => {
      const { user, username, password } = await createDefaultTenantUserWithPassword();
      const api = await signInAndGetUserApi(username, password, {
        scopes: [UserScope.Profile, UserScope.Phone],
      });
      const verificationRecordId = await createVerificationRecordByPassword(api, password);
      await enableAllPasswordSignInMethods({
        identifiers: [SignInIdentifier.Phone],
        password: true,
        verify: true,
      });

      await expectRejects(deletePrimaryPhone(api, verificationRecordId), {
        code: 'user.phone_required',
        status: 400,
      });

      await enableAllPasswordSignInMethods();
      await deleteDefaultTenantUser(user.id);
    });

    it('should fail if email or phone is the sign-up identifier', async () => {
      const { user, username, password } = await createDefaultTenantUserWithPassword();
      const api = await signInAndGetUserApi(username, password, {
        scopes: [UserScope.Profile, UserScope.Phone],
      });
      const verificationRecordId = await createVerificationRecordByPassword(api, password);
      await enableAllPasswordSignInMethods({
        identifiers: [SignInIdentifier.Email, SignInIdentifier.Phone],
        password: true,
        verify: true,
      });

      await expectRejects(deletePrimaryPhone(api, verificationRecordId), {
        code: 'user.email_or_phone_required',
        status: 400,
      });

      await enableAllPasswordSignInMethods();
      await deleteDefaultTenantUser(user.id);
    });

    it('should be able to delete primary phone', async () => {
      const { user, username, password } = await createDefaultTenantUserWithPassword();
      const api = await signInAndGetUserApi(username, password, {
        scopes: [UserScope.Profile, UserScope.Phone],
      });
      const verificationRecordId = await createVerificationRecordByPassword(api, password);
      const newPhone = generatePhone();
      const newVerificationRecordId = await createAndVerifyVerificationCode(api, {
        type: SignInIdentifier.Phone,
        value: newPhone,
      });

      await updatePrimaryPhone(api, newPhone, verificationRecordId, newVerificationRecordId);

      const userInfo = await getUserInfo(api);
      expect(userInfo).toHaveProperty('primaryPhone', newPhone);

      await deletePrimaryPhone(api, verificationRecordId);

      const userInfoAfterDelete = await getUserInfo(api);
      expect(userInfoAfterDelete).toHaveProperty('primaryPhone', null);

      await deleteDefaultTenantUser(user.id);
    });
  });

  describe('DELETE /my-account/primary-phone', () => {
    it('should fail if scope is missing', async () => {
      const { user, username, password } = await createDefaultTenantUserWithPassword();
      const api = await signInAndGetUserApi(username, password);
      const verificationRecordId = await createVerificationRecordByPassword(api, password);

      await expectRejects(deletePrimaryPhone(api, verificationRecordId), {
        code: 'auth.unauthorized',
        status: 400,
      });

      await deleteDefaultTenantUser(user.id);
    });

    it('should fail if verification record is invalid', async () => {
      const { user, username, password } = await createDefaultTenantUserWithPassword();
      const api = await signInAndGetUserApi(username, password, {
        scopes: [UserScope.Profile, UserScope.Phone],
      });

      await expectRejects(deletePrimaryPhone(api, 'invalid-verification-record-id'), {
        code: 'verification_record.permission_denied',
        status: 401,
      });

      await deleteDefaultTenantUser(user.id);
    });

    it('should fail if phone is the only sign-up identifier', async () => {
      const { user, username, password } = await createDefaultTenantUserWithPassword();
      const api = await signInAndGetUserApi(username, password, {
        scopes: [UserScope.Profile, UserScope.Phone],
      });
      const verificationRecordId = await createVerificationRecordByPassword(api, password);
      await enableAllPasswordSignInMethods({
        identifiers: [SignInIdentifier.Phone],
        password: true,
        verify: true,
      });

      await expectRejects(deletePrimaryPhone(api, verificationRecordId), {
        code: 'user.phone_required',
        status: 400,
      });

      await enableAllPasswordSignInMethods();
      await deleteDefaultTenantUser(user.id);
    });

    it('should fail if email or phone is the sign-up identifier', async () => {
      const { user, username, password } = await createDefaultTenantUserWithPassword();
      const api = await signInAndGetUserApi(username, password, {
        scopes: [UserScope.Profile, UserScope.Phone],
      });
      const verificationRecordId = await createVerificationRecordByPassword(api, password);
      await enableAllPasswordSignInMethods({
        identifiers: [SignInIdentifier.Email, SignInIdentifier.Phone],
        password: true,
        verify: true,
      });

      await expectRejects(deletePrimaryPhone(api, verificationRecordId), {
        code: 'user.email_or_phone_required',
        status: 400,
      });

      await enableAllPasswordSignInMethods();
      await deleteDefaultTenantUser(user.id);
    });

    it('should be able to delete primary phone', async () => {
      const { user, username, password } = await createDefaultTenantUserWithPassword();
      const api = await signInAndGetUserApi(username, password, {
        scopes: [UserScope.Profile, UserScope.Phone],
      });
      const verificationRecordId = await createVerificationRecordByPassword(api, password);
      const newPhone = generatePhone();
      const newVerificationRecordId = await createAndVerifyVerificationCode(api, {
        type: SignInIdentifier.Phone,
        value: newPhone,
      });

      await updatePrimaryPhone(api, newPhone, verificationRecordId, newVerificationRecordId);

      const userInfo = await getUserInfo(api);
      expect(userInfo).toHaveProperty('primaryPhone', newPhone);

      await deletePrimaryPhone(api, verificationRecordId);

      const userInfoAfterDelete = await getUserInfo(api);
      expect(userInfoAfterDelete).toHaveProperty('primaryPhone', null);

      await deleteDefaultTenantUser(user.id);
    });
  });
});
