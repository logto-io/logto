import { NormalizeKeyPaths } from '@silverhand/essentials';

import en from './locales/en';
import fr from './locales/fr';
import koKR from './locales/ko-kr';
import ptPT from './locales/pt-pt';
import trTR from './locales/tr-tr';
import zhCN from './locales/zh-cn';
import { Resource, Translation } from './types';

export * from './types';

export type I18nKey = NormalizeKeyPaths<Translation>;

const resource: Resource = {
  en,
  fr,
  'pt-PT': ptPT,
  'zh-CN': zhCN,
  'ko-KR': koKR,
  'tr-TR': trTR,
};

export default resource;
