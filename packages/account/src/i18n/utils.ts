import resource, { type LocalePhrase } from '@logto/phrases-experience';
import type { LanguageInfo } from '@logto/schemas';
import type { Resource } from 'i18next';
import i18next from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import { getPhrases as getPhrasesApi } from '@ac/apis/phrases';
import { getUiLocales } from '@ac/utils/account-center-route';

const storageKey = 'i18nextLogtoUiLng';

export const detectLanguage = (languageSettings?: LanguageInfo) => {
  if (languageSettings?.autoDetect === false) {
    return languageSettings.fallbackLanguage;
  }

  const languageDetector = new LanguageDetector();
  languageDetector.init(
    { languageUtils: {} },
    {
      lookupLocalStorage: storageKey,
      lookupSessionStorage: storageKey,
    }
  );

  return languageDetector.detect();
};

export const getPreferredLanguage = ({
  languageSettings,
  uiLocales,
}: {
  languageSettings?: LanguageInfo;
  uiLocales?: string;
}): string | undefined => {
  const normalizedUiLocales = uiLocales?.trim();

  if (normalizedUiLocales) {
    return normalizedUiLocales;
  }

  if (languageSettings?.autoDetect === false) {
    return languageSettings.fallbackLanguage;
  }

  return undefined;
};

const getPhrases = async (language?: string) => {
  const uiLocales = getUiLocales();
  const preferredLanguage = language ?? uiLocales;
  const detectedLanguage = detectLanguage();
  const response = await getPhrasesApi({
    localLanguage: Array.isArray(detectedLanguage) ? detectedLanguage.join(' ') : detectedLanguage,
    language: preferredLanguage,
  });

  const remotePhrases = await response.json<LocalePhrase>();
  const lng = response.headers.get('Content-Language');

  if (!lng) {
    throw new Error('lng not found');
  }

  return { phrases: remotePhrases, lng };
};

export const getI18nResource = async (
  language?: string
): Promise<{ resources: Resource; lng: string }> => {
  try {
    const { phrases, lng } = await getPhrases(language);

    return {
      resources: { [lng]: phrases },
      lng,
    };
  } catch {
    return {
      resources: { en: resource.en },
      lng: 'en',
    };
  }
};

export const changeLanguage = async (language?: string) => {
  const { resources, lng } = await getI18nResource(language);

  for (const [namespace, resource] of Object.entries(resources[lng] ?? {})) {
    i18next.addResourceBundle(lng, namespace, resource);
  }

  await i18next.changeLanguage(lng);
};
