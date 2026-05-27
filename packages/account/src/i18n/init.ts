import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

i18next.use(initReactI18next);

/**
 * Initialize i18next without fetching phrase bundles.
 * Remote phrases are loaded once in PageContextProvider via changeLanguage().
 */
const initI18n = async () => {
  if (i18next.isInitialized) {
    return;
  }

  await i18next.init({
    resources: {},
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });
};

export default initI18n;
