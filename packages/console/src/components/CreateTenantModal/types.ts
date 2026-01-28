import { type TenantModel } from '@logto/schemas';

export type CreateTenantData = Pick<TenantModel, 'name' | 'tag'> & {
  instanceId: string;
  regionName: string;
  /** Custom tenant ID suffix (without prefix). Only for private regions with customTenantIdPrefix. */
  tenantIdSuffix?: string;
};
