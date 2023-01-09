import type {
  UsernamePasswordPayload,
  EmailPasswordPayload,
  PhonePasswordPayload,
} from '@logto/schemas';
import { InteractionEvent } from '@logto/schemas';

import {
  putInteraction,
  createSocialAuthorizationUri,
  patchInteractionIdentifiers,
  putInteractionProfile,
} from '#src/api/index.js';
import { generateUserId } from '#src/utils.js';

import { initClient, processSession, logoutClient } from './client.js';
import { expectRejects } from './index.js';
import { enableAllPasswordSignInMethods } from './sign-in-experience.js';
import { generateNewUser } from './user.js';

export const registerNewUser = async (username: string, password: string) => {
  const client = await initClient();

  await client.send(putInteraction, {
    event: InteractionEvent.Register,
    profile: {
      username,
      password,
    },
  });

  const { redirectTo } = await client.submitInteraction();
  await processSession(client, redirectTo);
  await logoutClient(client);
};

export const signInWithPassword = async (
  payload: UsernamePasswordPayload | EmailPasswordPayload | PhonePasswordPayload
) => {
  const client = await initClient();

  await client.successSend(putInteraction, {
    event: InteractionEvent.SignIn,
    identifier: payload,
  });

  const { redirectTo } = await client.submitInteraction();

  await processSession(client, redirectTo);
  await logoutClient(client);
};

export const createNewSocialUserWithUsernameAndPassword = async (connectorId: string) => {
  const state = 'foo_state';
  const redirectUri = 'http://foo.dev/callback';
  const code = 'auth_code_foo';
  const socialUserId = generateUserId();

  const {
    userProfile: { username, password },
    user,
  } = await generateNewUser({ username: true, password: true });

  await enableAllPasswordSignInMethods();

  const client = await initClient();

  await client.successSend(putInteraction, {
    event: InteractionEvent.SignIn,
  });

  await client.successSend(createSocialAuthorizationUri, { state, redirectUri, connectorId });

  await client.successSend(patchInteractionIdentifiers, {
    connectorId,
    connectorData: { state, redirectUri, code, userId: socialUserId },
  });

  await expectRejects(client.submitInteraction(), 'user.identity_not_exist');
  await client.successSend(patchInteractionIdentifiers, { username, password });
  await client.successSend(putInteractionProfile, { connectorId });

  const { redirectTo } = await client.submitInteraction();

  return processSession(client, redirectTo);
};
