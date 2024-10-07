import { InteractionEvent, SignInIdentifier } from '@logto/schemas';

import { deleteUser } from '#src/api/admin-user.js';
import { updateSignInExperience } from '#src/api/sign-in-experience.js';
import { initExperienceClient, logoutClient, processSession } from '#src/helpers/client.js';
import {
  registerNewUserUsernamePassword,
  signInWithPassword,
} from '#src/helpers/experience/index.js';
import { expectRejects } from '#src/helpers/index.js';
import { generateNewUserProfile, UserApiTest } from '#src/helpers/user.js';
import { generateUsername } from '#src/utils.js';

describe('register new user with username and password', () => {
  const userApi = new UserApiTest();

  beforeAll(async () => {
    // Disable password policy here to make sure the test is not affected by the password policy.
    await updateSignInExperience({
      signUp: {
        identifiers: [SignInIdentifier.Username],
        password: true,
        verify: false,
      },
      passwordPolicy: {},
    });
  });

  afterAll(async () => {
    await userApi.cleanUp();
  });

  it('should register new user with username and password and able to sign-in using the same credentials', async () => {
    const { username, password } = generateNewUserProfile({ username: true, password: true });
    const userId = await registerNewUserUsernamePassword(username, password);

    await signInWithPassword({
      identifier: {
        type: SignInIdentifier.Username,
        value: username,
      },
      password,
    });

    await deleteUser(userId);
  });

  it('should register new user with username and password step by step and able to sign-in using the same credentials', async () => {
    const { username, password } = generateNewUserProfile({ username: true, password: true });
    const existUsername = generateUsername();
    await userApi.create({ username: existUsername });

    const client = await initExperienceClient(InteractionEvent.Register);

    await expectRejects(
      client.updateProfile({ type: SignInIdentifier.Username, value: existUsername }),
      {
        status: 422,
        code: 'user.username_already_in_use',
      }
    );

    await client.updateProfile({ type: SignInIdentifier.Username, value: username });

    await expectRejects(client.identifyUser(), {
      status: 422,
      code: 'user.missing_profile',
    });
    await client.updateProfile({ type: 'password', value: password });
    await client.identifyUser();
    const { redirectTo } = await client.submitInteraction();
    const userId = await processSession(client, redirectTo);
    await logoutClient(client);

    await signInWithPassword({
      identifier: {
        type: SignInIdentifier.Username,
        value: username,
      },
      password,
    });

    await deleteUser(userId);
  });
});
