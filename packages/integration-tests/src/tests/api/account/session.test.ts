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
import { devFeatureTest } from '#src/utils.js';

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

    devFeatureTest.it(
      'marks exactly one session as `isCurrent: true` for a single sign-in',
      async () => {
        const { user, username, password } = await createDefaultTenantUserWithPassword();
        const api = await signInAndGetUserApi(username, password, {
          scopes: [UserScope.Sessions],
        });

        const verificationRecordId = await createVerificationRecordByPassword(api, password);

        const response = await getSessions(api, verificationRecordId);
        const currentSessions = response.sessions.filter((session) => session.isCurrent);
        expect(currentSessions).toHaveLength(1);

        await deleteDefaultTenantUser(user.id);
      }
    );

    devFeatureTest.it(
      'marks only the caller session as current when another session exists',
      async () => {
        const { user, username, password } = await createDefaultTenantUserWithPassword();

        const { app: otherApp } = await createAppAndSignInWithPassword({
          username,
          password,
          isThirdParty: false,
          scopes: [UserScope.Profile],
        });

        const api = await signInAndGetUserApi(username, password, {
          scopes: [UserScope.Sessions],
        });

        const verificationRecordId = await createVerificationRecordByPassword(api, password);

        const response = await getSessions(api, verificationRecordId);
        expect(response.sessions.length).toBeGreaterThanOrEqual(2);

        const currentSessions = response.sessions.filter((session) => session.isCurrent);
        expect(currentSessions).toHaveLength(1);

        const otherSession = findSessionByAppId(response.sessions, otherApp.id);
        expect(otherSession?.isCurrent).toBe(false);

        await deleteApplication(otherApp.id);
        await deleteDefaultTenantUser(user.id);
      }
    );

    devFeatureTest.it(
      'keeps the caller session tagged after another session is revoked',
      async () => {
        const { user, username, password } = await createDefaultTenantUserWithPassword();

        const { app: otherApp } = await createAppAndSignInWithPassword({
          username,
          password,
          isThirdParty: false,
          scopes: [UserScope.Profile],
        });

        const api = await signInAndGetUserApi(username, password, {
          scopes: [UserScope.Sessions],
        });

        const verificationRecordId = await createVerificationRecordByPassword(api, password);

        const before = await getSessions(api, verificationRecordId);
        const otherSession = findSessionByAppId(before.sessions, otherApp.id);
        assert(otherSession, new Error('Other-app session not found'));

        await deleteSession(api, otherSession.payload.uid, verificationRecordId);

        const after = await getSessions(api, verificationRecordId);
        const currentSessions = after.sessions.filter((session) => session.isCurrent);
        expect(currentSessions).toHaveLength(1);
        expect(after.sessions.map((session) => session.payload.uid)).not.toContain(
          otherSession.payload.uid
        );

        await deleteApplication(otherApp.id);
        await deleteDefaultTenantUser(user.id);
      }
    );

    devFeatureTest.it(
      'returns zero `isCurrent: true` entries after the caller revokes its own session',
      async () => {
        const { user, username, password } = await createDefaultTenantUserWithPassword();
        const api = await signInAndGetUserApi(username, password, {
          scopes: [UserScope.Sessions],
        });

        const verificationRecordId = await createVerificationRecordByPassword(api, password);

        const before = await getSessions(api, verificationRecordId);
        const ownSession = before.sessions.find((session) => session.isCurrent);
        assert(ownSession, new Error('Caller session not tagged before revoke'));

        await deleteSession(api, ownSession.payload.uid, verificationRecordId);

        const after = await getSessions(api, verificationRecordId);
        const currentSessions = after.sessions.filter((session) => session.isCurrent);
        expect(currentSessions).toHaveLength(0);
        expect(after.sessions.map((session) => session.payload.uid)).not.toContain(
          ownSession.payload.uid
        );

        await deleteDefaultTenantUser(user.id);
      }
    );

    devFeatureTest.it(
      'tags the calling session from each caller perspective when two sessions exist',
      async () => {
        const { user, username, password } = await createDefaultTenantUserWithPassword();

        const apiA = await signInAndGetUserApi(username, password, {
          scopes: [UserScope.Sessions],
        });
        const apiB = await signInAndGetUserApi(username, password, {
          scopes: [UserScope.Sessions],
        });

        const verificationRecordIdA = await createVerificationRecordByPassword(apiA, password);
        const verificationRecordIdB = await createVerificationRecordByPassword(apiB, password);

        const responseA = await getSessions(apiA, verificationRecordIdA);
        const responseB = await getSessions(apiB, verificationRecordIdB);

        const currentA = responseA.sessions.find((session) => session.isCurrent);
        const currentB = responseB.sessions.find((session) => session.isCurrent);

        assert(currentA, new Error('A session not tagged from A perspective'));
        assert(currentB, new Error('B session not tagged from B perspective'));

        expect(responseA.sessions.filter((session) => session.isCurrent)).toHaveLength(1);
        expect(responseB.sessions.filter((session) => session.isCurrent)).toHaveLength(1);
        expect(currentA.payload.uid).not.toBe(currentB.payload.uid);

        await deleteDefaultTenantUser(user.id);
      }
    );
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
