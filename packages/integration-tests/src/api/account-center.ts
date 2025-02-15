import { AccountCenterControlValue, type AccountCenter } from '@logto/schemas';
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

export const disableAccountCenter = async (api: KyInstance = authedAdminApi) => {
  await updateAccountCenter(
    {
      enabled: false,
      fields: {},
    },
    api
  );
};

export const enableAllAccountCenterFields = async (api: KyInstance = authedAdminApi) => {
  await updateAccountCenter(
    {
      enabled: true,
      fields: {
        name: AccountCenterControlValue.Edit,
        username: AccountCenterControlValue.Edit,
        email: AccountCenterControlValue.Edit,
        phone: AccountCenterControlValue.Edit,
        password: AccountCenterControlValue.Edit,
        avatar: AccountCenterControlValue.Edit,
        profile: AccountCenterControlValue.Edit,
        social: AccountCenterControlValue.Edit,
        customData: AccountCenterControlValue.Edit,
      },
    },
    api
  );
};
