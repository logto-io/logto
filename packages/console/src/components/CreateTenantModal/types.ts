import { type TenantModel } from '@logto/schemas';

import { type RegionName } from '@/components/Region';

export type CreateTenantData = Pick<TenantModel, 'name' | 'tag'> & {
  regionName: RegionName;
};
