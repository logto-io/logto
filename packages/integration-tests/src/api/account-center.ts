import type { AccountCenter } from '@logto/schemas';
import { type KyInstance } from 'ky';

import { authedAdminApi } from './api.js';

export const getAccountCenter = async (api: KyInstance = authedAdminApi) =>
  api.get('account-center').json<AccountCenter>();

export const updateAccountCenter = async (
  accountCenter: Partial<AccountCenter>,
  api: KyInstance = authedAdminApi
) =>
  api
    .patch('account-center', {
      json: accountCenter,
    })
    .json<AccountCenter>();
