import type { CreateSetting } from '../db-entries/index.js';
import { AppearanceMode } from '../foundations/index.js';

export const defaultSettingId = 'default';

export const createDefaultSetting = (): Readonly<CreateSetting> =>
  Object.freeze({
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
