/**
 * Setup environment variables for unit test
 */

import envSet from '@/env-set';

import { privateKeyPath } from './jest.global-setup';

// eslint-disable-next-line unicorn/prefer-top-level-await
(async () => {
  process.env = {
    ...process.env,
    OIDC_PRIVATE_KEY_PATHS: privateKeyPath,
    OIDC_COOKIE_KEYS: '["LOGTOSEKRIT1"]',
  };
  await envSet.load();
})();
