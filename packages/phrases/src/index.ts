import { NormalizeKeyPaths } from '@silverhand/essentials';

import en from './locales/en';
import zhCN from './locales/zh-cn';
import { Resource, Language } from './types';

export { Language, languageOptions, languageEnumGuard } from './types';
export type Translation = typeof en.translation;
export type Errors = typeof en.errors;
export type LogtoErrorCode = NormalizeKeyPaths<Errors>;
export type LogtoErrorI18nKey = `errors:${LogtoErrorCode}`;
export type I18nKey = NormalizeKeyPaths<Translation>;
export type AdminConsoleKey = NormalizeKeyPaths<typeof en.translation.admin_console>;

const resource: Resource = {
  [Language.English]: en,
  [Language.Chinese]: zhCN,
};

export default resource;
