import resources from '@logto/phrases';
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
  };

  const options: InitOptions =
    languageSettings?.autoDetect === false
      ? { ...baseOptions, lng: languageSettings.fixedLanguage }
      : baseOptions;

  return i18next.use(initReactI18next).use(LanguageDetector).init(options);
};

export default initI18n;
