/**
 * @fileoverview This file contains the successful interaction flow helper functions that use the experience APIs.
 */

import { type SocialUserInfo } from '@logto/connector-kit';
import {
  InteractionEvent,
  SignInIdentifier,
  type InteractionIdentifier,
  type VerificationCodeIdentifier,
} from '@logto/schemas';

import { type ExperienceClient } from '#src/client/experience/index.js';

import { initExperienceClient, logoutClient, processSession } from '../client.js';
import { expectRejects } from '../index.js';

import {
  successFullyCreateSocialVerification,
  successFullyVerifySocialAuthorization,
} from './social-verification.js';
import {
  successfullySendVerificationCode,
  successfullyVerifyVerificationCode,
} from './verification-code.js';

export const signInWithPassword = async ({
  identifier,
  password,
}: {
  identifier: InteractionIdentifier;
  password: string;
}) => {
  const client = await initExperienceClient();

  await client.initInteraction({ interactionEvent: InteractionEvent.SignIn });

  const { verificationId } = await client.verifyPassword({
    identifier,
    password,
  });

  await client.identifyUser({
    verificationId,
  });

  const { redirectTo } = await client.submitInteraction();

  await processSession(client, redirectTo);
  await logoutClient(client);
};

export const signInWithVerificationCode = async (identifier: VerificationCodeIdentifier) => {
  const client = await initExperienceClient();

  await client.initInteraction({ interactionEvent: InteractionEvent.SignIn });

  const { verificationId, code } = await successfullySendVerificationCode(client, {
    identifier,
    interactionEvent: InteractionEvent.SignIn,
  });

  const verifiedVerificationId = await successfullyVerifyVerificationCode(client, {
    identifier,
    verificationId,
    code,
  });

  await client.identifyUser({
    verificationId: verifiedVerificationId,
  });

  const { redirectTo } = await client.submitInteraction();

  await processSession(client, redirectTo);
  await logoutClient(client);
};

/**
 * This helper function will create a password verification record and identify the user using the verification record.
 *
 * @remarks
 * - This function uses username as the identifier.
 * - This function is used for prebuild an identified interaction flow. E.g for MFA verification use
 */
export const identifyUserWithUsernamePassword = async (
  client: ExperienceClient,
  username: string,
  password: string
) => {
  await client.initInteraction({ interactionEvent: InteractionEvent.SignIn });

  const { verificationId } = await client.verifyPassword({
    identifier: {
      type: SignInIdentifier.Username,
      value: username,
    },
    password,
  });

  await client.identifyUser({ verificationId });

  return { verificationId };
};

export const registerNewUserWithVerificationCode = async (
  identifier: VerificationCodeIdentifier
) => {
  const client = await initExperienceClient();

  await client.initInteraction({ interactionEvent: InteractionEvent.Register });

  const { verificationId, code } = await successfullySendVerificationCode(client, {
    identifier,
    interactionEvent: InteractionEvent.Register,
  });

  const verifiedVerificationId = await successfullyVerifyVerificationCode(client, {
    identifier,
    verificationId,
    code,
  });

  await client.identifyUser({
    verificationId: verifiedVerificationId,
  });

  const { redirectTo } = await client.submitInteraction();

  const userId = await processSession(client, redirectTo);
  await logoutClient(client);

  return userId;
};

export const signInWithSocial = async (
  connectorId: string,
  socialUserInfo: SocialUserInfo,
  registerNewUser = false
) => {
  const state = 'state';
  const redirectUri = 'http://localhost:3000';

  const client = await initExperienceClient();
  await client.initInteraction({ interactionEvent: InteractionEvent.SignIn });

  const { verificationId } = await successFullyCreateSocialVerification(client, connectorId, {
    redirectUri,
    state,
  });

  await successFullyVerifySocialAuthorization(client, connectorId, {
    verificationId,
    connectorData: {
      state,
      redirectUri,
      code: 'fake_code',
      userId: socialUserInfo.id,
      email: socialUserInfo.email,
    },
  });

  if (registerNewUser) {
    await expectRejects(client.identifyUser({ verificationId }), {
      code: 'user.identity_not_exist',
      status: 404,
    });

    await client.updateInteractionEvent({ interactionEvent: InteractionEvent.Register });
    await client.identifyUser({ verificationId });
  } else {
    await client.identifyUser({
      verificationId,
    });
  }

  const { redirectTo } = await client.submitInteraction();
  const userId = await processSession(client, redirectTo);
  await logoutClient(client);

  return userId;
};
