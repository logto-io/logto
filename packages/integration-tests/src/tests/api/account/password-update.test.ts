import { hookEvents, SignInIdentifier } from '@logto/schemas';

import { enableAllAccountCenterFields } from '#src/api/account-center.js';
import { authedAdminApi } from '#src/api/api.js';
import { getUserInfo, updatePassword } from '#src/api/my-account.js';
import { updateSignInExperience } from '#src/api/sign-in-experience.js';
import {
  createAndVerifyVerificationCode,
  createVerificationRecordByPassword,
} from '#src/api/verification-record.js';
import { setEmailConnector } from '#src/helpers/connector.js';
import { getSupportedHookEvents, WebHookApiTest } from '#src/helpers/hook.js';
import { expectRejects } from '#src/helpers/index.js';
import {
  createDefaultTenantUserWithPassword,
  deleteDefaultTenantUser,
  initClientAndSignInForDefaultTenant,
  signInAndGetUserApi,
} from '#src/helpers/profile.js';
import { enableAllPasswordSignInMethods } from '#src/helpers/sign-in-experience.js';
import { generateEmail, generatePassword } from '#src/utils.js';

import WebhookMockServer from '../hook/WebhookMockServer.js';
import { assertHookLogResult } from '../hook/utils.js';

describe('account password update', () => {
  const webHookMockServer = new WebhookMockServer(9999);
  const webHookApi = new WebHookApiTest();
  const hookName = 'passwordUpdateHookEventListener';

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
      events: getSupportedHookEvents([...hookEvents]),
      config: { url: webHookMockServer.endpoint },
    });
  });

  afterEach(async () => {
    await webHookApi.cleanUp();
  });

  describe('POST /my-account/password', () => {
    it('should fail if verification record is invalid', async () => {
      const { user, username, password } = await createDefaultTenantUserWithPassword();
      const api = await signInAndGetUserApi(username, password);
      const newPassword = generatePassword();

      await expectRejects(updatePassword(api, 'invalid-verification-record-id', newPassword), {
        code: 'verification_record.permission_denied',
        status: 401,
      });

      await deleteDefaultTenantUser(user.id);
    });

    it('should fail if verification record is missing for a user with password', async () => {
      const { user, username, password } = await createDefaultTenantUserWithPassword();
      const api = await signInAndGetUserApi(username, password);

      await expectRejects(updatePassword(api, undefined, generatePassword()), {
        code: 'verification_record.permission_denied',
        status: 401,
      });

      await deleteDefaultTenantUser(user.id);
    });

    it('should fail if password does not meet the password policy', async () => {
      const { user, username, password } = await createDefaultTenantUserWithPassword();
      const api = await signInAndGetUserApi(username, password);
      const verificationRecordId = await createVerificationRecordByPassword(api, password);

      await expectRejects(updatePassword(api, verificationRecordId, '123456'), {
        code: 'password.rejected',
        status: 422,
      });

      await deleteDefaultTenantUser(user.id);
    });

    it('should fail if the new password is the same as the current password', async () => {
      const { user, username, password } = await createDefaultTenantUserWithPassword();
      const api = await signInAndGetUserApi(username, password);
      const verificationRecordId = await createVerificationRecordByPassword(api, password);

      await expectRejects(updatePassword(api, verificationRecordId, password), {
        code: 'user.same_password',
        status: 422,
      });

      await deleteDefaultTenantUser(user.id);
    });

    it('should be able to update password with password verification', async () => {
      const { user, username, password } = await createDefaultTenantUserWithPassword();
      const api = await signInAndGetUserApi(username, password);
      const verificationRecordId = await createVerificationRecordByPassword(api, password);
      const newPassword = generatePassword();

      await updatePassword(api, verificationRecordId, newPassword);

      const hook = webHookApi.hooks.get(hookName)!;
      await assertHookLogResult(hook, 'User.Data.Updated', {
        hookPayload: {
          event: 'User.Data.Updated',
        },
      });

      const userInfo = await getUserInfo(api);
      expect(userInfo).toHaveProperty('hasPassword', true);

      await initClientAndSignInForDefaultTenant(username, newPassword);

      await deleteDefaultTenantUser(user.id);
    });

    it('should be able to update password with email verification', async () => {
      const primaryEmail = generateEmail();
      const { user, username, password } = await createDefaultTenantUserWithPassword({
        primaryEmail,
      });
      const api = await signInAndGetUserApi(username, password);
      const verificationRecordId = await createAndVerifyVerificationCode(api, {
        type: SignInIdentifier.Email,
        value: primaryEmail,
      });
      const newPassword = generatePassword();

      await updatePassword(api, verificationRecordId, newPassword);

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
