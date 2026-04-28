import { UserScope } from '@logto/core-kit';
import { SessionGrantRevokeTarget, SignInIdentifier, demoAppApplicationId } from '@logto/schemas';
import { assert } from '@silverhand/essentials';

import { deleteApplication } from '#src/api/application.js';
import {
  getUserApplicationGrants,
  getUserSession,
  getUserSessions,
  revokeUserGrant,
  revokeUserSession,
} from '#src/api/index.js';
import { signInWithPassword } from '#src/helpers/experience/index.js';
import { expectRejects } from '#src/helpers/index.js';
import {
  assertRefreshTokenInvalidGrant,
  assertRefreshTokenValid,
  createAppAndSignInWithPassword,
  findSessionByAppId,
} from '#src/helpers/session.js';
import { enableAllPasswordSignInMethods } from '#src/helpers/sign-in-experience.js';
import { generateNewUserProfile, UserApiTest } from '#src/helpers/user.js';

describe('Sessions API', () => {
  const userApi = new UserApiTest();

  afterEach(async () => {
    await userApi.cleanUp();
  });

  it('should get user sessions and revoke session properly', async () => {
    await enableAllPasswordSignInMethods();

    const { username, password } = generateNewUserProfile({ username: true, password: true });
    const user = await userApi.create({ username, password });

    await signInWithPassword({
      identifier: {
        type: SignInIdentifier.Username,
        value: username,
      },
      password,
    });

    await signInWithPassword({
      identifier: {
        type: SignInIdentifier.Username,
        value: username,
      },
      password,
    });

    const { sessions } = await getUserSessions(user.id);

    expect(sessions).toHaveLength(2);

    for (const session of sessions) {
      expect(session).toHaveProperty('accountId', user.id);
      expect(session).toHaveProperty('lastSubmission');
      expect(session).toHaveProperty('clientId', demoAppApplicationId);
      expect(session).toHaveProperty('expiresAt');
      expect(session).not.toHaveProperty('id');
      expect(session).not.toHaveProperty('tenantId');
      expect(session).not.toHaveProperty('consumedAt');
      expect(session.payload.accountId).toBe(user.id);
      expect(session.payload.authorizations).toHaveProperty(demoAppApplicationId);
    }

    // Revoke the first session including grants
    const sessionId = sessions[0]!.payload.uid;
    await revokeUserSession(user.id, sessionId, SessionGrantRevokeTarget.All);

    // Verify the session is revoked
    const { sessions: sessionsAfterRevoke } = await getUserSessions(user.id);
    expect(sessionsAfterRevoke).toHaveLength(1);
    expect(sessionsAfterRevoke[0]!.payload.uid).toBe(sessions[1]!.payload.uid);
  });

  it('should get a single user session by session id', async () => {
    await enableAllPasswordSignInMethods();

    const { username, password } = generateNewUserProfile({ username: true, password: true });
    const user = await userApi.create({ username, password });

    await signInWithPassword({
      identifier: {
        type: SignInIdentifier.Username,
        value: username,
      },
      password,
    });

    const { sessions } = await getUserSessions(user.id);
    const sessionId = sessions[0]!.payload.uid;

    const session = await getUserSession(user.id, sessionId);

    expect(session).toHaveProperty('accountId', user.id);
    expect(session).toHaveProperty('lastSubmission');
    expect(session).toHaveProperty('clientId', demoAppApplicationId);
    expect(session).toHaveProperty('expiresAt');
    expect(session).not.toHaveProperty('id');
    expect(session).not.toHaveProperty('tenantId');
    expect(session).not.toHaveProperty('consumedAt');
    expect(session.payload.uid).toBe(sessionId);
    expect(session.payload.accountId).toBe(user.id);
    expect(session.payload.authorizations).toHaveProperty(demoAppApplicationId);
  });

  it('should revoke session with first-party grants option', async () => {
    await enableAllPasswordSignInMethods();

    const { username, password } = generateNewUserProfile({ username: true, password: true });
    const user = await userApi.create({ username, password });

    const { app, refreshToken } = await createAppAndSignInWithPassword({
      username,
      password,
    });

    assert(refreshToken, new Error('No refresh token found'));

    const { sessions } = await getUserSessions(user.id);
    const session = findSessionByAppId(sessions, app.id);
    assert(session, new Error('First-party session not found'));
    const sessionId = session.payload.uid;

    await revokeUserSession(user.id, sessionId, SessionGrantRevokeTarget.FirstParty);

    const { sessions: sessionsAfterRevoke } = await getUserSessions(user.id);
    expect(sessionsAfterRevoke).toHaveLength(0);

    await assertRefreshTokenInvalidGrant({
      clientId: app.id,
      refreshToken,
    });

    await deleteApplication(app.id);
  });

  it('should revoke session with all grants target', async () => {
    await enableAllPasswordSignInMethods();

    const { username, password } = generateNewUserProfile({ username: true, password: true });
    const user = await userApi.create({ username, password });

    const { app, refreshToken } = await createAppAndSignInWithPassword({
      username,
      password,
    });

    assert(refreshToken, new Error('No refresh token found'));

    const { sessions } = await getUserSessions(user.id);
    const session = findSessionByAppId(sessions, app.id);
    assert(session, new Error('First-party session not found'));
    const sessionId = session.payload.uid;

    await revokeUserSession(user.id, sessionId, SessionGrantRevokeTarget.All);

    const { sessions: sessionsAfterRevoke } = await getUserSessions(user.id);
    expect(sessionsAfterRevoke).toHaveLength(0);

    await assertRefreshTokenInvalidGrant({
      clientId: app.id,
      refreshToken,
    });

    await deleteApplication(app.id);
  });

  it('should keep third-party grants active when revoke target is first-party', async () => {
    await enableAllPasswordSignInMethods();

    const { username, password } = generateNewUserProfile({ username: true, password: true });
    const user = await userApi.create({ username, password });

    const { app, refreshToken } = await createAppAndSignInWithPassword({
      username,
      password,
      isThirdParty: true,
      scopes: [UserScope.Profile],
    });

    assert(refreshToken, new Error('No refresh token found'));

    const { sessions } = await getUserSessions(user.id);
    const session = findSessionByAppId(sessions, app.id);
    assert(session, new Error('Third-party session not found'));

    await revokeUserSession(user.id, session.payload.uid, SessionGrantRevokeTarget.FirstParty);

    await assertRefreshTokenValid({
      clientId: app.id,
      refreshToken,
    });

    await deleteApplication(app.id);
  });

  it('should return 404 when getting a non-existing session id', async () => {
    await enableAllPasswordSignInMethods();

    const { username, password } = generateNewUserProfile({ username: true, password: true });
    const user = await userApi.create({ username, password });

    await expectRejects(getUserSession(user.id, 'non-existing-session-id'), {
      code: 'oidc.session_not_found',
      status: 404,
    });
  });

  it('should return 404 when getting another user session by session id', async () => {
    await enableAllPasswordSignInMethods();

    const firstUserProfile = generateNewUserProfile({ username: true, password: true });
    const secondUserProfile = generateNewUserProfile({ username: true, password: true });
    const firstUser = await userApi.create(firstUserProfile);
    const secondUser = await userApi.create(secondUserProfile);

    await signInWithPassword({
      identifier: {
        type: SignInIdentifier.Username,
        value: secondUserProfile.username,
      },
      password: secondUserProfile.password,
    });

    const { sessions: secondUserSessions } = await getUserSessions(secondUser.id);
    const secondUserSessionId = secondUserSessions[0]!.payload.uid;

    await expectRejects(getUserSession(firstUser.id, secondUserSessionId), {
      code: 'oidc.session_not_found',
      status: 404,
    });
  });

  it('should get user grants and support appType filters', async () => {
    await enableAllPasswordSignInMethods();

    const { username, password } = generateNewUserProfile({ username: true, password: true });
    const user = await userApi.create({ username, password });

    const firstPartySignIn = await createAppAndSignInWithPassword({
      username,
      password,
      isThirdParty: false,
      scopes: [UserScope.Profile],
    });

    const thirdPartySignIn = await createAppAndSignInWithPassword({
      username,
      password,
      isThirdParty: true,
      scopes: [UserScope.Profile],
    });

    const { grants: allGrants } = await getUserApplicationGrants(user.id);
    expect(allGrants.length).toBeGreaterThanOrEqual(2);
    expect(allGrants.some((grant) => grant.payload.clientId === firstPartySignIn.app.id)).toBe(
      true
    );
    expect(allGrants.some((grant) => grant.payload.clientId === thirdPartySignIn.app.id)).toBe(
      true
    );

    const { grants: firstPartyGrants } = await getUserApplicationGrants(user.id, 'firstParty');
    expect(firstPartyGrants.length).toBeGreaterThanOrEqual(1);
    expect(
      firstPartyGrants.some((grant) => grant.payload.clientId === firstPartySignIn.app.id)
    ).toBe(true);
    expect(
      firstPartyGrants.some((grant) => grant.payload.clientId === thirdPartySignIn.app.id)
    ).toBe(false);

    const { grants: thirdPartyGrants } = await getUserApplicationGrants(user.id, 'thirdParty');
    expect(thirdPartyGrants.length).toBeGreaterThanOrEqual(1);
    expect(
      thirdPartyGrants.some((grant) => grant.payload.clientId === thirdPartySignIn.app.id)
    ).toBe(true);
    expect(
      thirdPartyGrants.some((grant) => grant.payload.clientId === firstPartySignIn.app.id)
    ).toBe(false);

    await Promise.all([
      deleteApplication(firstPartySignIn.app.id),
      deleteApplication(thirdPartySignIn.app.id),
    ]);
  });

  it('should revoke user grant by grant id', async () => {
    await enableAllPasswordSignInMethods();

    const { username, password } = generateNewUserProfile({ username: true, password: true });
    const user = await userApi.create({ username, password });

    const { app, refreshToken } = await createAppAndSignInWithPassword({
      username,
      password,
      scopes: [UserScope.Profile],
    });

    assert(refreshToken, new Error('No refresh token found'));

    const { grants } = await getUserApplicationGrants(user.id);
    const grant = grants.find((item) => item.payload.clientId === app.id);
    assert(grant, new Error('Grant not found for application'));

    await revokeUserGrant(user.id, grant.id);

    await assertRefreshTokenInvalidGrant({
      clientId: app.id,
      refreshToken,
    });

    const { sessions } = await getUserSessions(user.id);
    const appSession = findSessionByAppId(sessions, app.id);
    expect(appSession).toBeUndefined();

    await deleteApplication(app.id);
  });

  it('should return 404 when revoking another user grant', async () => {
    await enableAllPasswordSignInMethods();

    const firstUserProfile = generateNewUserProfile({ username: true, password: true });
    const secondUserProfile = generateNewUserProfile({ username: true, password: true });
    const firstUser = await userApi.create(firstUserProfile);
    const secondUser = await userApi.create(secondUserProfile);

    const { app } = await createAppAndSignInWithPassword({
      username: secondUserProfile.username,
      password: secondUserProfile.password,
      scopes: [UserScope.Profile],
    });

    const { grants } = await getUserApplicationGrants(secondUser.id);
    const secondUserGrant = grants.find((grant) => grant.payload.clientId === app.id);
    assert(secondUserGrant, new Error('Second user grant not found'));

    await expectRejects(revokeUserGrant(firstUser.id, secondUserGrant.id), {
      code: 'oidc.invalid_grant',
      status: 404,
    });

    await deleteApplication(app.id);
  });
});
