import { NormalizeKeyPaths } from '@silverhand/essentials';

import en from './locales/en';
import fr from './locales/fr';
import koKR from './locales/ko-kr';
import trTR from './locales/tr-tr';
import zhCN from './locales/zh-cn';
import { Resource, Language } from './types';

export { Language, languageOptions } from './types';

export type I18nKey = NormalizeKeyPaths<typeof en.translation>;

const resource: Resource = {
  [Language.English]: en,
  [Language.French]: fr,
  [Language.Chinese]: zhCN,
  [Language.Korean]: koKR,
  [Language.Turkish]: trTR,
};

export default resource;
