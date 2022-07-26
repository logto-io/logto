import { NormalizeKeyPaths } from '@silverhand/essentials';

import en from './locales/en';
import koKR from './locales/ko-kr';
import zhCN from './locales/zh-cn';
import { Resource, Language } from './types';

export { Language, languageOptions } from './types';

export type I18nKey = NormalizeKeyPaths<typeof en.translation>;

const resource: Resource = {
  [Language.English]: en,
  [Language.Chinese]: zhCN,
  [Language.Korean]: koKR,
};

export default resource;
