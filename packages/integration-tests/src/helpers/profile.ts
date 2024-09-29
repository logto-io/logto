import { type LogtoConfig } from '@logto/node';

import { baseAdminTenantApi } from '../api/api.js';

import { initClientAndSignIn } from './admin-tenant.js';

export const signInAndGetUserApi = async (
  username: string,
  password: string,
  config?: Partial<LogtoConfig>
) => {
  const client = await initClientAndSignIn(username, password, config);
  const accessToken = await client.getAccessToken();

  return baseAdminTenantApi.extend({
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
};
