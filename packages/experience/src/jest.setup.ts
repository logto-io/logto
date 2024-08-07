import { type LocalePhrase } from '@logto/phrases-experience';
import { ssrPlaceholder } from '@logto/schemas';
import { type DeepPartial } from '@silverhand/essentials';
import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

// Simple resources for testing
const defaultI18nResources: DeepPartial<LocalePhrase> = {
  translation: { action: { agree: 'Agree' } },
};

export const setupI18nForTesting = async (
  enPhrase: DeepPartial<LocalePhrase> = defaultI18nResources
) =>
  i18next.use(initReactI18next).init({
    resources: { en: enPhrase },
    lng: 'en',
    react: { useSuspense: false },
  });

void setupI18nForTesting();

// eslint-disable-next-line @silverhand/fp/no-mutating-methods
Object.defineProperty(global, 'logtoSsr', { value: ssrPlaceholder });
