import { InteractionIdentifierType } from '@logto/schemas';

import { deleteUser } from '#src/api/admin-user.js';
import { signInWithPassword } from '#src/helpers/experience/index.js';
import { enableAllPasswordSignInMethods } from '#src/helpers/sign-in-experience.js';
import { generateNewUser } from '#src/helpers/user.js';
import { devFeatureTest } from '#src/utils.js';

const identifiersTypeToUserProfile = Object.freeze({
  username: 'username',
  email: 'primaryEmail',
  phone: 'primaryPhone',
});

devFeatureTest.describe('sign-in with password verification happy path', () => {
  beforeAll(async () => {
    await enableAllPasswordSignInMethods();
  });

  it.each(Object.values(InteractionIdentifierType))(
    'should sign-in with password using %p',
    async (identifier) => {
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
    }
  );
});
