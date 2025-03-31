import {
  AlternativeSignUpIdentifier,
  InteractionEvent,
  SignInIdentifier,
  type VerificationCodeIdentifier,
} from '@logto/schemas';

import { deleteUser } from '#src/api/admin-user.js';
import { updateSignInExperience } from '#src/api/sign-in-experience.js';
import { initExperienceClient, logoutClient, processSession } from '#src/helpers/client.js';
import { setEmailConnector, setSmsConnector } from '#src/helpers/connector.js';
import {
  fulfillUserEmail,
  registerNewUserUsernamePassword,
  signInWithPassword,
} from '#src/helpers/experience/index.js';
import {
  successfullySendVerificationCode,
  successfullyVerifyVerificationCode,
} from '#src/helpers/experience/verification-code.js';
import { expectRejects } from '#src/helpers/index.js';
import { enableAllVerificationCodeSignInMethods } from '#src/helpers/sign-in-experience.js';
import { generateNewUser, generateNewUserProfile, UserApiTest } from '#src/helpers/user.js';
import { generateUsername } from '#src/utils.js';

const verificationIdentifierType: readonly [SignInIdentifier.Email, SignInIdentifier.Phone] =
  Object.freeze([SignInIdentifier.Email, SignInIdentifier.Phone]);

const identifiersTypeToUserProfile = Object.freeze({
  email: 'primaryEmail',
  phone: 'primaryPhone',
});

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

    const client = await initExperienceClient({
      interactionEvent: InteractionEvent.Register,
    });

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

describe('register new user with username and password with secondary identifiers', () => {
  beforeAll(async () => {
    await Promise.all([setEmailConnector(), setSmsConnector()]);
  });

  it.each([SignInIdentifier.Email, AlternativeSignUpIdentifier.EmailOrPhone])(
    'set %s as secondary identifier',
    async (secondaryIdentifier) => {
      await enableAllVerificationCodeSignInMethods({
        identifiers: [SignInIdentifier.Username],
        password: true,
        verify: true,
        secondaryIdentifiers: [
          {
            identifier: secondaryIdentifier,
            verify: true,
          },
        ],
      });

      const { username, password, primaryEmail } = generateNewUserProfile({
        username: true,
        password: true,
        primaryEmail: true,
      });

      const client = await initExperienceClient({
        interactionEvent: InteractionEvent.Register,
      });

      await client.updateProfile({ type: SignInIdentifier.Username, value: username });
      await client.updateProfile({ type: 'password', value: password });

      await expectRejects(client.identifyUser(), {
        status: 422,
        code: 'user.missing_profile',
      });

      await fulfillUserEmail(client, primaryEmail);

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

      await signInWithPassword({
        identifier: {
          type: SignInIdentifier.Email,
          value: primaryEmail,
        },
        password,
      });

      await deleteUser(userId);
    }
  );

  it.each(verificationIdentifierType)(
    'should fail to sign-up with existing %s as secondary identifier, and directly sign-in instead',
    async (identifierType) => {
      await enableAllVerificationCodeSignInMethods({
        identifiers: [SignInIdentifier.Username],
        password: true,
        verify: true,
        secondaryIdentifiers: [
          {
            identifier: AlternativeSignUpIdentifier.EmailOrPhone,
            verify: true,
          },
        ],
      });

      const { userProfile, user } = await generateNewUser({
        [identifiersTypeToUserProfile[identifierType]]: true,
        username: true,
        password: true,
      });

      const client = await initExperienceClient({
        interactionEvent: InteractionEvent.Register,
      });

      await client.updateProfile({ type: SignInIdentifier.Username, value: generateUsername() });

      const identifier: VerificationCodeIdentifier = {
        type: identifierType,
        value: userProfile[identifiersTypeToUserProfile[identifierType]]!,
      };

      const { verificationId, code } = await successfullySendVerificationCode(client, {
        identifier,
        interactionEvent: InteractionEvent.Register,
      });

      await successfullyVerifyVerificationCode(client, {
        identifier,
        verificationId,
        code,
      });

      await expectRejects(
        client.identifyUser({
          verificationId,
        }),
        {
          code: `user.${identifierType}_already_in_use`,
          status: 422,
        }
      );

      await client.updateInteractionEvent({
        interactionEvent: InteractionEvent.SignIn,
      });

      await client.identifyUser({
        verificationId,
      });

      const { redirectTo } = await client.submitInteraction();
      await processSession(client, redirectTo);
      await logoutClient(client);

      await deleteUser(user.id);
    }
  );
});
