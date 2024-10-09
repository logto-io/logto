import { type LogtoConfig } from '@logto/node';
import { demoAppApplicationId, InteractionEvent, type User } from '@logto/schemas';

import { type InteractionPayload } from '#src/api/interaction.js';
import { demoAppRedirectUri, logtoUrl } from '#src/constants.js';
import { generatePassword, generateUsername } from '#src/utils.js';

import api, { baseApi, authedAdminApi } from '../api/api.js';

import { initClient } from './client.js';

export const createDefaultTenantUserWithPassword = async ({
  primaryEmail,
  primaryPhone,
}: {
  primaryEmail?: string;
  primaryPhone?: string;
} = {}) => {
  const username = generateUsername();
  const password = generatePassword();
  const user = await authedAdminApi
    .post('users', {
      json: { username, password, primaryEmail, primaryPhone },
    })
    .json<User>();

  return { user, username, password };
};

export const deleteDefaultTenantUser = async (id: string) => {
  await authedAdminApi.delete(`users/${id}`);
};

export const putInteraction = async (cookie: string, payload: InteractionPayload) =>
  api
    .put('interaction', {
      headers: { cookie },
      json: payload,
      redirect: 'manual',
      throwHttpErrors: false,
    })
    .json();

export const initClientAndSignInForDefaultTenant = async (
  username: string,
  password: string,
  config?: Partial<LogtoConfig>
) => {
  const client = await initClient(
    {
      endpoint: logtoUrl,
      appId: demoAppApplicationId,
      ...config,
    },
    demoAppRedirectUri
  );
  await client.successSend(putInteraction, {
    event: InteractionEvent.SignIn,
    identifier: {
      username,
      password,
    },
  });
  const { redirectTo } = await client.submitInteraction();
  await client.processSession(redirectTo);

  return client;
};

export const signInAndGetUserApi = async (
  username: string,
  password: string,
  config?: Partial<LogtoConfig>
) => {
  const client = await initClientAndSignInForDefaultTenant(username, password, config);
  const accessToken = await client.getAccessToken();

  return baseApi.extend({
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
};
