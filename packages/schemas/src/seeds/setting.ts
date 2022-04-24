import { Language } from '@logto/phrases';

import { CreateSetting } from '../db-entries';
import { AppearanceMode } from '../foundations';

export const defaultSettingId = 'default';

export const createDefaultSetting = (customDomain: string): Readonly<CreateSetting> =>
  Object.freeze({
    id: defaultSettingId,
    customDomain,
    adminConsole: {
      language: Language.English,
      appearanceMode: AppearanceMode.SyncWithSystem,
    },
  });
