import resources from '@logto/phrases-ui';
import { LanguageInfo } from '@logto/schemas';
import i18next, { InitOptions } from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

const storageKey = 'i18nextLogtoUiLng';

const initI18n = async (languageSettings?: LanguageInfo, isPreview = false) => {
  const options: InitOptions = {
    resources,
    fallbackLng: languageSettings?.fallbackLanguage ?? 'en',
    lng: languageSettings?.autoDetect === false ? languageSettings.fixedLanguage : undefined,
    interpolation: {
      escapeValue: false,
    },
    detection: {
      lookupLocalStorage: storageKey,
      lookupSessionStorage: storageKey,
    },
  };

  i18next.use(initReactI18next);

  // Should not apply auto detect if is preview or fix
  if (!isPreview && !(languageSettings?.autoDetect === false)) {
    i18next.use(LanguageDetector);
  }

  const i18n = i18next.init(options);

  // @ts-expect-error - i18next doesn't have a type definition for this. called after i18next is initialized
  i18next.services.formatter.add('zhOrSpaces', (value: string, lng) => {
    if (lng !== 'zh-CN') {
      return value;
    }

    return value.replaceAll(/或/g, ' 或 ');
  });

  return i18n;
};

export default initI18n;
