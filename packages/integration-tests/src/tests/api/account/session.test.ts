import { UserScope } from '@logto/core-kit';

import { enableAllAccountCenterFields } from '#src/api/account-center.js';
import { authedAdminApi } from '#src/api/api.js';
import { deleteSession, getSessions } from '#src/api/my-account.js';
import { createVerificationRecordByPassword } from '#src/api/verification-record.js';
import { expectRejects } from '#src/helpers/index.js';
import {
  createDefaultTenantUserWithPassword,
  deleteDefaultTenantUser,
  signInAndGetUserApi,
} from '#src/helpers/profile.js';
import { enableAllPasswordSignInMethods } from '#src/helpers/sign-in-experience.js';
import { devFeatureTest } from '#src/utils.js';

devFeatureTest.describe('account center session management', () => {
  beforeAll(async () => {
    await enableAllPasswordSignInMethods();
    await enableAllAccountCenterFields(authedAdminApi);
  });

  describe('GET /account-center/sessions', () => {
    it('should fail if scope is missing', async () => {
      const { user, username, password } = await createDefaultTenantUserWithPassword();
      const api = await signInAndGetUserApi(username, password);

      const verificationRecordId = await createVerificationRecordByPassword(api, password);

      await expectRejects(getSessions(api, verificationRecordId), {
        code: 'auth.unauthorized',
        status: 401,
      });

      await deleteDefaultTenantUser(user.id);
    });

    it('should fail if identity is not verified', async () => {
      const { user, username, password } = await createDefaultTenantUserWithPassword();
      const api = await signInAndGetUserApi(username, password);

      await expectRejects(getSessions(api, ''), {
        code: 'verification_record.permission_denied',
        status: 401,
      });

      await deleteDefaultTenantUser(user.id);
    });

    it('should get sessions successfully', async () => {
      const { user, username, password } = await createDefaultTenantUserWithPassword();
      const api = await signInAndGetUserApi(username, password, {
        scopes: [UserScope.Sessions],
      });

      const verificationRecordId = await createVerificationRecordByPassword(api, password);

      const response = await getSessions(api, verificationRecordId);
      expect(response.sessions).toBeDefined();
      expect(Array.isArray(response.sessions)).toBe(true);

      await deleteDefaultTenantUser(user.id);
    });
  });

  describe('DELETE /account-center/sessions/:sessionId', () => {
    it('should fail if scope is missing', async () => {
      const { user, username, password } = await createDefaultTenantUserWithPassword();
      const api = await signInAndGetUserApi(username, password);

      const verificationRecordId = await createVerificationRecordByPassword(api, password);

      await expectRejects(deleteSession(api, 'emptySessionId', verificationRecordId), {
        code: 'auth.unauthorized',
        status: 401,
      });

      await deleteDefaultTenantUser(user.id);
    });

    it('should fail if identity is not verified', async () => {
      const { user, username, password } = await createDefaultTenantUserWithPassword();
      const api = await signInAndGetUserApi(username, password, {
        scopes: [UserScope.Sessions],
      });

      await expectRejects(deleteSession(api, 'emptySessionId', ''), {
        code: 'verification_record.permission_denied',
        status: 401,
      });

      await deleteDefaultTenantUser(user.id);
    });

    it('should delete session successfully', async () => {
      const { user, username, password } = await createDefaultTenantUserWithPassword();
      const api = await signInAndGetUserApi(username, password, {
        scopes: [UserScope.Sessions],
      });

      const verificationRecordId = await createVerificationRecordByPassword(api, password);

      const sessionsResponse = await getSessions(api, verificationRecordId);
      const sessionIdToDelete = sessionsResponse.sessions[0]?.payload.uid;

      // Should always be truthy
      if (sessionIdToDelete) {
        await deleteSession(api, sessionIdToDelete, verificationRecordId);

        const sessionsAfterDeletion = await getSessions(api, verificationRecordId);
        const sessionIds = sessionsAfterDeletion.sessions.map((session) => session.payload.uid);
        expect(sessionIds).not.toContain(sessionIdToDelete);
      }

      await deleteDefaultTenantUser(user.id);
    });
  });
});
