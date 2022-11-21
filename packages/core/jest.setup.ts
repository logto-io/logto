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

/**
 * Mocking `import.meta.url` and `got` here since they inevitably needs native ESM, but jest is sticking with CJS.
 * Will figure out a way to run tests in native ESM mode.
 */

jest.mock('./src/connectors/meta-url.js', () => ({
  metaUrl: 'file:///',
}));

jest.mock('../cli/lib/meta-url.js', () => ({
  metaUrl: 'file:///',
}));

jest.mock('../cli/lib/commands/database/alteration/meta-url.js', () => ({
  metaUrl: 'file:///',
}));

jest.mock('got', () => ({
  got: {},
}));
