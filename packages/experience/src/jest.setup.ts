import { type LocalePhrase } from '@logto/phrases-experience';
import { ssrPlaceholder } from '@logto/schemas';
import { type DeepPartial } from '@silverhand/essentials';
import i18next from 'i18next';
import { createElement, forwardRef, type ReactNode } from 'react';
import { initReactI18next } from 'react-i18next';
import ReactModal from 'react-modal';

// Ensure react-modal has an appElement in test env to prevent accessibility warning.
if (typeof document !== 'undefined') {
  ReactModal.setAppElement(document.body);
}

// Mock overlayscrollbars-react to prevent warning
jest.mock('overlayscrollbars-react', () => {
  const OverlayScrollbarsComponent = forwardRef<HTMLDivElement, Readonly<{ children?: ReactNode }>>(
    ({ children }, ref) => createElement('div', { ref }, children)
  );
  return { __esModule: true, OverlayScrollbarsComponent };
});

// Mock @simplewebauthn/browser to avoid ESM parsing issues in Jest and provide stable stubs
jest.mock('@simplewebauthn/browser', () => ({
  __esModule: true,
  WebAuthnAbortService: class WebAuthnAbortService {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    abort() {}
  },
  WebAuthnError: class WebAuthnError extends Error {},
  base64URLStringToBuffer: (value: string) => new Uint8Array(Buffer.from(value)),
  bufferToBase64URLString: (value: ArrayBuffer | Uint8Array) =>
    Buffer.from(new Uint8Array(value)).toString('base64url'),
  browserSupportsWebAuthn: () => true,
  browserSupportsWebAuthnAutofill: () => true,
  platformAuthenticatorIsAvailable: async () => true,
  startAuthentication: async () => ({}),
  startRegistration: async () => ({}),
}));

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
