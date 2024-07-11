/**
 * @fileoverview This file contains the successful interaction flow helper functions that use the experience APIs.
 */

import {
  InteractionEvent,
  InteractionIdentifierType,
  type InteractionIdentifier,
  type VerificationCodeIdentifier,
} from '@logto/schemas';

import { type ExperienceClient } from '#src/client/experience/index.js';

import { initExperienceClient, logoutClient, processSession } from '../client.js';

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

  const { verificationId } = await client.verifyPassword({
    identifier,
    password,
  });

  await client.identifyUser({
    interactionEvent: InteractionEvent.SignIn,
    verificationId,
  });

  const { redirectTo } = await client.submitInteraction();

  await processSession(client, redirectTo);
  await logoutClient(client);
};

export const signInWithVerificationCode = async (identifier: VerificationCodeIdentifier) => {
  const client = await initExperienceClient();

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
    interactionEvent: InteractionEvent.SignIn,
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
  const { verificationId } = await client.verifyPassword({
    identifier: {
      type: InteractionIdentifierType.Username,
      value: username,
    },
    password,
  });

  await client.identifyUser({ interactionEvent: InteractionEvent.SignIn, verificationId });

  return { verificationId };
};
