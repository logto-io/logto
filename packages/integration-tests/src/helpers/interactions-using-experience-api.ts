/**
 * @fileoverview This file contains the interaction flow helper functions that use the experience APIs.
 */

import { VerificationType, type PasswordIdentifier } from '@logto/schemas';

import { signIn } from '../api/experience-api.js';

import { initClient, logoutClient, processSession } from './client.js';

export const signInWithPassword = async ({
  identifier,
  password,
}: {
  identifier: PasswordIdentifier;
  password: string;
}) => {
  const client = await initClient();

  await client.successSend(signIn, {
    identifier,
    verification: {
      type: VerificationType.Password,
      value: password,
    },
  });

  const { redirectTo } = await client.submitInteraction('v2');

  await processSession(client, redirectTo);
  await logoutClient(client);
};
