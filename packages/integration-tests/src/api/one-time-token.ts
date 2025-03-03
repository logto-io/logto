import { type OneTimeToken, type OneTimeTokenContext } from '@logto/schemas';

import { authedAdminApi } from './api.js';

export type CreateOneTimeToken = Pick<OneTimeToken, 'email'> &
  OneTimeTokenContext & { expiresIn?: number };

export const createOneTimeToken = async (createOneTimeToken: CreateOneTimeToken) =>
  authedAdminApi
    .post('one-time-tokens', {
      json: createOneTimeToken,
    })
    .json<OneTimeToken>();
