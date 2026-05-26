import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

import { getI18nResource } from '@ac/i18n/utils';

i18next.use(initReactI18next);

const initI18n = async (initialLanguage?: string) => {
  const { resources, lng } = await getI18nResource(initialLanguage);

  await i18next.init({
    resources,
    lng,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });
};

export default initI18n;
