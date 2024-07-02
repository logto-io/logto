/**
 * @fileoverview This file contains the successful interaction flow helper functions that use the experience APIs.
 */

import { InteractionEvent, type InteractionIdentifier } from '@logto/schemas';

import { initExperienceClient, logoutClient, processSession } from '../client.js';

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
