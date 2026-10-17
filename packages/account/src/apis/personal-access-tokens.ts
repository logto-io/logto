import type {
  AccountCreatedPersonalAccessTokenResponse,
  AccountPersonalAccessTokenResponse,
} from '@logto/schemas';

import { getVerificationRecordHeaders } from './account';
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
  verificationRecordId: string | undefined,
  payload: { name: string; expiresAt: number }
): Promise<AccountCreatedPersonalAccessTokenResponse> => {
  return createAuthenticatedKy(accessToken)
    .post('/api/my-account/personal-access-tokens', {
      json: payload,
      headers: getVerificationRecordHeaders(verificationRecordId),
    })
    .json<AccountCreatedPersonalAccessTokenResponse>();
};

export const renamePersonalAccessToken = async (
  accessToken: string,
  verificationRecordId: string | undefined,
  payload: { currentName: string; name: string }
): Promise<AccountPersonalAccessTokenResponse> => {
  return createAuthenticatedKy(accessToken)
    .patch('/api/my-account/personal-access-tokens', {
      json: payload,
      headers: getVerificationRecordHeaders(verificationRecordId),
    })
    .json<AccountPersonalAccessTokenResponse>();
};

export const revokePersonalAccessToken = async (
  accessToken: string,
  verificationRecordId: string | undefined,
  name: string
): Promise<void> => {
  await createAuthenticatedKy(accessToken).post('/api/my-account/personal-access-tokens/delete', {
    json: { name },
    headers: getVerificationRecordHeaders(verificationRecordId),
  });
};
