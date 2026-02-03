import { type TenantModel } from '@logto/schemas/models';

export type TenantSettingsForm = {
  profile: Pick<TenantModel, 'name' | 'tag'> & {
    regionName: string;
  };
  settings: {
    isMfaRequired: boolean;
  };
};
