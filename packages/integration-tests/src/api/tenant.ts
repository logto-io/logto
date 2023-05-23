import type { TenantInfo } from '@logto/schemas';

import { cloudApi } from './api.js';

export const createTenantForAdminRole = async (accessToken: string) => {
  return cloudApi
    .extend({
      headers: { authorization: `Bearer ${accessToken}` },
    })
    .post('tenants')
    .json<TenantInfo>();
};

export const getTenantsForAdminRole = async (accessToken: string) => {
  return cloudApi
    .extend({
      headers: { authorization: `Bearer ${accessToken}` },
    })
    .get('tenants')
    .json<TenantInfo[]>();
};

export const createTenantForUserRole = async (accessToken: string) => {
  return cloudApi
    .extend({
      headers: { authorization: `Bearer ${accessToken}` },
    })
    .post('tenants')
    .json<TenantInfo>();
};

export const getTenantsForUserRole = async (accessToken: string) => {
  return cloudApi
    .extend({
      headers: { authorization: `Bearer ${accessToken}` },
    })
    .get('tenants')
    .json<TenantInfo[]>();
};
