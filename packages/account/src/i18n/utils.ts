import { matchSupportedLanguageTag } from '@logto/language-kit';
import { builtInLanguages, type BuiltInLanguageTag } from '@logto/phrases-experience';
import type { LanguageInfo } from '@logto/schemas';
import i18next from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const storageKey = 'i18nextLogtoUiLng';

export const resolveLanguage = (language?: string): BuiltInLanguageTag | undefined =>
  language
    ? builtInLanguages.find(
        (tag): tag is BuiltInLanguageTag =>
          tag === matchSupportedLanguageTag([language], builtInLanguages).match
      )
    : undefined;

export const resolveUiLocalesLanguage = (uiLocales?: string) => {
  if (!uiLocales) {
    return;
  }

  return uiLocales
    .trim()
    .split(/\s+/)
    .map((language) => resolveLanguage(language))
    .find(Boolean);
};

const detectLanguages = () => {
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
    return detected;
  }

  return detected ? [detected] : [];
};

export const detectLanguage = (languageSettings?: LanguageInfo) => {
  if (languageSettings?.autoDetect === false) {
    return resolveLanguage(languageSettings.fallbackLanguage) ?? 'en';
  }

  return matchSupportedLanguageTag(detectLanguages(), builtInLanguages).match ?? 'en';
};

export const getPreferredLanguage = ({
  languageSettings,
  uiLocales,
}: {
  languageSettings?: LanguageInfo;
  uiLocales?: string;
}) => resolveUiLocalesLanguage(uiLocales) ?? detectLanguage(languageSettings);

export const changeLanguage = async (language: string) => {
  await i18next.changeLanguage(resolveLanguage(language) ?? 'en');
};
