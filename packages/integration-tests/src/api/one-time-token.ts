import { type OneTimeTokenStatus, type OneTimeToken } from '@logto/schemas';

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

export const getOneTimeTokenById = async (id: string) =>
  authedAdminApi.get(`one-time-tokens/${id}`).json<OneTimeToken>();

export const updateOneTimeTokenStatus = async (id: string, status: OneTimeTokenStatus) =>
  authedAdminApi
    .put(`one-time-tokens/${id}/status`, {
      json: { status },
    })
    .json<OneTimeToken>();
