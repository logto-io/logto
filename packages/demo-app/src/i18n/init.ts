import resources from '@logto/phrases';
import type { LanguageKey } from '@logto/shared';
import i18next from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

const initI18n = async (language?: LanguageKey) =>
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
    });

export default initI18n;
