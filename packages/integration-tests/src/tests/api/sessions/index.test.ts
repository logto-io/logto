import { SignInIdentifier, demoAppApplicationId } from '@logto/schemas';

import { getUserSession, getUserSessions, revokeUserSession } from '#src/api/index.js';
import { signInWithPassword } from '#src/helpers/experience/index.js';
import { expectRejects } from '#src/helpers/index.js';
import { enableAllPasswordSignInMethods } from '#src/helpers/sign-in-experience.js';
import { generateNewUserProfile, UserApiTest } from '#src/helpers/user.js';
import { devFeatureTest } from '#src/utils.js';

devFeatureTest.describe('Sessions API', () => {
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
    await revokeUserSession(user.id, sessionId, true);

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
});
