import { SignInIdentifier } from '@logto/schemas';

import { deleteUser } from '#src/api/admin-user.js';
import { updateSignInExperience } from '#src/api/sign-in-experience.js';
import {
  registerNewUserUsernamePassword,
  signInWithPassword,
} from '#src/helpers/experience/index.js';
import { generateNewUserProfile } from '#src/helpers/user.js';
import { devFeatureTest } from '#src/utils.js';

devFeatureTest.describe('register new user with username and password', () => {
  const { username, password } = generateNewUserProfile({ username: true, password: true });

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

  it('should register new user with username and password and able to sign-in using the same credentials', async () => {
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
});
