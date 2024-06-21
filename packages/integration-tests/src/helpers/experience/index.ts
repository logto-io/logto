/**
 * @fileoverview This file contains the successful interaction flow helper functions that use the experience APIs.
 */

import { type InteractionIdentifier } from '@logto/schemas';

import { signInWithPassword as signInWithPasswordApi } from '#src/api/experience-api/index.js';

import { initClient, logoutClient, processSession } from '../client.js';

export const signInWithPassword = async ({
  identifier,
  password,
}: {
  identifier: InteractionIdentifier;
  password: string;
}) => {
  const client = await initClient();

  await client.successSend(signInWithPasswordApi, {
    identifier,
    password,
  });

  const { redirectTo } = await client.submitInteraction('v2');

  await processSession(client, redirectTo);
  await logoutClient(client);
};
