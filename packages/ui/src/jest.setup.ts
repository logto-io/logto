import { Crypto } from '@peculiar/webcrypto';

// https://jestjs.io/docs/manual-mocks#mocking-methods-which-are-not-implemented-in-jsdom
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

// eslint-disable-next-line @silverhand/fp/no-mutation
global.crypto = new Crypto();

const translation = (key: string) => key;

// eslint-disable-next-line @typescript-eslint/no-unsafe-return
jest.mock('react-i18next', () => ({
  ...jest.requireActual('react-i18next'),
  useTranslation: () => ({
    t: translation,
    i18n: {
      t: translation,
    },
  }),
}));
