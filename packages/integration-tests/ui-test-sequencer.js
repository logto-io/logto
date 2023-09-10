import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const Sequencer = require('@jest/test-sequencer').default;

const bootstrapTestSuitePathSuffix = '/bootstrap.test.js';

class CustomSequencer extends Sequencer {
  sort(tests) {
    const bootstrap = tests.find(({ path }) => path.includes(bootstrapTestSuitePathSuffix));
    return [
      bootstrap,
      ...tests.filter(({ path }) => !path.includes(bootstrapTestSuitePathSuffix)),
    ].filter(Boolean);
  }
}

export default CustomSequencer;
