import { UserScope } from '@logto/core-kit';
import { hookEvents } from '@logto/schemas';

import { enableAllAccountCenterFields } from '#src/api/account-center.js';
import { getUserInfo, updateOtherProfile, updatePassword, updateUser } from '#src/api/profile.js';
import { createVerificationRecordByPassword } from '#src/api/verification-record.js';
import { WebHookApiTest } from '#src/helpers/hook.js';
import { expectRejects } from '#src/helpers/index.js';
import {
  createDefaultTenantUserWithPassword,
  deleteDefaultTenantUser,
  initClientAndSignInForDefaultTenant,
  signInAndGetUserApi,
} from '#src/helpers/profile.js';
import { enableAllPasswordSignInMethods } from '#src/helpers/sign-in-experience.js';
import { devFeatureTest, generatePassword, generateUsername } from '#src/utils.js';

import WebhookMockServer from '../hook/WebhookMockServer.js';
import { assertHookLogResult } from '../hook/utils.js';

const { describe, it } = devFeatureTest;

describe('profile', () => {
  const webHookMockServer = new WebhookMockServer(9999);
  const webHookApi = new WebHookApiTest();
  const hookName = 'profileApiHookEventListener';

  beforeAll(async () => {
    await webHookMockServer.listen();
    await enableAllPasswordSignInMethods();
    await enableAllAccountCenterFields();
  });

  afterAll(async () => {
    await webHookMockServer.close();
  });

  beforeEach(async () => {
    await webHookApi.create({
      name: hookName,
      events: [...hookEvents],
      config: { url: webHookMockServer.endpoint },
    });
  });

  afterEach(async () => {
    await webHookApi.cleanUp();
  });

  describe('GET /profile', () => {
    it('should be able to get profile with default scopes', async () => {
      const { user, username, password } = await createDefaultTenantUserWithPassword();
      const api = await signInAndGetUserApi(username, password);
      const response = await getUserInfo(api);
      expect(response).toMatchObject({ username });
      expect(response).not.toHaveProperty('customData');
      expect(response).not.toHaveProperty('identities');
      expect(response).not.toHaveProperty('primaryEmail');
      expect(response).not.toHaveProperty('primaryPhone');

      await deleteDefaultTenantUser(user.id);
    });

    it('should return profile data based on scopes (email)', async () => {
      const { user, username, password } = await createDefaultTenantUserWithPassword();
      const api = await signInAndGetUserApi(username, password, {
        scopes: [UserScope.Email],
      });

      const response = await getUserInfo(api);
      expect(response).toHaveProperty('primaryEmail');

      await deleteDefaultTenantUser(user.id);
    });

    it('should return profile data based on scopes (phone)', async () => {
      const { user, username, password } = await createDefaultTenantUserWithPassword();
      const api = await signInAndGetUserApi(username, password, {
        scopes: [UserScope.Phone],
      });

      const response = await getUserInfo(api);
      expect(response).toHaveProperty('primaryPhone');

      await deleteDefaultTenantUser(user.id);
    });

    it('should return profile data based on scopes (identities)', async () => {
      const { user, username, password } = await createDefaultTenantUserWithPassword();
      const api = await signInAndGetUserApi(username, password, {
        scopes: [UserScope.Identities],
      });

      const response = await getUserInfo(api);
      expect(response).toHaveProperty('identities');

      await deleteDefaultTenantUser(user.id);
    });

    it('should return profile data based on scopes (custom data)', async () => {
      const { user, username, password } = await createDefaultTenantUserWithPassword();
      const api = await signInAndGetUserApi(username, password, {
        scopes: [UserScope.CustomData],
      });

      const response = await getUserInfo(api);
      expect(response).toHaveProperty('customData');

      await deleteDefaultTenantUser(user.id);
    });
  });

  describe('PATCH /profile', () => {
    it('should be able to update name', async () => {
      const { user, username, password } = await createDefaultTenantUserWithPassword();
      const api = await signInAndGetUserApi(username, password);
      const newName = generateUsername();

      const response = await updateUser(api, { name: newName });
      expect(response).toMatchObject({ name: newName });

      const userInfo = await getUserInfo(api);
      expect(userInfo).toHaveProperty('name', newName);

      // Check if the hook is triggered
      const hook = webHookApi.hooks.get(hookName)!;
      await assertHookLogResult(hook, 'User.Data.Updated', {
        hookPayload: {
          event: 'User.Data.Updated',
          data: expect.objectContaining({
            name: newName,
          }),
        },
      });

      await deleteDefaultTenantUser(user.id);
    });

    it('should be able to update picture', async () => {
      const { user, username, password } = await createDefaultTenantUserWithPassword();
      const api = await signInAndGetUserApi(username, password);
      const newAvatar = 'https://example.com/avatar.png';

      const response = await updateUser(api, { avatar: newAvatar });
      expect(response).toMatchObject({ avatar: newAvatar });

      const userInfo = await getUserInfo(api);
      expect(userInfo).toHaveProperty('avatar', newAvatar);

      await deleteDefaultTenantUser(user.id);
    });

    it('should be able to update username', async () => {
      const { user, username, password } = await createDefaultTenantUserWithPassword();
      const api = await signInAndGetUserApi(username, password);
      const newUsername = generateUsername();

      const response = await updateUser(api, { username: newUsername });
      expect(response).toMatchObject({ username: newUsername });

      // Sign in with new username
      await initClientAndSignInForDefaultTenant(newUsername, password);

      await deleteDefaultTenantUser(user.id);
    });

    it('should fail if username is already in use', async () => {
      const { user, username, password } = await createDefaultTenantUserWithPassword();
      const { user: user2, username: username2 } = await createDefaultTenantUserWithPassword();
      const api = await signInAndGetUserApi(username, password);

      await expectRejects(updateUser(api, { username: username2 }), {
        code: 'user.username_already_in_use',
        status: 422,
      });

      await deleteDefaultTenantUser(user.id);
      await deleteDefaultTenantUser(user2.id);
    });
  });

  describe('PATCH /profile/profile', () => {
    it('should be able to update other profile', async () => {
      const { user, username, password } = await createDefaultTenantUserWithPassword();
      const api = await signInAndGetUserApi(username, password);
      const newProfile = {
        profile: 'HI',
        middleName: 'middleName',
      };

      const response = await updateOtherProfile(api, newProfile);
      expect(response).toMatchObject(newProfile);

      await deleteDefaultTenantUser(user.id);
    });

    it('should be able to update profile address', async () => {
      const { user, username, password } = await createDefaultTenantUserWithPassword();
      const api = await signInAndGetUserApi(username, password, {
        scopes: [UserScope.Address, UserScope.Profile],
      });
      const newProfile = {
        address: {
          country: 'USA',
        },
      };

      const response = await updateOtherProfile(api, newProfile);
      expect(response).toMatchObject(newProfile);

      await deleteDefaultTenantUser(user.id);
    });

    it('should fail if user does not have the address scope', async () => {
      const { user, username, password } = await createDefaultTenantUserWithPassword();
      const api = await signInAndGetUserApi(username, password, {
        scopes: [UserScope.Profile],
      });

      await expectRejects(updateOtherProfile(api, { address: { country: 'USA' } }), {
        code: 'auth.unauthorized',
        status: 400,
      });

      await deleteDefaultTenantUser(user.id);
    });
  });

  describe('POST /profile/password', () => {
    it('should fail if verification record is invalid', async () => {
      const { user, username, password } = await createDefaultTenantUserWithPassword();
      const api = await signInAndGetUserApi(username, password);
      const newPassword = generatePassword();

      await expectRejects(updatePassword(api, 'invalid-varification-record-id', newPassword), {
        code: 'verification_record.permission_denied',
        status: 401,
      });

      await deleteDefaultTenantUser(user.id);
    });

    it('should fail if password does not meet the password policy', async () => {
      const { user, username, password } = await createDefaultTenantUserWithPassword();
      const api = await signInAndGetUserApi(username, password);
      const newPassword = '123456';

      await expectRejects(updatePassword(api, 'invalid-varification-record-id', newPassword), {
        code: 'password.rejected',
        status: 422,
      });

      await deleteDefaultTenantUser(user.id);
    });

    it('should be able to update password', async () => {
      const { user, username, password } = await createDefaultTenantUserWithPassword();
      const api = await signInAndGetUserApi(username, password);
      const verificationRecordId = await createVerificationRecordByPassword(api, password);
      const newPassword = generatePassword();

      await updatePassword(api, verificationRecordId, newPassword);

      // Check if the hook is triggered
      const hook = webHookApi.hooks.get(hookName)!;
      await assertHookLogResult(hook, 'User.Data.Updated', {
        hookPayload: {
          event: 'User.Data.Updated',
        },
      });

      // Sign in with new password
      await initClientAndSignInForDefaultTenant(username, newPassword);

      await deleteDefaultTenantUser(user.id);
    });
  });
});
