import { UserScope } from '@logto/core-kit';
import { SignInIdentifier } from '@logto/schemas';

import { enableAllAccountCenterFields } from '#src/api/account-center.js';
import { authedAdminApi } from '#src/api/api.js';
import { getUserInfo, updatePrimaryEmail, updatePrimaryPhone } from '#src/api/profile.js';
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
import { devFeatureTest, generateEmail, generatePhone } from '#src/utils.js';

const { describe, it } = devFeatureTest;

describe('profile (email and phone)', () => {
  beforeAll(async () => {
    await enableAllPasswordSignInMethods();
    await setEmailConnector(authedAdminApi);
    await setSmsConnector(authedAdminApi);
    await enableAllAccountCenterFields(authedAdminApi);
  });

  describe('POST /profile/primary-email', () => {
    it('should fail if scope is missing', async () => {
      const { user, username, password } = await createDefaultTenantUserWithPassword();
      const api = await signInAndGetUserApi(username, password);
      const newEmail = generateEmail();

      await expectRejects(
        updatePrimaryEmail(
          api,
          newEmail,
          'invalid-verification-record-id',
          'new-verification-record-id'
        ),
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

  describe('POST /profile/primary-phone', () => {
    it('should fail if scope is missing', async () => {
      const { user, username, password } = await createDefaultTenantUserWithPassword();
      const api = await signInAndGetUserApi(username, password);
      const newPhone = generatePhone();

      await expectRejects(
        updatePrimaryPhone(
          api,
          newPhone,
          'invalid-verification-record-id',
          'new-verification-record-id'
        ),
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
        scopes: [UserScope.Profile, UserScope.Phone],
      });
      const newPhone = generatePhone();

      await expectRejects(
        updatePrimaryPhone(
          api,
          newPhone,
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
        scopes: [UserScope.Profile, UserScope.Phone],
      });
      const newPhone = generatePhone();
      const verificationRecordId = await createVerificationRecordByPassword(api, password);

      await expectRejects(
        updatePrimaryPhone(api, newPhone, verificationRecordId, 'new-verification-record-id'),
        {
          code: 'verification_record.not_found',
          status: 400,
        }
      );

      await deleteDefaultTenantUser(user.id);
    });

    it('should be able to update primary phone by verifying password', async () => {
      const { user, username, password } = await createDefaultTenantUserWithPassword();
      const api = await signInAndGetUserApi(username, password, {
        scopes: [UserScope.Profile, UserScope.Phone],
      });
      const newPhone = generatePhone();
      const verificationRecordId = await createVerificationRecordByPassword(api, password);
      const newVerificationRecordId = await createAndVerifyVerificationCode(api, {
        type: SignInIdentifier.Phone,
        value: newPhone,
      });

      await updatePrimaryPhone(api, newPhone, verificationRecordId, newVerificationRecordId);

      const userInfo = await getUserInfo(api);
      expect(userInfo).toHaveProperty('primaryPhone', newPhone);

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
});
