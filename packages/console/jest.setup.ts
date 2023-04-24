import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

void i18next.use(initReactI18next).init({
  // Simple resources for testing
  resources: { en: { translation: { admin_console: { general: { add: 'Add' } } } } },
  lng: 'en',
  react: { useSuspense: false },
});
