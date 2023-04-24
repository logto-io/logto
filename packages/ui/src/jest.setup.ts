// https://jestjs.io/docs/manual-mocks#mocking-methods-which-are-not-implemented-in-jsdom

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

void i18next.use(initReactI18next).init({
  // Simple resources for testing
  resources: { en: { translation: { action: { agree: 'Agree' } } } },
  lng: 'en',
  react: { useSuspense: false },
});
