/**
 * Setup environment variables for unit test
 */

import envSet from '@/env-set';

jest.mock('@/lib/logto-config');
jest.mock('@/env-set/check-alteration-state');

// eslint-disable-next-line unicorn/prefer-top-level-await
(async () => {
  await envSet.load();
})();
