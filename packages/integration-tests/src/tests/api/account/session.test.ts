import { UserScope } from '@logto/core-kit';
import { SessionGrantRevokeTarget } from '@logto/schemas';
import { assert } from '@silverhand/essentials';

import { enableAllAccountCenterFields } from '#src/api/account-center.js';
import { authedAdminApi } from '#src/api/api.js';
import { deleteApplication } from '#src/api/application.js';
import { deleteSession, getSessions } from '#src/api/my-account.js';
import { createVerificationRecordByPassword } from '#src/api/verification-record.js';
import { expectRejects } from '#src/helpers/index.js';
import {
  createDefaultTenantUserWithPassword,
  deleteDefaultTenantUser,
  signInAndGetUserApi,
} from '#src/helpers/profile.js';
import {
  assertRefreshTokenInvalidGrant,
  assertRefreshTokenValid,
  createAppAndSignInWithPassword,
  findSessionByAppId,
} from '#src/helpers/session.js';
import { enableAllPasswordSignInMethods } from '#src/helpers/sign-in-experience.js';

describe('account center session management', () => {
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

    it('should delete session successfully with first-party grants option', async () => {
      const { user, username, password } = await createDefaultTenantUserWithPassword();

      const { app: firstPartyApp, refreshToken } = await createAppAndSignInWithPassword({
        username,
        password,
        isThirdParty: false,
        scopes: [UserScope.Profile],
      });

      assert(refreshToken, new Error('No refresh token found'));

      const api = await signInAndGetUserApi(username, password, {
        scopes: [UserScope.Sessions],
      });

      const verificationRecordId = await createVerificationRecordByPassword(api, password);

      const sessionsResponse = await getSessions(api, verificationRecordId);
      const firstPartySession = findSessionByAppId(sessionsResponse.sessions, firstPartyApp.id);
      const sessionIdToDelete = firstPartySession?.payload.uid;

      assert(sessionIdToDelete, new Error('First-party session not found'));

      await deleteSession(api, sessionIdToDelete, verificationRecordId, {
        revokeGrantsTarget: SessionGrantRevokeTarget.FirstParty,
      });

      const sessionsAfterDeletion = await getSessions(api, verificationRecordId);
      const sessionIds = sessionsAfterDeletion.sessions.map((session) => session.payload.uid);
      expect(sessionIds).not.toContain(sessionIdToDelete);

      await assertRefreshTokenInvalidGrant({
        clientId: firstPartyApp.id,
        refreshToken,
      });

      await deleteApplication(firstPartyApp.id);
      await deleteDefaultTenantUser(user.id);
    });

    it('should keep third-party grants active when revoke target is first-party', async () => {
      const { user, username, password } = await createDefaultTenantUserWithPassword();

      const { app: thirdPartyApp, refreshToken } = await createAppAndSignInWithPassword({
        username,
        password,
        isThirdParty: true,
        scopes: [UserScope.Profile],
      });

      assert(refreshToken, new Error('No refresh token found'));

      const api = await signInAndGetUserApi(username, password, {
        scopes: [UserScope.Sessions],
      });

      const verificationRecordId = await createVerificationRecordByPassword(api, password);

      const sessionsResponse = await getSessions(api, verificationRecordId);
      const thirdPartySession = findSessionByAppId(sessionsResponse.sessions, thirdPartyApp.id);

      assert(thirdPartySession, new Error('Third-party session not found'));

      await deleteSession(api, thirdPartySession.payload.uid, verificationRecordId, {
        revokeGrantsTarget: SessionGrantRevokeTarget.FirstParty,
      });

      await assertRefreshTokenValid({
        clientId: thirdPartyApp.id,
        refreshToken,
      });

      await deleteApplication(thirdPartyApp.id);
      await deleteDefaultTenantUser(user.id);
    });
  });
});
