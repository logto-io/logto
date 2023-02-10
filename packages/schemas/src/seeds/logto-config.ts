import { CreateLogtoConfig } from '../db-entries/index.js';
import { AppearanceMode } from '../foundations/index.js';
import type { AdminConsoleData } from '../types/index.js';
import { AdminConsoleConfigKey } from '../types/index.js';
import { defaultTenantId } from './tenant.js';

export const createDefaultAdminConsoleConfig = (): Readonly<{
  key: AdminConsoleConfigKey;
  value: AdminConsoleData;
}> =>
  Object.freeze({
    tenantId: defaultTenantId,
    key: AdminConsoleConfigKey.AdminConsole,
    value: {
      language: 'en',
      appearanceMode: AppearanceMode.SyncWithSystem,
      demoChecked: false,
      applicationCreated: false,
      signInExperienceCustomized: false,
      passwordlessConfigured: false,
      socialSignInConfigured: false,
      furtherReadingsChecked: false,
    },
  } satisfies CreateLogtoConfig);
