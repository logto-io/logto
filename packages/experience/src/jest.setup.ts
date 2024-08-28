// https://jestjs.io/docs/manual-mocks#mocking-methods-which-are-not-implemented-in-jsdom

import { type LocalePhrase } from '@logto/phrases-experience';
import { type DeepPartial } from '@silverhand/essentials';
import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

// eslint-disable-next-line @silverhand/fp/no-mutating-methods
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    media: query,
    onchange: null,
    addListener: jest.fn(), // Deprecated
    removeListener: jest.fn(), // Deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

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
