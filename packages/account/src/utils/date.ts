import type { Locale } from 'date-fns';
import {
  ar,
  de,
  enUS,
  es,
  fr,
  it,
  ja,
  ko,
  pl,
  ptBR,
  pt,
  ru,
  th,
  tr,
  uk,
  zhCN,
  zhHK,
  zhTW,
} from 'date-fns/locale';

const localeMap: Record<string, Locale> = {
  ar,
  de,
  en: enUS,
  es,
  fr,
  it,
  ja,
  ko,
  'pl-pl': pl,
  'pt-br': ptBR,
  'pt-pt': pt,
  ru,
  th,
  tr,
  'tr-tr': tr,
  'uk-ua': uk,
  'zh-cn': zhCN,
  'zh-hk': zhHK,
  'zh-tw': zhTW,
};

export const getDateFnsLocale = (language: string): Locale =>
  localeMap[language.toLowerCase()] ?? enUS;
