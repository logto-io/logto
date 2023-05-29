import type { CreateTenant, TenantInfo } from '@logto/schemas';

import { cloudApi } from './api.js';

export const createTenant = async (
  accessToken: string,
  payload: Required<Pick<CreateTenant, 'name' | 'tag'>>
) => {
  return cloudApi
    .extend({
      headers: { authorization: `Bearer ${accessToken}` },
    })
    .post('tenants', { json: payload })
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
