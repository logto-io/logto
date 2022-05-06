import { Language } from '@logto/phrases';

import { CreateSetting } from '../db-entries';
import { AppearanceMode } from '../foundations';

export const defaultSettingId = 'default';

export const createDefaultSetting = (): Readonly<CreateSetting> =>
  Object.freeze({
    id: defaultSettingId,
    adminConsole: {
      language: Language.English,
      appearanceMode: AppearanceMode.SyncWithSystem,
    },
  });
