import { CreateSetting } from '../db-entries';

export const defaultSettingId = 'default';

export const createDefaultSetting = (customDomain: string): Readonly<CreateSetting> =>
  Object.freeze({
    id: defaultSettingId,
    customDomain,
    adminConsole: {},
  });
