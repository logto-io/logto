import { getEnv } from '@silverhand/essentials';

import { isCloud } from './cloud';

const isProduction = getEnv('NODE_ENV') === 'production';

export const isTenantBasicSettingsReady = !isProduction;

export const isTenantDomainSettingsReady = !isProduction;

export const isTenantSettingsSectionEnabled =
  isCloud && (isTenantBasicSettingsReady || isTenantDomainSettingsReady);
