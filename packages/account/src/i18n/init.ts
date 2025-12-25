import type { LanguageTag } from '@logto/language-kit';
import resources from '@logto/phrases-experience';
import i18next from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

import { resolveLanguage, storageKey } from '@ac/i18n/utils';

i18next.use(initReactI18next).use(LanguageDetector);

const initI18n = async (initialLanguage?: LanguageTag) => {
  const normalizedLanguage =
    typeof initialLanguage === 'string' ? resolveLanguage(initialLanguage) : undefined;

  await i18next.init({
    resources: {},
    fallbackLng: 'en',
    lng: normalizedLanguage,
    detection: {
      lookupLocalStorage: storageKey,
      lookupSessionStorage: storageKey,
    },
    interpolation: {
      escapeValue: false,
    },
  });

  for (const [language, value] of Object.entries(resources)) {
    i18next.addResourceBundle(language, 'translation', value.translation, true);
  }
};

export default initI18n;
