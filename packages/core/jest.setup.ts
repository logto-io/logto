/**
 * Setup environment variables for unit test
 */

import envSet from '#src/env-set/index.js';

jest.mock('#src/lib/logto-config.js');
jest.mock('#src/env-set/check-alteration-state.js');

// eslint-disable-next-line unicorn/prefer-top-level-await
(async () => {
  await envSet.load();
})();
