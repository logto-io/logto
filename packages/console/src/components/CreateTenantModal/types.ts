import { type TenantModel } from '@logto/schemas';

export type CreateTenantData = Pick<TenantModel, 'name' | 'tag'> & {
  regionName: string;
};
