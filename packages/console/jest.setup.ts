import { webcrypto } from 'node:crypto';
// eslint-disable-next-line n/prefer-global/text-encoder, n/prefer-global/text-decoder -- jsdom does not expose these globals, so the Node implementations are injected below.
import { TextEncoder, TextDecoder } from 'node:util';

import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

void i18next.use(initReactI18next).init({
  // Simple resources for testing
  resources: { en: { translation: { admin_console: { general: { add: 'Add' } } } } },
  lng: 'en',
  react: { useSuspense: false },
});

/* eslint-disable @silverhand/fp/no-mutation */
// @ts-expect-error monkey-patch for `crypto`
crypto.subtle = webcrypto.subtle;
global.TextEncoder = TextEncoder;
// @ts-expect-error monkey-patch for `TextEncoder`/`TextDecoder`
global.TextDecoder = TextDecoder;
/* eslint-enable @silverhand/fp/no-mutation */

// Node 26 creates `AbortSignal`s from its own realm, so jsdom's `instanceof AbortSignal` check
// (used by React Router's client requests) rejects them. Accept any signal-shaped object instead.
/* eslint-disable @silverhand/fp/no-mutating-methods -- Test-only monkey patch; there is no non-mutating way to override `Symbol.hasInstance`. */
Object.defineProperty(AbortSignal, Symbol.hasInstance, {
  value: (value: unknown) =>
    typeof value === 'object' &&
    value !== null &&
    'aborted' in value &&
    'addEventListener' in value &&
    typeof value.addEventListener === 'function',
});
/* eslint-enable @silverhand/fp/no-mutating-methods */
