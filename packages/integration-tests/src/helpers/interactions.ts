import type {
  EmailPasswordPayload,
  PhonePasswordPayload,
  UsernamePasswordPayload,
} from '@logto/schemas';
import { InteractionEvent } from '@logto/schemas';

import {
  createSocialAuthorizationUri,
  patchInteractionIdentifiers,
  putInteraction,
  putInteractionProfile,
  sendVerificationCode,
} from '#src/api/index.js';
import { generateUserId } from '#src/utils.js';

import { initClient, logoutClient, processSession } from './client.js';
import { expectRejects, readConnectorMessage } from './index.js';
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
  const userId = await processSession(client, redirectTo);
  await logoutClient(client);
  return userId;
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

  await expectRejects(client.submitInteraction(), {
    code: 'user.identity_not_exist',
    status: 422,
  });
  await client.successSend(patchInteractionIdentifiers, { username, password });
  await client.successSend(putInteractionProfile, { connectorId });

  const { redirectTo } = await client.submitInteraction();

  return processSession(client, redirectTo);
};

export const signInWithUsernamePasswordAndUpdateEmailOrPhone = async (
  username: string,
  password: string,
  profile: { email: string } | { phone: string }
) => {
  const client = await initClient();

  await client.successSend(putInteraction, {
    event: InteractionEvent.SignIn,
    identifier: {
      username,
      password,
    },
  });

  await expectRejects(client.submitInteraction(), {
    code: 'user.missing_profile',
    status: 422,
  });

  await client.successSend(sendVerificationCode, profile);

  const { code } = await readConnectorMessage('email' in profile ? 'Email' : 'Sms');

  await client.successSend(patchInteractionIdentifiers, {
    ...profile,
    verificationCode: code,
  });

  await client.successSend(putInteractionProfile, profile);

  const { redirectTo } = await client.submitInteraction();

  await processSession(client, redirectTo);
  await logoutClient(client);
};

export const resetPassword = async (
  profile: { email: string } | { phone: string },
  newPassword: string
) => {
  const client = await initClient();

  await client.successSend(putInteraction, { event: InteractionEvent.ForgotPassword });
  await client.successSend(sendVerificationCode, {
    ...profile,
  });

  const { code: verificationCode } = await readConnectorMessage(
    'email' in profile ? 'Email' : 'Sms'
  );
  await client.successSend(patchInteractionIdentifiers, {
    ...profile,
    verificationCode,
  });
  await client.successSend(putInteractionProfile, { password: newPassword });
  await client.submitInteraction();
};
