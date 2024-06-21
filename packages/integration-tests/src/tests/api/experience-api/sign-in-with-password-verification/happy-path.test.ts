import { deleteUser } from '#src/api/admin-user.js';
import { signInWithPassword } from '#src/helpers/experience/index.js';
import { enableAllPasswordSignInMethods } from '#src/helpers/sign-in-experience.js';
import { generateNewUser } from '#src/helpers/user.js';

const signInIdentifiersType: readonly ['username', 'email', 'phone'] = Object.freeze([
  'username',
  'email',
  'phone',
]);

const identifiersTypeToUserProfile = Object.freeze({
  username: 'username',
  email: 'primaryEmail',
  phone: 'primaryPhone',
});

describe('Sign-in with password verification happy path', () => {
  beforeAll(async () => {
    await enableAllPasswordSignInMethods();
  });

  it.each(signInIdentifiersType)('Should sign-in with password using %p', async (identifier) => {
    const { userProfile, user } = await generateNewUser({
      [identifiersTypeToUserProfile[identifier]]: true,
      password: true,
    });

    await signInWithPassword({
      identifier: {
        type: identifier,
        value: userProfile[identifiersTypeToUserProfile[identifier]]!,
      },
      password: userProfile.password,
    });

    await deleteUser(user.id);
  });
});
