/**
 * Setup environment variables for unit test
 */

import { expect } from '@jest/globals';
import en from '@logto/phrases/lib/locales/en/index.js';
import { createMockUtils } from '@logto/shared/esm';
import { init } from 'i18next';

const { jest } = import.meta;
const { mockEsm, mockEsmDefault } = createMockUtils(jest);

process.env.DB_URL = 'postgres://mock.db.url';
process.env.ENDPOINT = 'https://logto.test';
process.env.NODE_ENV = 'test';

/* Mock for EnvSet */
// The Logto config library unit test exercises the real module; other suites keep EnvSet isolated
// from config persistence through this lightweight mock.
if (!expect.getState().testPath.endsWith('/libraries/logto-config.test.js')) {
  mockEsm('#src/libraries/logto-config.js', () => ({
    createLogtoConfigLibrary: () => ({
      getOidcConfigs: () => ({}),
      getAction: jest.fn(),
      promoteScheduledSigningKeyRotation: jest.fn(),
    }),
  }));
}

mockEsm('#src/env-set/preconditions.js', () => ({
  checkPreconditions: () => true,
}));

// eslint-disable-next-line unicorn/consistent-function-scoping
mockEsmDefault('#src/env-set/oidc.js', () => () => ({
  issuer: 'https://logto.test/oidc',
  cookieKeys: [],
  privateJwks: [],
  publicJwks: [],
}));
/* End */

// Logger is not considered in all test cases
// eslint-disable-next-line unicorn/consistent-function-scoping
mockEsm('koa-logger', () => ({ default: () => (_, next) => next() }));

// Init i18next and load en locale only
await init({
  fallbackLng: 'en',
  supportedLngs: ['en'],
  resources: { en },
});
