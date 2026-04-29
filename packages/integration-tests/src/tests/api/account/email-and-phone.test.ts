/* eslint-disable max-lines */
import { UserScope } from '@logto/core-kit';
import { SignInIdentifier } from '@logto/schemas';
import { PhoneNumberParser } from '@logto/shared';

import { enableAllAccountCenterFields } from '#src/api/account-center.js';
import { authedAdminApi } from '#src/api/api.js';
import {
  deletePrimaryEmail,
  deletePrimaryPhone,
  getUserInfo,
  updatePrimaryEmail,
  updatePrimaryPhone,
  updateUser,
} from '#src/api/my-account.js';
import { updateSignInExperience } from '#src/api/sign-in-experience.js';
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
import { generateEmail, generatePhone, generateNationalPhoneNumber } from '#src/utils.js';

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

    it('should reject the email if the email is in the blocklist', async () => {
      const email = generateEmail();
      await updateSignInExperience({
        emailBlocklistPolicy: {
          customBlocklist: [email],
        },
      });

      const { user, username, password } = await createDefaultTenantUserWithPassword();
      const api = await signInAndGetUserApi(username, password, {
        scopes: [UserScope.Profile, UserScope.Email],
      });

      const verificationRecordId = await createVerificationRecordByPassword(api, password);
      const newVerificationRecordId = await createAndVerifyVerificationCode(api, {
        type: SignInIdentifier.Email,
        value: email,
      });

      await expectRejects(
        updatePrimaryEmail(api, email, verificationRecordId, newVerificationRecordId),
        {
          code: 'session.email_blocklist.email_not_allowed',
          status: 422,
        }
      );

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

    it('should reject deleting the last identifier', async () => {
      const primaryEmail = generateEmail();
      const { user, username, password } = await createDefaultTenantUserWithPassword({
        primaryEmail,
      });
      const api = await signInAndGetUserApi(username, password, {
        scopes: [UserScope.Profile, UserScope.Email],
      });
      const verificationRecordId = await createVerificationRecordByPassword(api, password);
      await updateUser(api, { username: null }, verificationRecordId);

      await expectRejects(deletePrimaryEmail(api, verificationRecordId), {
        code: 'user.last_sign_in_method_required',
        status: 400,
      });

      await deleteDefaultTenantUser(user.id);
    });

    it('should be able to delete primary email if email is the sign-up identifier and another identifier remains', async () => {
      const primaryEmail = generateEmail();
      const { user, username, password } = await createDefaultTenantUserWithPassword({
        primaryEmail,
      });
      const api = await signInAndGetUserApi(username, password, {
        scopes: [UserScope.Profile, UserScope.Email],
      });
      const verificationRecordId = await createVerificationRecordByPassword(api, password);

      try {
        await enableAllPasswordSignInMethods({
          identifiers: [SignInIdentifier.Email],
          password: true,
          verify: true,
        });

        await deletePrimaryEmail(api, verificationRecordId);

        const userInfo = await getUserInfo(api);
        expect(userInfo).toHaveProperty('primaryEmail', null);
      } finally {
        await enableAllPasswordSignInMethods();
      }

      await deleteDefaultTenantUser(user.id);
    });

    it('should be able to delete primary email if email or phone is the sign-up identifier and another identifier remains', async () => {
      const primaryEmail = generateEmail();
      const { user, username, password } = await createDefaultTenantUserWithPassword({
        primaryEmail,
      });
      const api = await signInAndGetUserApi(username, password, {
        scopes: [UserScope.Profile, UserScope.Email],
      });
      const verificationRecordId = await createVerificationRecordByPassword(api, password);

      try {
        await enableAllPasswordSignInMethods({
          identifiers: [SignInIdentifier.Email, SignInIdentifier.Phone],
          password: true,
          verify: true,
        });

        await deletePrimaryEmail(api, verificationRecordId);

        const userInfo = await getUserInfo(api);
        expect(userInfo).toHaveProperty('primaryEmail', null);
      } finally {
        await enableAllPasswordSignInMethods();
      }

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

    it('should be able to update primary phone by verifying existing phone', async () => {
      const primaryPhone = generatePhone();
      const { user, username, password } = await createDefaultTenantUserWithPassword({
        primaryPhone,
      });
      const api = await signInAndGetUserApi(username, password, {
        scopes: [UserScope.Profile, UserScope.Phone],
      });
      const newPhone = generatePhone();
      const verificationRecordId = await createAndVerifyVerificationCode(api, {
        type: SignInIdentifier.Phone,
        value: primaryPhone,
      });
      const newVerificationRecordId = await createAndVerifyVerificationCode(api, {
        type: SignInIdentifier.Phone,
        value: newPhone,
      });

      await updatePrimaryPhone(api, newPhone, verificationRecordId, newVerificationRecordId);
      const userInfo = await getUserInfo(api);
      expect(userInfo).toHaveProperty('primaryPhone', newPhone);

      await deleteDefaultTenantUser(user.id);
    });
  });

  describe('should fail if the new phone already exists', () => {
    it('new phone with internationNumber format, existing phone with leading zero format', async () => {
      // We use the country code 64 as New Zealand local phone number cloud have leading zero.
      const primaryPhone = `64${generateNationalPhoneNumber()}`;
      const { internationalNumber, internationalNumberWithLeadingZero } = new PhoneNumberParser(
        primaryPhone
      );

      if (!internationalNumber || !internationalNumberWithLeadingZero) {
        throw new Error('Invalid phone number');
      }

      const { user: userWithExistingPhone } = await createDefaultTenantUserWithPassword({
        primaryPhone: internationalNumber,
      });
      const { user, username, password } = await createDefaultTenantUserWithPassword();

      const api = await signInAndGetUserApi(username, password, {
        scopes: [UserScope.Profile, UserScope.Phone],
      });

      const verificationRecordId = await createVerificationRecordByPassword(api, password);

      const newVerificationRecordId = await createAndVerifyVerificationCode(api, {
        type: SignInIdentifier.Phone,
        value: internationalNumberWithLeadingZero,
      });

      await expectRejects(
        updatePrimaryPhone(
          api,
          internationalNumberWithLeadingZero,
          verificationRecordId,
          newVerificationRecordId
        ),
        {
          code: 'user.phone_already_in_use',
          status: 422,
        }
      );

      await Promise.all([
        deleteDefaultTenantUser(user.id),
        deleteDefaultTenantUser(userWithExistingPhone.id),
      ]);
    });

    it('new phone with leading zero format, existing phone uses standard international format', async () => {
      // We use the country code 64 as New Zealand local phone number cloud have leading zero.
      const primaryPhone = `64${generateNationalPhoneNumber()}`;
      const { internationalNumber, internationalNumberWithLeadingZero } = new PhoneNumberParser(
        primaryPhone
      );

      if (!internationalNumber || !internationalNumberWithLeadingZero) {
        throw new Error('Invalid phone number');
      }

      const { user: userWithExistingPhone } = await createDefaultTenantUserWithPassword({
        primaryPhone: internationalNumberWithLeadingZero,
      });
      const { user, username, password } = await createDefaultTenantUserWithPassword();

      const api = await signInAndGetUserApi(username, password, {
        scopes: [UserScope.Profile, UserScope.Phone],
      });

      const verificationRecordId = await createVerificationRecordByPassword(api, password);

      const newVerificationRecordId = await createAndVerifyVerificationCode(api, {
        type: SignInIdentifier.Phone,
        value: internationalNumber,
      });

      await expectRejects(
        updatePrimaryPhone(api, internationalNumber, verificationRecordId, newVerificationRecordId),
        {
          code: 'user.phone_already_in_use',
          status: 422,
        }
      );

      await Promise.all([
        deleteDefaultTenantUser(user.id),
        deleteDefaultTenantUser(userWithExistingPhone.id),
      ]);
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

    it('should reject deleting the last identifier', async () => {
      const primaryPhone = generatePhone();
      const { user, username, password } = await createDefaultTenantUserWithPassword({
        primaryPhone,
      });
      const api = await signInAndGetUserApi(username, password, {
        scopes: [UserScope.Profile, UserScope.Phone],
      });
      const verificationRecordId = await createVerificationRecordByPassword(api, password);
      await updateUser(api, { username: null }, verificationRecordId);

      await expectRejects(deletePrimaryPhone(api, verificationRecordId), {
        code: 'user.last_sign_in_method_required',
        status: 400,
      });

      await deleteDefaultTenantUser(user.id);
    });

    it('should be able to delete primary phone if phone is the sign-up identifier and another identifier remains', async () => {
      const primaryPhone = generatePhone();
      const { user, username, password } = await createDefaultTenantUserWithPassword({
        primaryPhone,
      });
      const api = await signInAndGetUserApi(username, password, {
        scopes: [UserScope.Profile, UserScope.Phone],
      });
      const verificationRecordId = await createVerificationRecordByPassword(api, password);

      try {
        await enableAllPasswordSignInMethods({
          identifiers: [SignInIdentifier.Phone],
          password: true,
          verify: true,
        });

        await deletePrimaryPhone(api, verificationRecordId);

        const userInfo = await getUserInfo(api);
        expect(userInfo).toHaveProperty('primaryPhone', null);
      } finally {
        await enableAllPasswordSignInMethods();
      }

      await deleteDefaultTenantUser(user.id);
    });

    it('should be able to delete primary phone if email or phone is the sign-up identifier and another identifier remains', async () => {
      const primaryPhone = generatePhone();
      const { user, username, password } = await createDefaultTenantUserWithPassword({
        primaryPhone,
      });
      const api = await signInAndGetUserApi(username, password, {
        scopes: [UserScope.Profile, UserScope.Phone],
      });
      const verificationRecordId = await createVerificationRecordByPassword(api, password);

      try {
        await enableAllPasswordSignInMethods({
          identifiers: [SignInIdentifier.Email, SignInIdentifier.Phone],
          password: true,
          verify: true,
        });

        await deletePrimaryPhone(api, verificationRecordId);

        const userInfo = await getUserInfo(api);
        expect(userInfo).toHaveProperty('primaryPhone', null);
      } finally {
        await enableAllPasswordSignInMethods();
      }

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
/* eslint-enable max-lines */
