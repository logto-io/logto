import type { TenantInfo } from '@logto/schemas';

import { cloudApi } from './api.js';

export const createTenant = async (accessToken: string) => {
  return cloudApi
    .extend({
      headers: { authorization: `Bearer ${accessToken}` },
    })
    .post('tenants')
    .json<TenantInfo>();
};

export const getTenants = async (accessToken: string) => {
  return cloudApi
    .extend({
      headers: { authorization: `Bearer ${accessToken}` },
    })
    .get('tenants')
    .json<TenantInfo[]>();
};
