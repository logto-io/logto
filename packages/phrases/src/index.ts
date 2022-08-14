import { NormalizeKeyPaths } from '@silverhand/essentials';

import en from './locales/en';
import fr from './locales/fr';
import koKR from './locales/ko-kr';
import trTR from './locales/tr-tr';
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
  [Language.French]: fr,
  [Language.Chinese]: zhCN,
  [Language.Korean]: koKR,
  [Language.Turkish]: trTR,
};

export default resource;
