/**
 * Setup environment variables for unit test
 */

import en from '@logto/phrases/lib/locales/en/index.js';
import { createMockUtils } from '@logto/shared/esm';
import { init } from 'i18next';

const { jest } = import.meta;
const { mockEsm, mockEsmDefault } = createMockUtils(jest);

process.env.DB_URL = 'postgres://mock.db.url';
process.env.ENDPOINT = 'https://logto.test';
process.env.NODE_ENV = 'test';

/* Mock for EnvSet */
mockEsm('#src/libraries/logto-config.js', () => ({
  createLogtoConfigLibrary: () => ({ getOidcConfigs: () => ({}) }),
}));

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
