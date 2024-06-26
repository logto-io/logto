import { deleteUser } from '#src/api/admin-user.js';
import { createPasswordVerification } from '#src/api/experience-api/password-verification.js';
import { initClient } from '#src/helpers/client.js';
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

describe('password verifications', () => {
  it.each(signInIdentifiersType)(
    'should verify with password successfully using %p',
    async (identifier) => {
      const { userProfile, user } = await generateNewUser({
        [identifiersTypeToUserProfile[identifier]]: true,
        password: true,
      });

      const client = await initClient();

      const { verificationId } = await client.send(createPasswordVerification, {
        identifier: {
          type: identifier,
          value: userProfile[identifiersTypeToUserProfile[identifier]]!,
        },
        password: userProfile.password,
      });

      expect(verificationId).toBeTruthy();

      await deleteUser(user.id);
    }
  );
});
