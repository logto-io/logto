import { webcrypto } from 'node:crypto';
// eslint-disable-next-line n/prefer-global/text-encoder, n/prefer-global/text-decoder -- Node's implementations are assigned to the jsdom global
import { TextEncoder, TextDecoder, transferableAbortController } from 'node:util';

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
global.TextDecoder = TextDecoder;
// Node 26's `Request` only accepts its own `AbortSignal`, while jsdom provides a separate
// implementation. Use Node's constructors so requests created by the router pass validation.
const nodeAbortController = transferableAbortController();
// @ts-expect-error -- Node's constructors are compatible with the jsdom globals at runtime
global.AbortController = nodeAbortController.constructor;
// @ts-expect-error -- Node's constructors are compatible with the jsdom globals at runtime
global.AbortSignal = nodeAbortController.signal.constructor;
/* eslint-enable @silverhand/fp/no-mutation */
