import type {
  AccountCreatedPersonalAccessTokenResponse,
  AccountPersonalAccessTokenResponse,
} from '@logto/schemas';

import { verificationRecordIdHeader } from './account';
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
  verificationRecordId: string,
  payload: { name: string; expiresAt: number }
): Promise<AccountCreatedPersonalAccessTokenResponse> => {
  return createAuthenticatedKy(accessToken)
    .post('/api/my-account/personal-access-tokens', {
      json: payload,
      headers: { [verificationRecordIdHeader]: verificationRecordId },
    })
    .json<AccountCreatedPersonalAccessTokenResponse>();
};

export const renamePersonalAccessToken = async (
  accessToken: string,
  verificationRecordId: string,
  payload: { currentName: string; name: string }
): Promise<AccountPersonalAccessTokenResponse> => {
  return createAuthenticatedKy(accessToken)
    .patch('/api/my-account/personal-access-tokens', {
      json: payload,
      headers: { [verificationRecordIdHeader]: verificationRecordId },
    })
    .json<AccountPersonalAccessTokenResponse>();
};

export const revokePersonalAccessToken = async (
  accessToken: string,
  verificationRecordId: string,
  name: string
): Promise<void> => {
  await createAuthenticatedKy(accessToken).post('/api/my-account/personal-access-tokens/delete', {
    json: { name },
    headers: { [verificationRecordIdHeader]: verificationRecordId },
  });
};
