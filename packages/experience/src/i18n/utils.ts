import type { LocalePhrase } from '@logto/phrases-experience';
import resource from '@logto/phrases-experience';
import type { LanguageInfo } from '@logto/schemas';
import type { Resource } from 'i18next';
import i18next from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import { getPhrases } from '@/apis/settings';

export const getI18nResource = async (
  language?: string
): Promise<{ resources: Resource; lng: string }> => {
  const detectedLanguage = detectLanguage();

  try {
    const response = await getPhrases({
      localLanguage: Array.isArray(detectedLanguage)
        ? detectedLanguage.join(' ')
        : detectedLanguage,
      language,
    });

    const phrases = await response.json<LocalePhrase>();
    const lng = response.headers.get('Content-Language');

    if (!lng) {
      throw new Error('lng not found');
    }

    return {
      resources: { [lng]: phrases },
      lng,
    };
  } catch {
    // Fallback to build in en
    return {
      resources: { en: resource.en },
      lng: 'en',
    };
  }
};

const storageKey = 'i18nextLogtoUiLng';

export const detectLanguage = (languageSettings?: LanguageInfo) => {
  if (languageSettings?.autoDetect === false) {
    return languageSettings.fallbackLanguage;
  }

  const languageDetector = new LanguageDetector();
  languageDetector.init(
    // Pass in a empty i18n languageUtils server instance to bypass the [languageDetector detection](https://github.com/i18next/i18next-browser-languageDetector/blob/master/src/index.js#L70)
    { languageUtils: {} },
    {
      lookupLocalStorage: storageKey,
      lookupSessionStorage: storageKey,
    }
  );

  return languageDetector.detect();
};

// Must be called after i18n's initialization
export const changeLanguage = async (language: string) => {
  const { resources, lng } = await getI18nResource(language);

  for (const [namespace, resource] of Object.entries(resources[lng] ?? {})) {
    i18next.addResourceBundle(lng, namespace, resource);
  }

  await i18next.changeLanguage(lng);
};
