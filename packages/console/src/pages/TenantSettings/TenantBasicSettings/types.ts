import { type TenantModel } from '@logto/schemas/models';

import { type RegionName } from '@/components/Region';

export type TenantSettingsForm = {
  profile: Pick<TenantModel, 'name' | 'tag'> & {
    regionName: RegionName;
  };
};
