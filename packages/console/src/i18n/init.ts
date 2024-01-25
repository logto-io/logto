import type { LanguageTag } from '@logto/language-kit';
import resources from '@logto/phrases';
import experienceResource from '@logto/phrases-experience';
import i18next from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

const initI18n = async (language?: LanguageTag) => {
  await i18next
    .use(initReactI18next)
    .use(LanguageDetector)
    .init({
      /*
       * I18n can not load extra namespaces with a non-empty resources value given on init.
       * In order to load experiences' namespace we need to pass empty resources on init and load them later.
       */
      resources: {},
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

  // Load phrases
  for (const [language, values] of Object.entries(resources)) {
    i18next.addResourceBundle(language, 'translation', values.translation, true);
    i18next.addResourceBundle(language, 'errors', values.errors, true);
  }

  // Load phrases-experience
  for (const [language, values] of Object.entries(experienceResource)) {
    i18next.addResourceBundle(language, 'experience', values.translation, true);
  }
};

export default initI18n;
