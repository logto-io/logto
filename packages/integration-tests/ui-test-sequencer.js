import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const Sequencer = require('@jest/test-sequencer').default;

const bootstrapTestSuitePathSuffix = '/bootstrap.test.js';

class CustomSequencer extends Sequencer {
  sort(tests) {
    // Let the bootstrap test suite does its job first
    const bootstrap = tests.filter(({ path }) => path.endsWith(bootstrapTestSuitePathSuffix));
    return [
      ...bootstrap,
      ...tests.filter(({ path }) => !path.endsWith(bootstrapTestSuitePathSuffix)),
    ].filter(Boolean);
  }
}

export default CustomSequencer;
