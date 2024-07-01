/**
 * @fileoverview This file contains the successful interaction flow helper functions that use the experience APIs.
 */

import {
  InteractionEvent,
  type InteractionIdentifier,
  type VerificationCodeIdentifier,
} from '@logto/schemas';

import { identifyUser } from '#src/api/experience-api/index.js';
import { createPasswordVerification } from '#src/api/experience-api/password-verification.js';

import { initClient, logoutClient, processSession } from '../client.js';

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
  const client = await initClient();

  const { verificationId } = await client.send(createPasswordVerification, {
    identifier,
    password,
  });

  await client.successSend(identifyUser, {
    interactionEvent: InteractionEvent.SignIn,
    verificationId,
  });

  const { redirectTo } = await client.submitInteraction('v2');

  await processSession(client, redirectTo);
  await logoutClient(client);
};

export const signInWithVerificationCode = async (identifier: VerificationCodeIdentifier) => {
  const client = await initClient();

  const { verificationId, code } = await successfullySendVerificationCode(client, {
    identifier,
    interactionEvent: InteractionEvent.SignIn,
  });

  const verifiedVerificationId = await successfullyVerifyVerificationCode(client, {
    identifier,
    verificationId,
    code,
  });

  await client.successSend(identifyUser, {
    interactionEvent: InteractionEvent.SignIn,
    verificationId: verifiedVerificationId,
  });

  const { redirectTo } = await client.submitInteraction('v2');

  await processSession(client, redirectTo);
  await logoutClient(client);
};
