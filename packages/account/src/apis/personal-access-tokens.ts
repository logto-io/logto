import type {
  AccountCreatedPersonalAccessTokenResponse,
  AccountPersonalAccessTokenResponse,
} from '@logto/schemas';

import { createAuthenticatedKy } from './base-ky';

export const getPersonalAccessTokens = async (
  accessToken: string
): Promise<AccountPersonalAccessTokenResponse[]> => {
  return createAuthenticatedKy(accessToken)
    .get('/api/my-account/personal-access-tokens')
    .json<AccountPersonalAccessTokenResponse[]>();
};

export const createPersonalAccessToken = async (
  accessToken: string,
  payload: { name: string; expiresAt: number }
): Promise<AccountCreatedPersonalAccessTokenResponse> => {
  return createAuthenticatedKy(accessToken)
    .post('/api/my-account/personal-access-tokens', {
      json: payload,
    })
    .json<AccountCreatedPersonalAccessTokenResponse>();
};

export const renamePersonalAccessToken = async (
  accessToken: string,
  payload: { currentName: string; name: string }
): Promise<AccountPersonalAccessTokenResponse> => {
  return createAuthenticatedKy(accessToken)
    .patch('/api/my-account/personal-access-tokens', {
      json: payload,
    })
    .json<AccountPersonalAccessTokenResponse>();
};

export const revokePersonalAccessToken = async (
  accessToken: string,
  name: string
): Promise<void> => {
  await createAuthenticatedKy(accessToken).post('/api/my-account/personal-access-tokens/delete', {
    json: { name },
  });
};
