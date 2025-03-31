import {
  InteractionEvent,
  SignInIdentifier,
  type VerificationCodeIdentifier,
} from '@logto/schemas';

import { deleteUser } from '#src/api/admin-user.js';
import { updateSignInExperience } from '#src/api/sign-in-experience.js';
import { initExperienceClient, logoutClient, processSession } from '#src/helpers/client.js';
import { setEmailConnector, setSmsConnector } from '#src/helpers/connector.js';
import {
  registerNewUserWithVerificationCode,
  signInWithPassword,
} from '#src/helpers/experience/index.js';
import {
  successfullySendVerificationCode,
  successfullyVerifyVerificationCode,
} from '#src/helpers/experience/verification-code.js';
import { expectRejects } from '#src/helpers/index.js';
import { enableAllVerificationCodeSignInMethods } from '#src/helpers/sign-in-experience.js';
import { generateNewUser, generateNewUserProfile } from '#src/helpers/user.js';
import { generateEmail, generatePhone } from '#src/utils.js';

const verificationIdentifierType: readonly [SignInIdentifier.Email, SignInIdentifier.Phone] =
  Object.freeze([SignInIdentifier.Email, SignInIdentifier.Phone]);

const identifiersTypeToUserProfile = Object.freeze({
  email: 'primaryEmail',
  phone: 'primaryPhone',
});

describe('Register interaction with verification code happy path', () => {
  beforeAll(async () => {
    await Promise.all([setEmailConnector(), setSmsConnector()]);
    await enableAllVerificationCodeSignInMethods({
      identifiers: [SignInIdentifier.Email, SignInIdentifier.Phone],
      password: false,
      verify: true,
    });
  });

  it.each(verificationIdentifierType)(
    'Should register with verification code using %p successfully',
    async (identifier) => {
      const userId = await registerNewUserWithVerificationCode({
        type: identifier,
        value: identifier === SignInIdentifier.Email ? generateEmail() : generatePhone(),
      });

      await deleteUser(userId);
    }
  );

  describe('sign-up with existing identifier', () => {
    beforeAll(async () => {
      await Promise.all([setEmailConnector(), setSmsConnector()]);
      await enableAllVerificationCodeSignInMethods({
        identifiers: [SignInIdentifier.Email, SignInIdentifier.Phone],
        password: false,
        verify: true,
      });
    });

    it.each(verificationIdentifierType)(
      'Should fail to sign-up with existing %p identifier and directly sign-in instead',
      async (identifierType) => {
        const { userProfile, user } = await generateNewUser({
          [identifiersTypeToUserProfile[identifierType]]: true,
          password: true,
        });

        const identifier: VerificationCodeIdentifier = {
          type: identifierType,
          value: userProfile[identifiersTypeToUserProfile[identifierType]]!,
        };

        const client = await initExperienceClient({
          interactionEvent: InteractionEvent.Register,
        });

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

  describe('password enabled', () => {
    beforeAll(async () => {
      await enableAllVerificationCodeSignInMethods({
        identifiers: [SignInIdentifier.Email, SignInIdentifier.Phone],
        password: true,
        verify: true,
      });
    });

    it.each(verificationIdentifierType)(
      'Should fail to sign-up with existing %p identifier and directly sign-in instead',
      async (identifierType) => {
        const { userProfile, user } = await generateNewUser({
          [identifiersTypeToUserProfile[identifierType]]: true,
          password: true,
        });

        const identifier: VerificationCodeIdentifier = {
          type: identifierType,
          value: userProfile[identifiersTypeToUserProfile[identifierType]]!,
        };

        const client = await initExperienceClient({
          interactionEvent: InteractionEvent.Register,
        });

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

    it.each(verificationIdentifierType)(
      'Should register with verification code using %p and fulfill the password successfully',
      async (identifier) => {
        const userId = await registerNewUserWithVerificationCode(
          {
            type: identifier,
            value: identifier === SignInIdentifier.Email ? generateEmail() : generatePhone(),
          },
          {
            fulfillPassword: true,
          }
        );

        await deleteUser(userId);
      }
    );
  });
});

describe('username as secondary identifier', () => {
  beforeAll(async () => {
    await updateSignInExperience({
      signUp: {
        identifiers: [SignInIdentifier.Email, SignInIdentifier.Phone],
        password: true,
        verify: true,
        secondaryIdentifiers: [
          {
            identifier: SignInIdentifier.Username,
          },
        ],
      },
    });
  });

  it.each(verificationIdentifierType)(
    'Should register with verification code using %p and fulfill the password and username successfully',
    async (identifierType) => {
      const identifier = {
        type: identifierType,
        value: identifierType === SignInIdentifier.Email ? generateEmail() : generatePhone(),
      };

      const client = await initExperienceClient({
        interactionEvent: InteractionEvent.Register,
      });
      const { verificationId, code } = await successfullySendVerificationCode(client, {
        identifier,
        interactionEvent: InteractionEvent.Register,
      });
      await successfullyVerifyVerificationCode(client, {
        identifier,
        verificationId,
        code,
      });
      await expectRejects(client.identifyUser({ verificationId }), {
        code: 'user.missing_profile',
        status: 422,
      });

      const { username, password } = generateNewUserProfile({
        username: true,
        password: true,
      });

      await client.updateProfile({ type: 'password', value: password });

      await expectRejects(client.identifyUser({ verificationId }), {
        code: 'user.missing_profile',
        status: 422,
      });

      await client.updateProfile({ type: SignInIdentifier.Username, value: username });

      await client.identifyUser();

      const { redirectTo } = await client.submitInteraction();

      const userId = await processSession(client, redirectTo);
      await logoutClient(client);

      // Should able to sign-in with username password
      await signInWithPassword({
        identifier: {
          type: SignInIdentifier.Username,
          value: username,
        },
        password,
      });

      // Should able to sign-in with email password
      await signInWithPassword({
        identifier,
        password,
      });

      void deleteUser(userId);
    }
  );
});
