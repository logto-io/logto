import type { LogtoConfig, SignInOptions } from '@logto/node';
import { assert } from '@silverhand/essentials';
import { type Got } from 'got';

import MockClient from '#src/client/index.js';

export const initClient = async (
  config?: Partial<LogtoConfig>,
  redirectUri?: string,
  options: Omit<SignInOptions, 'redirectUri'> & {
    interactionApi?: Got;
    skipIdTokenVerification?: boolean;
  } = {}
) => {
  const client = new MockClient(config, options.interactionApi, options.skipIdTokenVerification);
  await client.initSession(redirectUri, options);
  assert(client.interactionCookie, new Error('Session not found'));

  return client;
};

export const processSession = async (client: MockClient, redirectTo: string) => {
  await client.processSession(redirectTo);

  await expect(client.isAuthenticated()).resolves.toBe(true);

  const { sub } = await client.getIdTokenClaims();

  return sub;
};

export const logoutClient = async (client: MockClient) => {
  await client.signOut();

  await expect(client.isAuthenticated()).resolves.toBe(false);
};
