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
      checkDemo: false,
      createApplication: false,
      configurePasswordless: false,
      configureSocialSignIn: false,
      customizeSignInExperience: false,
      checkFurtherReadings: false,
    },
  });
