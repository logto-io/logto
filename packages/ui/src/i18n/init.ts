import resources from '@logto/phrases-ui';
import { LanguageInfo } from '@logto/schemas';
import i18next, { InitOptions } from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

const initI18n = async (languageSettings?: LanguageInfo) => {
  const baseOptions: InitOptions = {
    resources,
    fallbackLng: languageSettings?.fallbackLanguage ?? 'en',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      lookupLocalStorage: 'i18nextLogtoUILng',
      lookupSessionStorage: 'i18nextLogtoUILng',
    },
  };

  const options: InitOptions =
    languageSettings?.autoDetect === false
      ? { ...baseOptions, lng: languageSettings.fixedLanguage }
      : baseOptions;

  const i18n = i18next.use(initReactI18next).use(LanguageDetector).init(options);

  // @ts-expect-error - i18next doesn't have a type definition for this. called after i18next is initialized
  i18next.services.formatter.add('zhOrSpaces', (value: string, lng) => {
    if (lng !== 'zh-CN') {
      return value;
    }

    return value.replaceAll(/或/g, ' 或 ');
  });

  return i18n;
};

export default initI18n;
