import { webcrypto } from 'node:crypto';
// eslint-disable-next-line n/prefer-global/text-encoder, n/prefer-global/text-decoder -- JSDOM needs explicit Node globals.
import { TextEncoder, TextDecoder } from 'node:util';

import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

void i18next.use(initReactI18next).init({
  // Simple resources for testing
  resources: { en: { translation: { admin_console: { general: { add: 'Add' } } } } },
  lng: 'en',
  react: { useSuspense: false },
});

// JSDOM does not implement `matchMedia`, which the theme provider reads at module scope.
/* eslint-disable @silverhand/fp/no-mutating-methods -- JSDOM lacks matchMedia, so the test environment must provide it. */
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  }),
});
/* eslint-enable @silverhand/fp/no-mutating-methods */

/* eslint-disable @silverhand/fp/no-mutation */
// @ts-expect-error monkey-patch for `crypto`
crypto.subtle = webcrypto.subtle;
global.TextEncoder = TextEncoder;
// @ts-expect-error monkey-patch for `TextEncoder`/`TextDecoder`
global.TextDecoder = TextDecoder;
/* eslint-enable @silverhand/fp/no-mutation */
