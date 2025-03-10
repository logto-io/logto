import { type OneTimeToken } from '@logto/schemas';

import { authedAdminApi } from './api.js';

export type CreateOneTimeToken = Pick<OneTimeToken, 'email'> &
  Partial<Pick<OneTimeToken, 'context'>> & { expiresIn?: number };

export const createOneTimeToken = async (createOneTimeToken: CreateOneTimeToken) =>
  authedAdminApi
    .post('one-time-tokens', {
      json: createOneTimeToken,
    })
    .json<OneTimeToken>();

export const verifyOneTimeToken = async (
  verifyOneTimeToken: Pick<OneTimeToken, 'email' | 'token'>
) =>
  authedAdminApi
    .post('one-time-tokens/verify', {
      json: verifyOneTimeToken,
    })
    .json<OneTimeToken>();
