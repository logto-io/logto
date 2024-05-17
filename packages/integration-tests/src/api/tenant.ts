import { type TenantTag } from '@logto/schemas';
import type { TenantModel } from '@logto/schemas/models';

import { cloudApi } from './api.js';

// TODO: Import from cloud package after it's created
type TenantInfo = Pick<TenantModel, 'id' | 'name' | 'tag' | 'isSuspended' | 'createdAt'>;

export const createTenant = async (
  accessToken: string,
  payload: { name: string; tag: TenantTag }
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

export const updateTenant = async (
  accessToken: string,
  tenantId: string,
  payload: { name?: string; tag?: TenantTag }
) => {
  return cloudApi
    .extend({
      headers: { authorization: `Bearer ${accessToken}` },
    })
    .patch(`tenants/${tenantId}`, { json: payload })
    .json<TenantInfo>();
};

export const deleteTenant = async (accessToken: string, tenantId: string) => {
  return cloudApi
    .extend({
      headers: { authorization: `Bearer ${accessToken}` },
    })
    .delete(`tenants/${tenantId}`)
    .json();
};
