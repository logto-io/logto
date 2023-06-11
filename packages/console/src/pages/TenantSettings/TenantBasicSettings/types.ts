import { type TenantInfo } from '@logto/schemas';

export type TenantSettingsForm = {
  profile: Pick<TenantInfo, 'name' | 'tag'>;
};
