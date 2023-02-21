import type { InitOptions } from 'i18next';
import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

import { getI18nResource } from '@/i18n/utils';

const initI18n = async () => {
  const { resources, lng } = await getI18nResource();

  const options: InitOptions = {
    resources,
    lng,
    interpolation: {
      escapeValue: false,
    },
  };

  i18next.use(initReactI18next);

  const i18n = i18next.init(options);

  // @ts-expect-error - i18next doesn't have a type definition for this. Must called after i18next is initialized
  i18next.services.formatter.add('zhOrSpaces', (value: string, lng) => {
    if (lng !== 'zh-CN') {
      return value;
    }

    return value.replaceAll(/或/g, ' 或 ');
  });

  return i18n;
};

export default initI18n;
