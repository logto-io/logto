import { assert } from '@silverhand/essentials';

import MockClient from '#src/client/index.js';

export const initClient = async () => {
  const client = new MockClient();
  await client.initSession();
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
