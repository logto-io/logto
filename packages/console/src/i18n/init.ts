import type { LanguageTag } from '@logto/language-kit';
import resources from '@logto/phrases';
import i18next from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

const initI18n = async (language?: LanguageTag) =>
  i18next
    .use(initReactI18next)
    .use(LanguageDetector)
    .init({
      resources,
      fallbackLng: 'en',
      interpolation: {
        escapeValue: false,
      },
      lng: language,
      detection: {
        lookupLocalStorage: 'i18nextLogtoAcLng',
        lookupSessionStorage: 'i18nextLogtoAcLng',
      },
    });

export default initI18n;
