import type { InitOptions } from 'i18next';
import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

import { getI18nResource } from '@/i18n/utils';

// Call once globally
i18next.use(initReactI18next);

const initI18n = async (initialLanguage?: string) => {
  const { resources, lng } = await getI18nResource(initialLanguage);

  const options: InitOptions = {
    resources,
    lng,
    interpolation: {
      escapeValue: false,
    },
  };

  const i18n = i18next.init(options);

  /**
   * Note
   * - Must call after i18next is initialized
   * - Don't worry to call this multiple times, i18next will replace the formatter if it's already added.
   */
  i18next.services.formatter?.add('zhOrSpaces', (value: string, lng) => {
    if (lng !== 'zh-CN') {
      return value;
    }

    return value.replaceAll(/或/g, ' 或 ');
  });

  return i18n;
};

export default initI18n;
