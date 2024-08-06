import {
  InteractionEvent,
  SignInIdentifier,
  type VerificationCodeIdentifier,
} from '@logto/schemas';

import { deleteUser } from '#src/api/admin-user.js';
import { initExperienceClient, logoutClient, processSession } from '#src/helpers/client.js';
import { setEmailConnector, setSmsConnector } from '#src/helpers/connector.js';
import { registerNewUserWithVerificationCode } from '#src/helpers/experience/index.js';
import {
  successfullySendVerificationCode,
  successfullyVerifyVerificationCode,
} from '#src/helpers/experience/verification-code.js';
import { expectRejects } from '#src/helpers/index.js';
import { enableAllVerificationCodeSignInMethods } from '#src/helpers/sign-in-experience.js';
import { generateNewUser } from '#src/helpers/user.js';
import { devFeatureTest, generateEmail, generatePhone } from '#src/utils.js';

const verificationIdentifierType: readonly [SignInIdentifier.Email, SignInIdentifier.Phone] =
  Object.freeze([SignInIdentifier.Email, SignInIdentifier.Phone]);

const identifiersTypeToUserProfile = Object.freeze({
  email: 'primaryEmail',
  phone: 'primaryPhone',
});

devFeatureTest.describe('Register interaction with verification code happy path', () => {
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

        const client = await initExperienceClient(InteractionEvent.Register);

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

        const client = await initExperienceClient(InteractionEvent.Register);

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
