import { InteractionEvent, SignInIdentifier } from '@logto/schemas';

import { deleteUser, getUser } from '#src/api/admin-user.js';
import { initExperienceClient, logoutClient, processSession } from '#src/helpers/client.js';
import { setEmailConnector, setSmsConnector } from '#src/helpers/connector.js';
import {
  identifyUserWithUsernamePassword,
  signInWithPassword,
} from '#src/helpers/experience/index.js';
import {
  successfullySendVerificationCode,
  successfullyVerifyVerificationCode,
} from '#src/helpers/experience/verification-code.js';
import { expectRejects } from '#src/helpers/index.js';
import {
  enableAllPasswordSignInMethods,
  enableAllVerificationCodeSignInMethods,
} from '#src/helpers/sign-in-experience.js';
import { generateNewUser } from '#src/helpers/user.js';
import { devFeatureTest, generateEmail } from '#src/utils.js';

const identifiersTypeToUserProfile = Object.freeze({
  username: 'username',
  email: 'primaryEmail',
  phone: 'primaryPhone',
});

devFeatureTest.describe('sign-in with password verification happy path', () => {
  beforeAll(async () => {
    await enableAllPasswordSignInMethods();
    await Promise.all([setEmailConnector(), setSmsConnector()]);
  });

  it.each(Object.values(SignInIdentifier))(
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

  it('sign-in with username and password and fulfill the email', async () => {
    await enableAllVerificationCodeSignInMethods({
      identifiers: [SignInIdentifier.Email],
      password: true,
      verify: true,
    });

    const { userProfile, user } = await generateNewUser({
      username: true,
      password: true,
    });
    const { username, password } = userProfile;

    const primaryEmail = generateEmail();

    const client = await initExperienceClient();

    await identifyUserWithUsernamePassword(client, username, password);

    await expectRejects(client.submitInteraction(), {
      code: 'user.missing_profile',
      status: 422,
    });

    const { verificationId, code: verificationCode } = await successfullySendVerificationCode(
      client,
      {
        identifier: { type: SignInIdentifier.Email, value: primaryEmail },
        interactionEvent: InteractionEvent.SignIn,
      }
    );

    await successfullyVerifyVerificationCode(client, {
      identifier: { type: SignInIdentifier.Email, value: primaryEmail },
      verificationId,
      code: verificationCode,
    });

    await client.updateProfile({ type: SignInIdentifier.Email, verificationId });

    const { redirectTo } = await client.submitInteraction();
    await processSession(client, redirectTo);
    await logoutClient(client);

    const { primaryEmail: syncedEmail } = await getUser(user.id);

    expect(syncedEmail).toBe(primaryEmail);

    await deleteUser(user.id);
  });
});
