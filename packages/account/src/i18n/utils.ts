import type { LocalePhrase } from '@logto/phrases-experience';
import type { LanguageInfo } from '@logto/schemas';
import i18next from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import ky from 'ky';

const storageKey = 'i18nextAccountCenterLng';
export { storageKey };

/**
 * Account-center i18n helpers.
 *
 * Language resolution (built-in + custom) is owned by the server via
 * `/.well-known/phrases`, which picks the best match using the same policy as
 * `getExperienceLanguage` and returns the resolved tag in the
 * `Content-Language` response header.  These helpers therefore only collect
 * raw candidate tags (from `ui_locales`, the language-info fallback, the
 * browser detector) and forward them to the server without any client-side
 * filtering, so custom/manually-added languages work identically to built-in
 * ones.
 */

const splitTags = (value?: string): string[] =>
  value ? value.trim().split(/\s+/).filter(Boolean) : [];

/**
 * Collect raw locale candidates from the browser language detector in
 * priority order.
 */
const detectBrowserCandidates = (): string[] => {
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
    return detected.filter((tag): tag is string => typeof tag === 'string' && tag.length > 0);
  }

  return typeof detected === 'string' && detected.length > 0 ? [detected] : [];
};

/**
 * Build the ordered list of raw locale candidates for the server to resolve.
 *
 * Order of precedence, matching the server-side `getExperienceLanguage`
 * policy:
 *   1. `ui_locales` query (space-separated, first-match-wins)
 *   2. Configured fallback language (when auto-detect is disabled)
 *   3. Browser language detector (when auto-detect is enabled)
 *
 * The caller is expected to forward the first entry to
 * `/.well-known/phrases` as the `lng` hint; the rest are carried along so the
 * caller can fall back to them if needed without re-running detection.
 */
export const getPreferredLanguageCandidates = ({
  languageSettings,
  uiLocales,
}: {
  languageSettings?: LanguageInfo;
  uiLocales?: string;
}): string[] => {
  const uiLocaleCandidates = splitTags(uiLocales);

  const settingsCandidates =
    languageSettings?.autoDetect === false
      ? splitTags(languageSettings.fallbackLanguage)
      : detectBrowserCandidates();

  // De-duplicate while preserving order.
  const ordered = [...uiLocaleCandidates, ...settingsCandidates];
  return Array.from(new Set(ordered));
};

/**
 * Thin wrapper preserved for callers that only need a single language hint.
 * Returns the first raw candidate, or `undefined` when nothing is available;
 * the server still performs the final match and returns the resolved tag in
 * `Content-Language`.
 */
export const getPreferredLanguage = (input: {
  languageSettings?: LanguageInfo;
  uiLocales?: string;
}): string | undefined => getPreferredLanguageCandidates(input)[0];

/**
 * Extract the first raw `ui_locales` candidate without any filtering so the
 * server can resolve built-in and custom languages uniformly.
 */
export const resolveUiLocalesLanguage = (uiLocales?: string): string | undefined =>
  splitTags(uiLocales)[0];

/**
 * Fetch merged phrases (built-in base + custom overrides) from the server for
 * a given raw locale candidate list.  The server owns the resolution policy
 * and returns the resolved language tag via the `Content-Language` response
 * header, so custom languages (e.g. Vietnamese, Finnish) resolve identically
 * to built-in ones.
 */
export const changeLanguage = async (
  language: string | readonly string[] | undefined
): Promise<void> => {
  const candidates = typeof language === 'string' ? [language] : [...(language ?? [])];
  const primary = candidates[0];

  const response = await ky.get('/api/.well-known/phrases', {
    searchParams: primary ? { lng: primary } : undefined,
    headers: candidates.length > 0 ? { 'Accept-Language': candidates.join(',') } : undefined,
  });
  const phrases = await response.json<LocalePhrase>();
  // Trust the server's resolved tag.  Fall back to the primary candidate only
  // when the server does not advertise one (e.g. older deployments).
  const lng = response.headers.get('Content-Language') ?? primary ?? 'en';

  for (const [namespace, resource] of Object.entries(phrases)) {
    i18next.addResourceBundle(lng, namespace, resource);
  }

  await i18next.changeLanguage(lng);
};
