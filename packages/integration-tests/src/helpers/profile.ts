import { type LogtoConfig } from '@logto/node';
import { demoAppApplicationId, SignInIdentifier, type User } from '@logto/schemas';
import { conditional } from '@silverhand/essentials';

import { demoAppRedirectUri, logtoUrl } from '#src/constants.js';
import { generatePassword, generateUsername } from '#src/utils.js';

import { baseApi, authedAdminApi } from '../api/api.js';

import { initExperienceClient } from './client.js';

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

export const initClientAndSignInForDefaultTenant = async (
  username: string,
  password: string,
  config?: Partial<LogtoConfig>
) => {
  const client = await initExperienceClient({
    config: {
      endpoint: logtoUrl,
      appId: demoAppApplicationId,
      ...config,
    },
    redirectUri: demoAppRedirectUri,
  });

  const { verificationId } = await client.verifyPassword({
    identifier: {
      type: SignInIdentifier.Username,
      value: username,
    },
    password,
  });

  await client.identifyUser({ verificationId });

  const { redirectTo } = await client.submitInteraction();
  await client.processSession(redirectTo);

  return client;
};

export const signInAndGetUserApi = async (
  username: string,
  password: string,
  config?: Partial<LogtoConfig>,
  /**
   * The Accept-Language header value.
   */
  locale?: string
) => {
  const client = await initClientAndSignInForDefaultTenant(username, password, config);
  const accessToken = await client.getAccessToken();

  return baseApi.extend({
    headers: {
      Authorization: `Bearer ${accessToken}`,
      ...conditional(locale && { 'Accept-Language': locale }),
    },
  });
};
