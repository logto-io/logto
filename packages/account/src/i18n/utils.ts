import { languages as allLanguageTags, matchSupportedLanguageTag } from '@logto/language-kit';
import type { LocalePhrase } from '@logto/phrases-experience';
import { builtInLanguages, isBuiltInLanguageTag } from '@logto/phrases-experience';
import type { LanguageInfo } from '@logto/schemas';
import i18next from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import ky from 'ky';

const storageKey = 'i18nextAccountCenterLng';
export { storageKey };

/**
 * All language tags the system knows about, including both built-in languages and
 * those available for manual/custom addition (e.g. Vietnamese, Finnish, etc.).
 */
const allSupportedTags = Object.keys(allLanguageTags);

/**
 * Resolve a raw language string to the best matching supported language tag.
 * Checks built-in languages first, then falls back to the full language-kit
 * catalogue so that manually added locales (custom phrases) are also accepted.
 */
export const resolveLanguage = (language?: string): string | undefined => {
  if (!language) {
    return;
  }

  // Try built-in languages first (they always have bundled resources).
  const builtIn = matchSupportedLanguageTag([language], builtInLanguages).match;
  if (builtIn) {
    return builtIn;
  }

  // Fall back to the full language-kit catalogue so custom languages are recognised.
  return matchSupportedLanguageTag([language], allSupportedTags).match;
};

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
    return matchSupportedLanguageTag(detected, allSupportedTags).match ?? 'en';
  }

  return resolveLanguage(detected) ?? 'en';
};

export const getPreferredLanguage = ({
  languageSettings,
  uiLocales,
}: {
  languageSettings?: LanguageInfo;
  uiLocales?: string;
}) => resolveUiLocalesLanguage(uiLocales) ?? detectLanguage(languageSettings);

/**
 * Fetch merged phrases (built-in base + custom overrides) from the server for a
 * given language.  The server's `/.well-known/phrases` endpoint handles the merge.
 */
const fetchPhrases = async (language: string): Promise<LocalePhrase> =>
  ky.get('/api/.well-known/phrases', { searchParams: { lng: language } }).json<LocalePhrase>();

export const changeLanguage = async (language: string) => {
  const resolved = resolveLanguage(language) ?? 'en';

  // For custom (non-built-in) languages we need to pull the phrase bundle from
  // the server because it is not included in the static resource bundle.
  if (!isBuiltInLanguageTag(resolved)) {
    const phrases = await fetchPhrases(resolved);
    i18next.addResourceBundle(resolved, 'translation', phrases.translation, true);
  }

  await i18next.changeLanguage(resolved);
};
