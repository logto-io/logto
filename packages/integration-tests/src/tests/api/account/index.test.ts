import { UserScope } from '@logto/core-kit';
import { hookEvents, SignInIdentifier } from '@logto/schemas';

import { enableAllAccountCenterFields } from '#src/api/account-center.js';
import { authedAdminApi } from '#src/api/api.js';
import {
  getUserInfo,
  updateOtherProfile,
  updatePassword,
  updateUser,
} from '#src/api/my-account.js';
import { updateSignInExperience } from '#src/api/sign-in-experience.js';
import { createVerificationRecordByPassword } from '#src/api/verification-record.js';
import { setEmailConnector } from '#src/helpers/connector.js';
import { WebHookApiTest } from '#src/helpers/hook.js';
import { expectRejects } from '#src/helpers/index.js';
import {
  createDefaultTenantUserWithPassword,
  deleteDefaultTenantUser,
  initClientAndSignInForDefaultTenant,
  signInAndGetUserApi,
} from '#src/helpers/profile.js';
import { enableAllPasswordSignInMethods } from '#src/helpers/sign-in-experience.js';
import { generatePassword, generateUsername } from '#src/utils.js';

import WebhookMockServer from '../hook/WebhookMockServer.js';
import { assertHookLogResult } from '../hook/utils.js';

describe('account', () => {
  const webHookMockServer = new WebhookMockServer(9999);
  const webHookApi = new WebHookApiTest();
  const hookName = 'accountApiHookEventListener';

  beforeAll(async () => {
    await webHookMockServer.listen();
    await enableAllPasswordSignInMethods();
    await enableAllAccountCenterFields();
    await setEmailConnector(authedAdminApi);
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

  describe('GET /my-account', () => {
    it('should allow all origins', async () => {
      const { user, username, password } = await createDefaultTenantUserWithPassword();
      const api = await signInAndGetUserApi(username, password);
      const response = await api.get('api/my-account');
      expect(response.status).toBe(200);
      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');

      await deleteDefaultTenantUser(user.id);
    });

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

  describe('PATCH /my-account', () => {
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

    it('should be able to update username to null', async () => {
      const { user, username, password } = await createDefaultTenantUserWithPassword();
      const api = await signInAndGetUserApi(username, password);

      await updateSignInExperience({
        signUp: {
          identifiers: [SignInIdentifier.Email],
          password: true,
          verify: true,
        },
      });
      const response = await updateUser(api, { username: null });
      expect(response).toMatchObject({ username: null });
      await enableAllPasswordSignInMethods();

      const userInfo = await getUserInfo(api);
      expect(userInfo).toHaveProperty('username', null);

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

    it('should be able to update customData', async () => {
      const { user, username, password } = await createDefaultTenantUserWithPassword();
      const api = await signInAndGetUserApi(username, password, {
        scopes: [UserScope.CustomData],
      });
      const customData = { level: 'premium', preferences: { theme: 'dark' } };

      const response = await updateUser(api, { customData });
      expect(response).toMatchObject({ customData });

      const userInfo = await getUserInfo(api);
      expect(userInfo).toHaveProperty('customData', customData);

      // Check if the hook is triggered
      const hook = webHookApi.hooks.get(hookName)!;
      await assertHookLogResult(hook, 'User.Data.Updated', {
        hookPayload: {
          event: 'User.Data.Updated',
          data: expect.objectContaining({
            customData,
          }),
        },
      });

      await deleteDefaultTenantUser(user.id);
    });

    it('should fail to update customData without CustomData scope', async () => {
      const { user, username, password } = await createDefaultTenantUserWithPassword();
      const api = await signInAndGetUserApi(username, password);
      const customData = { level: 'premium' };

      await expectRejects(updateUser(api, { customData }), {
        code: 'auth.unauthorized',
        status: 400,
      });

      await deleteDefaultTenantUser(user.id);
    });

    it('should be able to update customData multiple times', async () => {
      const { user, username, password } = await createDefaultTenantUserWithPassword();
      const api = await signInAndGetUserApi(username, password, {
        scopes: [UserScope.CustomData],
      });

      // First set some custom data
      const firstData = { test: 'value' };
      await updateUser(api, { customData: firstData });

      // Then update with different data (replaces existing, consistent with admin API)
      const secondData = { newField: 'newValue', number: 42 };
      const response = await updateUser(api, { customData: secondData });

      // Expect replaced data since customData updates replace rather than merge (consistent with admin API)
      expect(response).toMatchObject({ customData: secondData });

      const userInfo = await getUserInfo(api);
      expect(userInfo).toHaveProperty('customData', secondData);

      await deleteDefaultTenantUser(user.id);
    });
  });

  describe('PATCH /my-account/profile', () => {
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

  describe('POST /my-account/password', () => {
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
      const verificationRecordId = await createVerificationRecordByPassword(api, password);

      await expectRejects(updatePassword(api, verificationRecordId, newPassword), {
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

    it('should throw error and trigger sentinel policy when failed to verify password', async () => {
      const { user, username, password } = await createDefaultTenantUserWithPassword();
      const api = await signInAndGetUserApi(username, password);

      await updateSignInExperience({
        sentinelPolicy: {
          maxAttempts: 2,
          lockoutDuration: 1,
        },
      });

      await expectRejects(createVerificationRecordByPassword(api, 'wrong-password'), {
        code: 'session.invalid_credentials',
        status: 422,
      });

      // Second attempt to trigger the lockout
      await expectRejects(createVerificationRecordByPassword(api, 'wrong-password'), {
        code: 'session.verification_blocked_too_many_attempts',
        status: 400,
      });

      const hook = webHookApi.hooks.get(hookName)!;
      await assertHookLogResult(hook, 'Identifier.Lockout', {
        hookPayload: {
          event: 'Identifier.Lockout',
        },
      });

      await deleteDefaultTenantUser(user.id);

      await updateSignInExperience({
        sentinelPolicy: {},
      });
    });
  });
});
