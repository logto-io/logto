import { SignInIdentifier, demoAppApplicationId } from '@logto/schemas';

import { getUserSessions } from '#src/api/index.js';
import { signInWithPassword } from '#src/helpers/experience/index.js';
import { enableAllPasswordSignInMethods } from '#src/helpers/sign-in-experience.js';
import { generateNewUserProfile, UserApiTest } from '#src/helpers/user.js';
import { devFeatureTest } from '#src/utils.js';

devFeatureTest.describe('Sessions API', () => {
  const userApi = new UserApiTest();

  afterEach(async () => {
    await userApi.cleanUp();
  });

  it('should get user sessions', async () => {
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
      expect(session).toHaveProperty('id');
      expect(session).toHaveProperty('accountId', user.id);
      expect(session).toHaveProperty('lastSubmission');
      expect(session).toHaveProperty('clientId', demoAppApplicationId);
      expect(session.payload.accountId).toBe(user.id);
      expect(session.payload.authorizations).toHaveProperty(demoAppApplicationId);
    }
  });
});
