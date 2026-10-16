import { type LogtoConfig } from '@logto/node';
import { demoAppApplicationId, SignInIdentifier, type User } from '@logto/schemas';
import { conditional } from '@silverhand/essentials';

import {
  mockSocialConnectorConfig,
  mockSocialConnectorId,
} from '#src/__mocks__/connectors-mock.js';
import { listConnectors, postConnector } from '#src/api/index.js';
import { demoAppRedirectUri, logtoUrl } from '#src/constants.js';
import { generatePassword, generateUsername } from '#src/utils.js';

import { baseApi, authedAdminApi } from '../api/api.js';

import { initExperienceClient, processSession } from './client.js';
import { identifyWithSocial, linkSocialIdentity } from './experience/sign-in-with-acr.js';

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

/**
 * Ensure the mock social connector exists, so a social sign-in works in a test file that sets up
 * no connector of its own.
 */
const findOrCreateMockSocialConnector = async () => {
  const connectors = await listConnectors();
  const existing = connectors.find(({ connectorId }) => connectorId === mockSocialConnectorId);

  if (existing) {
    return existing.id;
  }

  const { id } = await postConnector({
    connectorId: mockSocialConnectorId,
    config: mockSocialConnectorConfig,
  });

  return id;
};

/**
 * Link a fresh mock social identity to the user, sign in with it, and return an API client
 * carrying the resulting access token.
 *
 * A social sign-in records `amr=["fed"]` and no `acr`, so the token never satisfies the Account
 * API's OIDC authentication context policy: sensitive routes keep answering with the legacy
 * `verification_record.permission_denied` until the request presents a valid verification record.
 * That is the token the negative cases of the legacy `logto-verification-id` path need, next to
 * {@link signInAndGetUserApi}, whose fresh password sign-in now carries a qualifying context.
 *
 * The mock social connector is reused or created on demand, so callers need no social connector
 * setup of their own.
 */
export const signInWithSocialAndGetUserApi = async (
  userId: string,
  config?: Partial<LogtoConfig>
) => {
  const connectorId = await findOrCreateMockSocialConnector();
  const socialUserId = await linkSocialIdentity(userId, connectorId);
  const client = await initExperienceClient({
    config: {
      endpoint: logtoUrl,
      appId: demoAppApplicationId,
      ...config,
    },
    redirectUri: demoAppRedirectUri,
  });

  await identifyWithSocial(client, connectorId, socialUserId);

  const { redirectTo } = await client.submitInteraction();
  await processSession(client, redirectTo);
  const accessToken = await client.getAccessToken();

  return baseApi.extend({
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
};
