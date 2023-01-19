import type { CreateSetting } from '../db-entries/index.js';
import { AppearanceMode } from '../foundations/index.js';
import { defaultTenantId } from './tenant.js';

export const defaultSettingId = 'default';

export const createDefaultSetting = (): Readonly<CreateSetting> =>
  Object.freeze({
    tenantId: defaultTenantId,
    id: defaultSettingId,
    adminConsole: {
      language: 'en',
      appearanceMode: AppearanceMode.SyncWithSystem,
      demoChecked: false,
      applicationCreated: false,
      signInExperienceCustomized: false,
      passwordlessConfigured: false,
      socialSignInConfigured: false,
      furtherReadingsChecked: false,
    },
  });
