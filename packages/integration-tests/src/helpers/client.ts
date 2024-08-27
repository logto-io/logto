import type { LogtoConfig, SignInOptions } from '@logto/node';
import { InteractionEvent } from '@logto/schemas';
import { assert } from '@silverhand/essentials';

import { ExperienceClient } from '#src/client/experience/index.js';
import MockClient from '#src/client/index.js';

export const initClient = async (
  config?: Partial<LogtoConfig>,
  redirectUri?: string,
  options: Omit<SignInOptions, 'redirectUri'> = {}
) => {
  const client = new MockClient(config);
  await client.initSession(redirectUri, options);
  assert(client.interactionCookie, new Error('Session not found'));

  return client;
};

export const initExperienceClient = async (
  interactionEvent: InteractionEvent = InteractionEvent.SignIn,
  config?: Partial<LogtoConfig>,
  redirectUri?: string,
  options: Omit<SignInOptions, 'redirectUri'> = {}
) => {
  const client = new ExperienceClient(config);
  await client.initSession(redirectUri, options);
  assert(client.interactionCookie, new Error('Session not found'));
  await client.initInteraction({ interactionEvent });

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
