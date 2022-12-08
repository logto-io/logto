// Import type { Config } from '@silverhand/jest-config';

const config = {
  coveragePathIgnorePatterns: ['/node_modules/', '/lib/', '/build/', '/src/__mocks__/'],
  coverageReporters: ['text-summary', 'lcov'],
  roots: ['./lib'],
  moduleNameMapper: {
    '^(chalk|inquirer)$': '<rootDir>/../shared/lib/utils/module-proxy.js',
  },
};

export default config;
