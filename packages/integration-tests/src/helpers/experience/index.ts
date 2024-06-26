/**
 * @fileoverview This file contains the successful interaction flow helper functions that use the experience APIs.
 */

import { InteractionEvent, type InteractionIdentifier } from '@logto/schemas';

import { identifyUser } from '#src/api/experience-api/index.js';
import { createPasswordVerification } from '#src/api/experience-api/password-verification.js';

import { initClient, logoutClient, processSession } from '../client.js';

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
