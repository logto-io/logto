import { CreateLogtoConfig } from '../db-entries/index.js';
import { AppearanceMode } from '../foundations/index.js';
import type { AdminConsoleData } from '../types/index.js';
import { AdminConsoleConfigKey } from '../types/index.js';

export const createDefaultAdminConsoleConfig = (
  forTenantId: string
): Readonly<{
  tenantId: string;
  key: AdminConsoleConfigKey;
  value: AdminConsoleData;
}> =>
  Object.freeze({
    tenantId: forTenantId,
    key: AdminConsoleConfigKey.AdminConsole,
    value: {
      language: 'en',
      appearanceMode: AppearanceMode.SyncWithSystem,
      livePreviewChecked: false,
      applicationCreated: false,
      signInExperienceCustomized: false,
      passwordlessConfigured: false,
      selfHostingChecked: false,
      communityChecked: false,
      m2mApplicationCreated: false,
    },
  } satisfies CreateLogtoConfig);
