import { isBuiltInLanguageTag } from '@logto/phrases-experience';
import type { LanguageInfo } from '@logto/schemas';
import i18next from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const storageKey = 'i18nextAccountCenterLng';
export { storageKey };

export const resolveLanguage = (language?: string) =>
  language && isBuiltInLanguageTag(language) ? language : undefined;

export const detectLanguage = (languageSettings?: LanguageInfo) => {
  if (languageSettings?.autoDetect === false) {
    return resolveLanguage(languageSettings.fallbackLanguage) ?? 'en';
  }

  const languageDetector = new LanguageDetector();
  languageDetector.init(
    { languageUtils: {} },
    {
      lookupLocalStorage: storageKey,
      lookupSessionStorage: storageKey,
    }
  );

  const detected = languageDetector.detect();

  if (Array.isArray(detected)) {
    const matched = detected.find((language) => isBuiltInLanguageTag(language));
    return matched ?? 'en';
  }

  return resolveLanguage(detected) ?? 'en';
};

export const changeLanguage = async (language: string) => {
  await i18next.changeLanguage(resolveLanguage(language) ?? 'en');
};
